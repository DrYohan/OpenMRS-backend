const express = require("express");
const router = express.Router();
const VehicleController = require("../controllers/vehicleController");
const { uploadMiddleware } = require("../middlewares/uploadMiddleware");
const { uploadArray } = require("../middlewares/multer");
// Create a new location
router.post("/create", uploadArray("vehicle"), VehicleController.createVehicle);
router.get("/registrationId", VehicleController.getAllRegistrationId)
router.get("/by-registration/:registrationId", VehicleController.getVehicleByRegistrationId)
router.get("/pendingVehicle", VehicleController.fetchPendingApprovalVehicles)   
router.post("/approve", VehicleController.approveVehicle)
router.get("/names", VehicleController.getAllSuppliers)

router.put("/update/:id", uploadArray("vehicle"), VehicleController.updateVehicle );


router.get("/middle-categories/:stationId", VehicleController.getMiddleCategoriesByStation );
router.get("/sub-categories/:middleCategory", VehicleController.getSubCategoriesByMiddleCategory );
router.get("/registrationId/:station/:middleCategory/:subCategory", VehicleController.getRegistrationIdBySlectedValues);



module.exports = router;
