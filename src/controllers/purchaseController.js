import { Purchase, PurchaseDetail, Product } from "../models/index.js";
import { sequelize } from "../models/index.js";

async function createPurchase(req, res) {
  const t = await sequelize.transaction();
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("Debe enviar al menos un item en la compra");
    }

    let total = 0;
    const updatedProducts = [];

    for (const it of items) {
      if (!it.productId || !it.quantity || it.quantity <= 0) {
        throw new Error("Cada item debe tener productId y quantity > 0");
      }

      const prod = await Product.findByPk(it.productId, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      if (!prod) throw new Error(`Producto ${it.productId} no encontrado`);
      if (prod.cantidadDisponible < it.quantity) {
        throw new Error(`Stock insuficiente para producto ${prod.id}`);
      }

      total += parseFloat(prod.precio) * it.quantity;

      prod.cantidadDisponible -= it.quantity;

      await prod.save({ transaction: t });

      // Guardamos referencia para los detalles
      updatedProducts.push({ prod, quantity: it.quantity });
    }

    console.log(total);

    // Crear compra
    const purchase = await Purchase.create(
      { clientId: req.body.clientId, total },
      { transaction: t }
    );

    // Crear detalles
    for (const { prod, quantity } of updatedProducts) {
      await PurchaseDetail.create(
        {
          purchaseId: purchase.id,
          productId: prod.id,
          quantity,
          priceAtPurchase: prod.price,
        },
        { transaction: t }
      );
    }

    await t.commit();

    const invoice = await Purchase.findByPk(purchase.id, {
      include: [{ model: PurchaseDetail, include: [Product] }],
    });
    return res.status(201).json({ purchase: invoice });
  } catch (err) {
    await t.rollback();
    return res.status(400).json({ message: err.message });
  }
}

async function getPurchaseHistory(req, res) {
  const where = {};
  if (req.user.role === "client") {
    where.userId = req.user.id;
  }

  const purchases = await Purchase.findAll({
    where,
    include: [{ model: PurchaseDetail, include: [Product] }],
  });
  res.json(purchases);
}

export default { createPurchase, getPurchaseHistory };
