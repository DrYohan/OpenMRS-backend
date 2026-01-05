const express = require("express");
const router = express.Router();
const SupplierController = require("../controllers/supplierController");

// Create a new location
router.post("/", SupplierController.createSupplier);
router.get("/codes", SupplierController.getAllSupplierCode);
router.get("/all", SupplierController.getAllSuppliers);
router.get("/:code", SupplierController.getSupplierByCode);
router.put("/:code", SupplierController.updateSupplier);

module.exports = router;
