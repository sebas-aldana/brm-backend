export default (sequelize, DataTypes) => {
  const Product = sequelize.define(
    "Product",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      batch: { type: DataTypes.STRING, allowNull: false },
      name: { type: DataTypes.STRING, allowNull: false },
      price: { type: DataTypes.FLOAT, allowNull: false },
      availableQuantity: { type: DataTypes.INTEGER, allowNull: false },
      entryDate: { type: DataTypes.DATE, allowNull: false },
    },
    { tableName: "products" }
  );
  return Product;
};
