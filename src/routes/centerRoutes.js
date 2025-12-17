const express = require("express");
const router = express.Router();
const centerController = require("../controllers/centerController");

// Create a new center
router.post("/", centerController.createCenter);

// Get all centers
router.get("/", centerController.getAllCenters);

// Get centers with location count
router.get(
  "/with-location-count",
  centerController.getCentersWithLocationCount
);

// Get center by ID
router.get("/:id", centerController.getCenterById);

// Update center
router.put("/:id", centerController.updateCenter);

// Delete center
router.delete("/:id", centerController.deleteCenter);

module.exports = router;
