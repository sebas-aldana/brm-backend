import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelizeConfig = {
  dialect: "postgres",
  protocol: "postgres",
  logging: false,
  dialectOptions: {
    ssl: false,
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
