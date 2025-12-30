const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");

const Supplier = sequelize.define(
  "Supplier",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    stationId: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "station_id",
    },

    supplierCode: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      field: "supplier_code",
    },

    supplierName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "supplier_name",
    },

    contactPerson: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "contact_person",
    },

    address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    categories: {
      type: DataTypes.JSON,
      allowNull: false,
    },

    telephone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },

    fax: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },

    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },

    tinNo: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: "tin_no",
    },

    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "suppliers",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Supplier;
