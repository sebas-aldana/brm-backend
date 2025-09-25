export default (sequelize, DataTypes) => {
  const Product = sequelize.define(
    "Product",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      lote: { type: DataTypes.STRING, allowNull: false },
      nombre: { type: DataTypes.STRING, allowNull: false },
      precio: { type: DataTypes.FLOAT, allowNull: false },
      cantidadDisponible: { type: DataTypes.INTEGER, allowNull: false },
      fechaIngreso: { type: DataTypes.DATE, allowNull: false },
    },
    { tableName: "products" }
  );
  return Product;
};
