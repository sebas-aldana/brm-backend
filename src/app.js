import express from "express";
import path from "path";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { mkdirSync, existsSync } from "fs";
import { sequelize } from "./models/index.js";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import purchaseRoutes from "./routes/purchases.js";
import errorHandler from "./middlewares/errorHandler.js";
import logger from "./utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Crear directorio de logs si no existe
const logDir = path.join(process.cwd(), 'logs');
if (!existsSync(logDir)) {
  mkdirSync(logDir, { recursive: true });
  logger.info(`Directorio de logs creado en: ${logDir}`);
}

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/purchases", purchaseRoutes);

const docsPath = path.join(process.cwd(), "docs");
app.use("/docs", express.static(docsPath));

// Manejador de errores (debe ir después de las rutas)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    
    app.listen(PORT, () => {
      logger.info(`Servidor iniciado en el puerto ${PORT} (${process.env.NODE_ENV || 'development'})`);
    });
  } catch (error) {
    logger.error('Error al iniciar el servidor:', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
})();
