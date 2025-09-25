import { Purchase, PurchaseDetail, Product } from "../models/index.js";
import { sequelize } from "../models/index.js";

async function createPurchase(req, res) {
  const transaction = await sequelize.transaction();
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("Debe enviar al menos un item en la compra");
    }

    let total = 0;
    const updatedProducts = [];

    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity <= 0) {
        throw new Error("Cada item debe tener productId y quantity > 0");
      }

      const product = await Product.findByPk(item.productId, {
        transaction: transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!product) throw new Error(`Producto ${item.productId} no encontrado`);
      if (product.availableQuantity < item.quantity) {
        throw new Error(`Stock insuficiente para producto ${product.id}`);
      }

      total += parseFloat(product.price) * item.quantity;

      product.availableQuantity -= item.quantity;

      await product.save({ transaction: transaction });

      updatedProducts.push({ product, quantity: item.quantity });
    }

    const purchase = await Purchase.create(
      { clientId: req.body.clientId, total },
      { transaction: transaction }
    );

    for (const { product, quantity } of updatedProducts) {
      await PurchaseDetail.create(
        {
          purchaseId: purchase.id,
          productId: product.id,
          quantity,
          priceAtPurchase: product.price,
        },
        { transaction: transaction }
      );
    }

    await transaction.commit();

    const invoice = await Purchase.findByPk(purchase.id, {
      include: [{ model: PurchaseDetail, include: [Product] }],
    });
    return res.status(201).json({ purchase: invoice });
  } catch (err) {
    await transaction.rollback();
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
