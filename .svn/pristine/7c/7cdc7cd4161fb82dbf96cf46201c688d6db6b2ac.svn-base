const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const Center = require("./Center");

const Location = sequelize.define(
  "Location",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    location_id: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
    },
    location_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("Active", "Inactive"),
      defaultValue: "Active",
    },
    center_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: Center,
        key: "center_id",
      },
    },
  },
  {
    tableName: "locations",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// Define associations
Center.hasMany(Location, { foreignKey: "center_id", sourceKey: "center_id" });
Location.belongsTo(Center, { foreignKey: "center_id", targetKey: "center_id" });

module.exports = Location;
