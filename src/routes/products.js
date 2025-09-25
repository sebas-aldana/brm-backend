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

router.get("/", listProducts);
router.get("/:id", getProduct);

router.post(
  "/",
  authMiddleware,
  requireRole("admin"),
  body("lote").notEmpty().withMessage("El lote es requerido"),
  body("nombre").notEmpty().withMessage("El nombre es requerido"),
  body("precio")
    .isFloat({ min: 0 })
    .withMessage("El precio debe ser un número positivo"),
  body("cantidadDisponible")
    .isInt({ min: 0 })
    .withMessage("La cantidad debe ser un número entero positivo"),
  body("fechaIngreso")
    .isISO8601()
    .withMessage("La fecha de ingreso debe ser una fecha válida"),
  createProduct
);

router.put("/:id", authMiddleware, requireRole("admin"), updateProduct);
router.delete("/:id", authMiddleware, requireRole("admin"), deleteProduct);

export default router;
