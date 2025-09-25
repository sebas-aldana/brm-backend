import express from "express";
import { body } from "express-validator";
import { authMiddleware, requireRole } from "../middlewares/auth.js";
import {
  createProduct,
  listProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

const router = express.Router();

/**
 * @api {get} /products List all products
 * @apiName ListProducts
 * @apiGroup Products
 *
 * @apiSuccess {Object[]} products List of products
 * @apiSuccess {Number} products.id Product ID
 * @apiSuccess {String} products.batch Product batch number
 * @apiSuccess {String} products.name Product name
 * @apiSuccess {Number} products.price Product price
 * @apiSuccess {Number} products.availableQuantity Available quantity in stock
 * @apiSuccess {String} products.entryDate Date when product was added (ISO 8601 format)
 *
 * @apiError (500) {Object} error Server error
 */
router.get("/", listProducts);

/**
 * @api {get} /products/:id Get product by ID
 * @apiName GetProduct
 * @apiGroup Products
 *
 * @apiParam {Number} id Product's unique ID
 *
 * @apiSuccess {Number} id Product ID
 * @apiSuccess {String} batch Product batch number
 * @apiSuccess {String} name Product name
 * @apiSuccess {Number} price Product price
 * @apiSuccess {Number} availableQuantity Available quantity in stock
 * @apiSuccess {String} entryDate Date when product was added (ISO 8601 format)
 *
 * @apiError (404) {Object} error Product not found
 * @apiError (500) {Object} error Server error
 */
router.get("/:id", getProduct);

/**
 * @api {post} /products Create a new product
 * @apiName CreateProduct
 * @apiGroup Products
 *
 * @apiHeader {String} Authorization Bearer token for authentication
 *
 * @apiBody {String} batch Product batch number (required)
 * @apiBody {String} name Product name (required)
 * @apiBody {Number} price Product price (must be positive)
 * @apiBody {Number} availableQuantity Available quantity (must be integer >= 0)
 * @apiBody {String} entryDate Entry date (ISO 8601 format, e.g., "2023-09-25T00:00:00.000Z")
 *
 * @apiSuccess (201) {Number} id Product ID
 * @apiSuccess (201) {String} batch Product batch number
 * @apiSuccess (201) {String} name Product name
 * @apiSuccess (201) {Number} price Product price
 * @apiSuccess (201) {Number} availableQuantity Available quantity
 * @apiSuccess (201) {String} entryDate Entry date
 *
 * @apiError (400) {Object} error Validation error with messages
 * @apiError (401) {Object} error Unauthorized - No token provided
 * @apiError (403) {Object} error Forbidden - Admin role required
 * @apiError (500) {Object} error Server error
 */
router.post(
  "/",
  authMiddleware,
  requireRole("admin"),
  body("batch").notEmpty().withMessage("El lote es requerido"),
  body("name").notEmpty().withMessage("El nombre es requerido"),
  body("price")
    .isFloat({ min: 0 })
    .withMessage("El precio debe ser un número positivo"),
  body("availableQuantity")
    .isInt({ min: 0 })
    .withMessage("La cantidad debe ser un número entero positivo"),
  body("entryDate")
    .isISO8601()
    .withMessage("La fecha de ingreso debe ser una fecha válida"),
  createProduct
);

/**
 * @api {put} /products/:id Update a product
 * @apiName UpdateProduct
 * @apiGroup Products
 *
 * @apiHeader {String} Authorization Bearer token for authentication
 *
 * @apiParam {Number} id Product's unique ID
 *
 * @apiBody {String} [batch] Product batch number
 * @apiBody {String} [name] Product name
 * @apiBody {Number} [price] Product price (must be positive if provided)
 * @apiBody {Number} [availableQuantity] Available quantity (must be integer >= 0 if provided)
 * @apiBody {String} [entryDate] Entry date (ISO 8601 format)
 *
 * @apiSuccess {Number} id Product ID
 * @apiSuccess {String} batch Updated batch number
 * @apiSuccess {String} name Updated product name
 * @apiSuccess {Number} price Updated price
 * @apiSuccess {Number} availableQuantity Updated available quantity
 * @apiSuccess {String} entryDate Updated entry date
 *
 * @apiError (400) {Object} error Validation error with messages
 * @apiError (401) {Object} error Unauthorized - No token provided
 * @apiError (403) {Object} error Forbidden - Admin role required
 * @apiError (404) {Object} error Product not found
 * @apiError (500) {Object} error Server error
 */
router.put("/:id", authMiddleware, requireRole("admin"), updateProduct);

/**
 * @api {delete} /products/:id Delete a product
 * @apiName DeleteProduct
 * @apiGroup Products
 *
 * @apiHeader {String} Authorization Bearer token for authentication
 *
 * @apiParam {Number} id Product's unique ID
 *
 * @apiSuccess {String} message Success message
 *
 * @apiError (401) {Object} error Unauthorized - No token provided
 * @apiError (403) {Object} error Forbidden - Admin role required
 * @apiError (404) {Object} error Product not found
 * @apiError (500) {Object} error Server error
 */
router.delete("/:id", authMiddleware, requireRole("admin"), deleteProduct);

export default router;
