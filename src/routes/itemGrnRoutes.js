const express = require("express");
const router = express.Router();
const ItemGrnApproveController = require("../controllers/itemGrnApproveController");

// Create a new location
router.get("/grn-no", ItemGrnApproveController.getAllGrnNo);
router.get("/:grnNo", ItemGrnApproveController.getRecordsByGrnNo);
router.put("/item-status/:id", ItemGrnApproveController.updateItemStatus);
router.post("/approve", ItemGrnApproveController.handleApproveItems);



module.exports = router;
