export default (sequelize, DataTypes) => {
  const PurchaseItem = sequelize.define(
    "PurchaseItem",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      purchaseId: { type: DataTypes.INTEGER, allowNull: false },
      productId: { type: DataTypes.INTEGER, allowNull: false },
      quantity: { type: DataTypes.INTEGER, allowNull: false },
    },
    { tableName: "purchase_items", timestamps: false }
  );

  return PurchaseItem;
};
