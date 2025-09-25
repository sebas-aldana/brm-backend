import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import userModel from "./user.js";
import purchaseModel from "./purchase.js";
import productModel from "./product.js";
import purchaseDetailModel from "./purchaseDetail.js";

const User = userModel(sequelize, DataTypes);
const Purchase = purchaseModel(sequelize, DataTypes);
const Product = productModel(sequelize, DataTypes);
const PurchaseDetail = purchaseDetailModel(sequelize, DataTypes);

User.hasMany(Purchase, { foreignKey: "clientId" });
Purchase.belongsTo(User, { foreignKey: "clientId" });

Purchase.hasMany(PurchaseDetail, { foreignKey: "purchaseId" });
PurchaseDetail.belongsTo(Purchase, { foreignKey: "purchaseId" });

Product.hasMany(PurchaseDetail, { foreignKey: "productId" });
PurchaseDetail.belongsTo(Product, { foreignKey: "productId" });

export { sequelize, User, Product, Purchase, PurchaseDetail };
