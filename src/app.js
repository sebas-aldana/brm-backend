import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

import { sequelize } from "./models/index.js";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import purchaseRoutes from "./routes/purchases.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/purchases", purchaseRoutes);

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to start server:", error);
    process.exit(1);
  }
})();
