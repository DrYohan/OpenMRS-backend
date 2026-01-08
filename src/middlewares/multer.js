const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Base upload directory
const BASE_UPLOAD_DIR = "base_uploads";

// Ensure base folder exists
if (!fs.existsSync(BASE_UPLOAD_DIR)) {
  fs.mkdirSync(BASE_UPLOAD_DIR, { recursive: true });
}

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Dynamic folder based on field name
    let folderName = "common";

    if (file.fieldname === "files") folderName = "building/land_image";
    if (file.fieldname === "deedCopy") folderName = "building/deed_copy";
    if (file.fieldname === "buildingFiles") folderName = "building_uploads";


    const uploadPath = path.join(BASE_UPLOAD_DIR, folderName);

    // Create folder if not exists
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// Image-only filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|bmp|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) cb(null, true);
  else cb(new Error("Only image files are allowed"));
};

// Multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = { upload };
