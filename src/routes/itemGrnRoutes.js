const express = require("express");
const router = express.Router();
const ItemGRNController = require("../controllers/itemGRNController");
const { uploadMiddleware } = require("../middlewares/uploadMiddleware");

// IMPORTANT: static routes FIRST
router.get("/search", ItemGRNController.searchItemGRNs);
router.get("/stats", ItemGRNController.getStats);
router.get("/generate-grn", ItemGRNController.generateGRNNo);
router.get("/grn-numbers", ItemGRNController.getExistingGrnNumbers);
router.get("/complete", ItemGRNController.getAllItemGRNsComplete);
router.get("/by-grn/:grn_no", ItemGRNController.getItemGRNByGrnNo);

// CRUD
router.post("/", uploadMiddleware, ItemGRNController.createItemGRN);
router.get("/", ItemGRNController.getAllItemGRNs);

// PARAM routes LAST
router.get("/:id/complete", ItemGRNController.getItemGRNCompleteById);
router.get("/:id/image/:imageNumber", ItemGRNController.getItemImage);
router.get("/:id", ItemGRNController.getItemGRNById);
router.put("/:id", uploadMiddleware, ItemGRNController.updateItemGRN);
router.delete("/:id", ItemGRNController.deleteItemGRN);

// Add this route
router.get("/test-search", ItemGRNController.testSearch);
// Add this route
router.get("/test-simple", ItemGRNController.testSimpleQuery);

// FIXED: Changed upload.array to uploadMiddleware
router.put(
  "/by-grn/:grn_no/update-all",
  uploadMiddleware, // This is the correct middleware
  ItemGRNController.updateAllByGrnNo
);

// Add this route
router.get("/complete/all", ItemGRNController.getAllItemGRNsComplete);

router.get("/:id/images/:imageNumber", ItemGRNController.serveImageFile);
router.get("/:id/check-images", ItemGRNController.checkItemHasImages);
module.exports = router;
