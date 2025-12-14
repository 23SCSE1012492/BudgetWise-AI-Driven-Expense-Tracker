const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Goal', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: { type: DataTypes.UUID, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    targetAmount: { type: DataTypes.FLOAT, allowNull: false },
    currentAmount: { type: DataTypes.FLOAT, defaultValue: 0 },
    deadline: { type: DataTypes.DATEONLY },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  });
};
