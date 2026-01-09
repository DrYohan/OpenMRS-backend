const express = require("express");
const router = express.Router();
const LandController = require("../controllers/landController");
const { upload } = require("../middlewares/multer");

router.post(
  "/create",
  upload.fields([
    { name: "files", maxCount: 4 }, // land images
    { name: "deedCopy", maxCount: 1 }, // single deed copy
  ]),
  LandController.createBuildingRecord
);

router.get("/landId", LandController.fetchAllLandId);
router.get("/:landId", LandController.fetchDataBylandId);
router.put(
  "/:landId",
  upload.fields([
    { name: "files", maxCount: 4 }, // land images
    { name: "deedCopy", maxCount: 1 }, // single deed copy
  ]),
  LandController.updateBuildingData
);

// Create a new location
// router.post("/create", uploadArray("building/land_image"), BuildingController.createBuildingRecord);
module.exports = router;
