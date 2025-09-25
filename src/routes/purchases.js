import express from "express";
import { body } from "express-validator";
import { authMiddleware, requireRole } from "../middlewares/auth.js";
import purchaseController from "../controllers/purchaseController.js";

const router = express.Router();

/**
 * @api {post} /purchases Create a new purchase
 * @apiName CreatePurchase
 * @apiGroup Purchases
 *
 * @apiHeader {String} Authorization Bearer token for authentication
 *
 * @apiBody {Object[]} items Array of items to purchase
 * @apiBody {Number} items.productId Product ID
 * @apiBody {Number} items.quantity Quantity to purchase
 * @apiBody {Number} clientId Client ID making the purchase
 *
 * @apiSuccess (201) {Object} purchase Purchase details
 * @apiSuccess {Number} purchase.id Purchase ID
 * @apiSuccess {String} purchase.date Purchase date (ISO 8601)
 * @apiSuccess {Number} purchase.total Total purchase amount
 * @apiSuccess {String} purchase.createdAt Creation timestamp
 * @apiSuccess {String} purchase.updatedAt Last update timestamp
 * @apiSuccess {Number} purchase.clientId Client ID
 * @apiSuccess {Object[]} purchase.PurchaseItems Array of purchased items
 * @apiSuccess {Number} purchase.PurchaseItems.id Purchase item ID
 * @apiSuccess {Number} purchase.PurchaseItems.purchaseId Purchase ID
 * @apiSuccess {Number} purchase.PurchaseItems.productId Product ID
 * @apiSuccess {Number} purchase.PurchaseItems.quantity Purchased quantity
 * @apiSuccess {Object} purchase.PurchaseItems.Product Product details
 * @apiSuccess {Number} purchase.PurchaseItems.Product.id Product ID
 * @apiSuccess {String} purchase.PurchaseItems.Product.batch Product batch number
 * @apiSuccess {String} purchase.PurchaseItems.Product.name Product name
 * @apiSuccess {Number} purchase.PurchaseItems.Product.price Product price
 * @apiSuccess {Number} purchase.PurchaseItems.Product.availableQuantity Available quantity
 * @apiSuccess {String} purchase.PurchaseItems.Product.entryDate Product entry date (ISO 8601)
 * @apiSuccess {String} purchase.PurchaseItems.Product.createdAt Product creation timestamp
 * @apiSuccess {String} purchase.PurchaseItems.Product.updatedAt Product last update timestamp
 *
 * @apiError (400) {Object} error Validation error
 * @apiError (401) {Object} error Unauthorized
 * @apiError (403) {Object} error Forbidden - Client role required
 * @apiError (404) {Object} error Product not found
 * @apiError (500) {Object} error Server error
 */
router.post(
  "/",
  authMiddleware,
  requireRole("cliente"),
  body("clientId")
    .isInt({ min: 1 })
    .withMessage(
      "El ID del cliente es requerido y debe ser un número positivo"
    ),
  body("items")
    .isArray({ min: 1 })
    .withMessage("Se requiere al menos un producto en la compra"),
  body("items.*.productId")
    .isInt({ min: 1 })
    .withMessage("Cada producto debe tener un ID válido"),
  body("items.*.quantity")
    .isInt({ min: 1 })
    .withMessage("La cantidad debe ser un número entero positivo"),
  purchaseController.createPurchase
);

/**
 * @api {get} /purchases/history Get all purchases (Admin only)
 * @apiName GetPurchaseHistory
 * @apiGroup Purchases
 * @apiPermission admin
 *
 * @apiHeader {String} Authorization Bearer token for authentication
 *
 * @apiSuccess {Object[]} purchases List of all purchases
 * @apiSuccess {Number} purchases.id Purchase ID
 * @apiSuccess {Number} purchases.clientId Client ID
 * @apiSuccess {Number} purchases.total Purchase total
 * @apiSuccess {String} purchases.date Purchase date (ISO 8601)
 *
 * @apiError (401) {Object} error Unauthorized
 * @apiError (403) {Object} error Forbidden - Admin role required
 * @apiError (500) {Object} error Server error
 */
router.get(
  "/history",
  authMiddleware,
  requireRole("admin"),
  purchaseController.getPurchaseHistory
);

/**
 * @api {get} /purchases/:id Get purchase by ID
 * @apiName GetPurchaseById
 * @apiGroup Purchases
 *
 * @apiHeader {String} Authorization Bearer token for authentication
 *
 * @apiParam {Number} id Purchase ID
 *
 * @apiSuccess {Number} id Purchase ID
 * @apiSuccess {Number} clientId Client ID
 * @apiSuccess {Number} total Purchase total
 * @apiSuccess {String} date Purchase date (ISO 8601)
 * @apiSuccess {Object[]} details Purchase details
 *
 * @apiError (401) {Object} error Unauthorized
 * @apiError (404) {Object} error Purchase not found
 * @apiError (500) {Object} error Server error
 */
router.get("/:id", authMiddleware, purchaseController.getPurchaseHistory);

/**
 * @api {get} /purchases Get all purchases (Admin only)
 * @apiName GetAllPurchases
 * @apiGroup Purchases
 * @apiPermission admin
 *
 * @apiHeader {String} Authorization Bearer token for authentication
 *
 * @apiSuccess {Object[]} purchases List of all purchases
 * @apiSuccess {Number} purchases.id Purchase ID
 * @apiSuccess {String} purchases.date Purchase date (ISO 8601)
 * @apiSuccess {Number} purchases.total Purchase total
 * @apiSuccess {String} purchases.createdAt Creation timestamp
 * @apiSuccess {String} purchases.updatedAt Last update timestamp
 * @apiSuccess {Number} purchases.clientId Client ID
 * @apiSuccess {Object[]} purchases.PurchaseItems Array of purchased items
 * @apiSuccess {Number} purchases.PurchaseItems.id Purchase item ID
 * @apiSuccess {Number} purchases.PurchaseItems.purchaseId Purchase ID
 * @apiSuccess {Number} purchases.PurchaseItems.productId Product ID
 * @apiSuccess {Number} purchases.PurchaseItems.quantity Purchased quantity
 * @apiSuccess {Object} purchases.PurchaseItems.Product Product details
 * @apiSuccess {Number} purchases.PurchaseItems.Product.id Product ID
 * @apiSuccess {String} purchases.PurchaseItems.Product.batch Product batch number
 * @apiSuccess {String} purchases.PurchaseItems.Product.name Product name
 * @apiSuccess {Number} purchases.PurchaseItems.Product.price Product price
 * @apiSuccess {Number} purchases.PurchaseItems.Product.availableQuantity Available quantity
 * @apiSuccess {String} purchases.PurchaseItems.Product.entryDate Product entry date (ISO 8601)
 * @apiSuccess {String} purchases.PurchaseItems.Product.createdAt Product creation timestamp
 * @apiSuccess {String} purchases.PurchaseItems.Product.updatedAt Product last update timestamp
 *
 * @apiError (401) {Object} error Unauthorized
 * @apiError (403) {Object} error Forbidden - Admin role required
 * @apiError (500) {Object} error Server error
 */
router.get(
  "/",
  authMiddleware,
  requireRole("admin"),
  purchaseController.getPurchaseHistory
);

export default router;
