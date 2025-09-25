import express from "express";
import { authMiddleware, requireRole } from "../middlewares/auth.js";
import purchaseController from "../controllers/purchaseController.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  requireRole("cliente"),
  purchaseController.createPurchase
);

router.get(
  "/history",
  authMiddleware,
  requireRole("admin"),
  purchaseController.getPurchaseHistory
);

router.get("/:id", authMiddleware, purchaseController.getPurchaseHistory);

router.get(
  "/",
  authMiddleware,
  requireRole("admin"),
  purchaseController.getPurchaseHistory
);

export default router;
