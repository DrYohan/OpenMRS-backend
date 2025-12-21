const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const originalName = file.originalname.replace(/\s+/g, "_");
    cb(null, `item-grn-${uniqueSuffix}-${originalName}`);
  },
});

// Create upload instance - NO file filter for now
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Export middleware for 'files' field
const uploadMiddleware = upload.array("files", 10); // Max 10 files, field name: 'files'

// Export single file upload for testing
const singleUpload = upload.single("files");

module.exports = {
  uploadMiddleware,
  singleUpload,
};
