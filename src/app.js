import express from "express";
import cors from "cors";
const router = express.Router();
import morgan from "morgan";
import dotenv from "dotenv";
import { sequelize } from "./models/index.js";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
/* const purchaseRoutes = require("./routes/purchases");
const errorHandler = require("./middlewares/errorHandler"); */

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

router.get("/", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: "ok", db: "connected" });
  } catch (err) {
    res
      .status(500)
      .json({ status: "error", db: "disconnected", error: err.message });
  }
});

app.use("/auth", authRoutes);
app.use("/products", productRoutes);
/*app.use("/purchases", purchaseRoutes); */

/* app.use(errorHandler); */

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log("DB connected");
    await sequelize.sync();
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

start();
