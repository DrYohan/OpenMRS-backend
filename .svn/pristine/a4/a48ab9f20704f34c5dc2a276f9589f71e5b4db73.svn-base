const express = require("express");
const router = express.Router();
const departmentController = require("../controllers/departmentController");

// Create a new department
router.post("/", departmentController.createDepartment);

// Get all departments
router.get("/", departmentController.getAllDepartments);

// Get department by ID
router.get("/:id", departmentController.getDepartmentById);

// Get departments by center and location
router.get(
  "/center/:center_id/location/:location_id",
  departmentController.getDepartmentsByCenterAndLocation
);

// Update department
router.put("/:id", departmentController.updateDepartment);

// Delete department
router.delete("/:id", departmentController.deleteDepartment);

module.exports = router;
