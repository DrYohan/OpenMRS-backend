const fs = require("fs");
const path = require("path");

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount || 0);
};

// Format date
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN");
};

// Generate GRN number
const generateGRNNumber = () => {
  const prefix = "GRN";
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, "0");
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `${prefix}${year}${month}${random}`;
};

// Validate GRN data
const validateGRNData = (data) => {
  const errors = [];

  // Required fields
  const requiredFields = [
    "middle_category",
    "sub_category",
    "item_name",
    "po_no",
    "supplier",
    "qty",
    "date",
    "invoice_no",
    "grn_date",
    "grn_no",
  ];

  requiredFields.forEach((field) => {
    if (!data[field] || data[field].toString().trim() === "") {
      errors.push(`${field.replace("_", " ")} is required`);
    }
  });

  // Numeric validation
  if (data.qty && isNaN(parseInt(data.qty))) {
    errors.push("Quantity must be a number");
  }

  if (data.unit_price && isNaN(parseFloat(data.unit_price))) {
    errors.push("Unit price must be a number");
  }

  if (data.inv_total && isNaN(parseFloat(data.inv_total))) {
    errors.push("Invoice total must be a number");
  }

  if (data.salvage_value && isNaN(parseFloat(data.salvage_value))) {
    errors.push("Salvage value must be a number");
  }

  return errors;
};

// Delete file from filesystem
const deleteFile = (filePath) => {
  try {
    const fullPath = path.join(__dirname, "../..", filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return true;
    }
  } catch (error) {
    console.error("Error deleting file:", error);
  }
  return false;
};

// Calculate total value
const calculateTotalValue = (rows) => {
  return rows.reduce((total, row) => {
    return total + (parseFloat(row.inv_total) || 0);
  }, 0);
};

module.exports = {
  formatCurrency,
  formatDate,
  generateGRNNumber,
  validateGRNData,
  deleteFile,
  calculateTotalValue,
};
