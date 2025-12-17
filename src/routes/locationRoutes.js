const express = require("express");
const router = express.Router();
const locationController = require("../controllers/locationController");

// Create a new location
router.post("/", locationController.createLocation);

// Get all locations
router.get("/", locationController.getAllLocations);

// Get location by ID
router.get("/:id", locationController.getLocationById);

// Get locations by center
router.get("/center/:center_id", locationController.getLocationsByCenter);

// Update location
router.put("/:id", locationController.updateLocation);

// Delete location
router.delete("/:id", locationController.deleteLocation);

module.exports = router;
