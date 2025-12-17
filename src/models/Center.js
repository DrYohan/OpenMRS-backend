const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Center = sequelize.define(
  "Center",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    center_id: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
    },
    center_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("Active", "Inactive"),
      defaultValue: "Active",
    },
  },
  {
    tableName: "centers",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Center;
