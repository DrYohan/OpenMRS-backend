const express = require("express");
const router = express.Router();
const ItemGrnApproveController = require("../controllers/itemGrnApproveController");

// Existing routes
router.get("/grn-no", ItemGrnApproveController.getAllGrnNo);
router.get("/:grnNo", ItemGrnApproveController.getRecordsByGrnNo);
router.put("/item-status/:id", ItemGrnApproveController.updateItemStatus);
router.post("/approve", ItemGrnApproveController.handleApproveItems);

// 🔥 NEW ROUTES for fixed_asset_master
router.get("/assets/all", ItemGrnApproveController.getAllFixedAssets);
router.get("/assets/:id", ItemGrnApproveController.getFixedAssetById);
router.get("/assets/search", ItemGrnApproveController.searchFixedAssets);

router.get(
  "/assets/by-grn/:grnNo",
  ItemGrnApproveController.getFixedAssetsByGrnNo
);

module.exports = router;
