const express = require("express");
const router = express.Router();
const BuildingController = require("../controllers/buildingController");
const { upload } = require("../middlewares/multer");

router.post(
  "/create",
  upload.fields([{ name: "buildingFiles", maxCount: 4 }]),
  BuildingController.createBuildingRecord
);

router.get("/all", BuildingController.getAllBuildings);
router.get("/buildingId", BuildingController.getAllBuildingId);
router.get("/:buildingId", BuildingController.getDataByBuildingId);
router.put(
  "/:buildingId",
  upload.fields([{ name: "buildingFiles", maxCount: 4 }]),
  BuildingController.updateBuilding
);

router.get("/buildingId/:landId", BuildingController.getBuildingIdByLandId);

module.exports = router;
