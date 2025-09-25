export default (sequelize, DataTypes) => {
  const Purchase = sequelize.define(
    "Purchase",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      total: { type: DataTypes.FLOAT, allowNull: false },
    },
    { tableName: "purchases" }
  );
  return Purchase;
};
