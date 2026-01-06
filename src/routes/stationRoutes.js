const express = require("express");
const router = express.Router();
const StationController = require("../controllers/stationController");

// Create a new location
router.get("/", StationController.getAllStation);



module.exports = router;
