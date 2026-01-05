const express = require("express");
const router = express.Router();
const ItemGRNController = require("../controllers/itemGRNController");
const FileUploadController = require("../controllers/fileUploadController");
const {
  uploadMiddleware,
  singleUpload,
} = require("../middlewares/uploadMiddleware");

// Test endpoints for debugging
router.post(
  "/test-formdata-parser",
  express.urlencoded({ extended: true }),
  (req, res) => {
    console.log("=== Test FormData Parser ===");
    console.log("Headers:", req.headers);
    console.log("Body keys:", Object.keys(req.body));

    // Try to log all body content
    const bodyCopy = { ...req.body };
    Object.keys(bodyCopy).forEach((key) => {
      console.log(
        `${key}:`,
        typeof bodyCopy[key] === "string"
          ? bodyCopy[key].substring(0, 100) +
              (bodyCopy[key].length > 100 ? "..." : "")
          : bodyCopy[key]
      );
    });

    res.json({
      success: true,
      message: "FormData parser test",
      bodyKeys: Object.keys(req.body),
      bodySample: Object.keys(req.body).reduce((acc, key) => {
        acc[key] =
          typeof req.body[key] === "string"
            ? req.body[key].substring(0, 50) +
              (req.body[key].length > 50 ? "..." : "")
            : req.body[key];
        return acc;
      }, {}),
      headers: req.headers,
    });
  }
);

// Test file upload with multer
router.post("/test-multer", uploadMiddleware, (req, res) => {
  console.log("=== Multer Test ===");
  console.log("Files:", req.files ? req.files.length : 0);
  console.log("Body:", req.body);

  if (req.files) {
    req.files.forEach((file, index) => {
      console.log(`File ${index}:`, {
        fieldname: file.fieldname,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      });
    });
  }

  res.json({
    success: true,
    message: "Multer test successful",
    files: req.files
      ? req.files.map((f) => ({
          fieldname: f.fieldname,
          originalname: f.originalname,
          mimetype: f.mimetype,
          size: f.size,
        }))
      : [],
    body: req.body,
  });
});

// =================== ITEM GRN ROUTES ===================

// CREATE and READ
router.post("/", uploadMiddleware, ItemGRNController.createItemGRN);
router.get("/", ItemGRNController.getAllItemGRNs);
router.get("/search/browse", ItemGRNController.searchItemGRNs);
router.get("/stats", ItemGRNController.getStats);

// GRN Number related
router.get("/generate-grn", ItemGRNController.generateGRNNo);
router.get("/grn-numbers", ItemGRNController.getExistingGrnNumbers);
router.get("/by-grn/:grn_no", ItemGRNController.getItemGRNByGrnNo);

// CRUD by ID
router.get("/:id", ItemGRNController.getItemGRNById);
router.put("/:id", ItemGRNController.updateItemGRN);
router.delete("/:id", ItemGRNController.deleteItemGRN);

// Update all items by GRN
router.put(
  "/by-grn/:grn_no/update-all",
  uploadMiddleware,
  ItemGRNController.updateAllByGrnNo
);

// Image related routes
router.get("/:id/check-images", ItemGRNController.checkItemHasImages);
router.get("/:id/images/:imageNumber", ItemGRNController.serveImageFile);
router.get("/:id/images/:imageNumber/view", ItemGRNController.getItemImage);

// Test routes (can remove in production)
router.get("/search/test", ItemGRNController.testSearch);
router.get("/test/simple", ItemGRNController.testSimpleQuery);

// =================== FILE ROUTES ===================
router.post("/:id/files", uploadMiddleware, FileUploadController.addFiles);
router.get("/:id/files", FileUploadController.getFilesByItemGRN);
router.delete("/files/:id", FileUploadController.deleteFile);

module.exports = router;
