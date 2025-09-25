export default (sequelize, DataTypes) => {
  const PurchaseDetail = sequelize.define(
    "PurchaseDetail",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      cantidad: { type: DataTypes.INTEGER, allowNull: false },
      precioUnitario: { type: DataTypes.FLOAT, allowNull: false },
    },
    { tableName: "purchase_details" }
  );
  return PurchaseDetail;
};
