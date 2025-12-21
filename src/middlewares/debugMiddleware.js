const debugMiddleware = (req, res, next) => {
  console.log("=== REQUEST DEBUG INFO ===");
  console.log("Method:", req.method);
  console.log("URL:", req.url);
  console.log("Headers:", req.headers);
  console.log("Body fields:", Object.keys(req.body));

  // Check for files
  if (req.files) {
    console.log("Files uploaded:", req.files.length);
    req.files.forEach((file, index) => {
      console.log(`File ${index}:`, file.fieldname, file.originalname);
    });
  }

  console.log("=== END DEBUG INFO ===");
  next();
};

module.exports = debugMiddleware;
