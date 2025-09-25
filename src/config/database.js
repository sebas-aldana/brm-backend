import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

const sequelizeConfig = {
  dialect: "postgres",
  protocol: "postgres",
  logging: false,
  dialectOptions: {
    ssl: isProduction
      ? {
          require: true,
          rejectUnauthorized: false,
        }
      : false,
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};

export const sequelize = new Sequelize(
  process.env.SUPABASE_DB_URL,
  sequelizeConfig
);

// Test the connection
sequelize
  .authenticate()
  .then(() =>
    console.log("Database connection has been established successfully.")
  )
  .catch((err) => console.error("Unable to connect to the database:", err));
