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

// Item GRN Routes
router.post("/", uploadMiddleware, ItemGRNController.createItemGRN);
router.get("/", ItemGRNController.getAllItemGRNs);
router.get("/stats", ItemGRNController.getStats);
router.get("/generate-grn", ItemGRNController.generateGRNNo);
router.get("/:id", ItemGRNController.getItemGRNById);
router.put("/:id", ItemGRNController.updateItemGRN);
router.delete("/:id", ItemGRNController.deleteItemGRN);

// File Routes
router.post("/:id/files", uploadMiddleware, FileUploadController.addFiles);
router.get("/:id/files", FileUploadController.getFilesByItemGRN);
router.delete("/files/:id", FileUploadController.deleteFile);

module.exports = router;
