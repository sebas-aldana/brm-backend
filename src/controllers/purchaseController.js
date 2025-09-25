import { Purchase, PurchaseDetail, Product } from "../models/index.js";
import { sequelize } from "../models/index.js";
import logger from "../utils/logger.js";

async function createPurchase(req, res, next) {
  const transaction = await sequelize.transaction();

  try {
    const { items, clientId } = req.body;
    logger.info("Iniciando proceso de compra", {
      clientId,
      itemCount: items?.length,
    });
    if (!items || !Array.isArray(items) || items.length === 0) {
      const error = new Error("Debe enviar al menos un item en la compra");
      error.status = 400;
      error.code = "NO_ITEMS_PROVIDED";
      throw error;
    }

    let total = 0;
    const updatedProducts = [];

    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity <= 0) {
        const error = new Error(
          "Cada item debe tener productId y quantity > 0"
        );
        error.status = 400;
        error.code = "INVALID_ITEM";
        error.details = { item };
        throw error;
      }

      const product = await Product.findByPk(item.productId, {
        transaction: transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!product) {
        const error = new Error(`Producto ${item.productId} no encontrado`);
        error.status = 404;
        error.code = "PRODUCT_NOT_FOUND";
        error.details = { productId: item.productId };
        throw error;
      }

      if (product.availableQuantity < item.quantity) {
        const error = new Error(
          `Stock insuficiente para el producto ${product.name}`
        );
        error.status = 400;
        error.code = "INSUFFICIENT_STOCK";
        error.details = {
          productId: product.id,
          productName: product.name,
          available: product.availableQuantity,
          requested: item.quantity,
        };
        throw error;
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

    // Obtener la factura completa con los detalles
    const invoice = await Purchase.findByPk(purchase.id, {
      include: [{ model: PurchaseDetail, include: [Product] }],
    });

    logger.info("Compra completada exitosamente", {
      purchaseId: purchase.id,
      clientId,
      total: purchase.total,
      itemCount: items.length,
    });

    return res.status(201).json({ purchase: invoice });
  } catch (err) {
    await transaction.rollback();

    logger.error("Error al procesar la compra", {
      error: err.message,
      code: err.code || "UNKNOWN_ERROR",
      clientId: req.body.clientId,
      stack: process.env.NODE_ENV !== "production" ? err.stack : undefined,
    });

    next(err);
  }
}

async function getPurchaseHistory(req, res, next) {
  try {
    const where = {};
    if (req.user.role === "client") {
      where.clientId = req.user.id;
    }

    logger.debug("Obteniendo historial de compras", {
      userId: req.user.id,
      role: req.user.role,
      filters: where,
    });

    const purchases = await Purchase.findAll({
      where,
      include: [
        {
          model: PurchaseDetail,
          include: [Product],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    logger.info(`Se encontraron ${purchases.length} compras`, {
      userId: req.user.id,
      role: req.user.role,
    });

    res.json(purchases);
  } catch (error) {
    logger.error("Error al obtener el historial de compras", {
      error: error.message,
      userId: req.user?.id,
      stack: process.env.NODE_ENV !== "production" ? error.stack : undefined,
    });
    next(error);
  }
}

export default { createPurchase, getPurchaseHistory };
