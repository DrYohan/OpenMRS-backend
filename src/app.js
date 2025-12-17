const express = require("express");
const cors = require("cors");

// Import routes
const centerRoutes = require("./routes/centerRoutes");
const locationRoutes = require("./routes/locationRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const assetCategoryRoutes = require("./routes/assetCategoryRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Welcome route
app.get("/", (req, res) => {
  res.json({
    message: "🎉 OpenMRS API is running!",
    version: "1.0.0",
    endpoints: {
      centers: {
        "GET /api/centers": "Get all centers",
        "POST /api/centers": "Create new center",
        "GET /api/centers/:id": "Get center by ID",
        "PUT /api/centers/:id": "Update center",
        "DELETE /api/centers/:id": "Delete center",
        "GET /api/centers/with-location-count":
          "Get centers with location count",
      },
      locations: {
        "GET /api/locations": "Get all locations",
        "POST /api/locations": "Create new location",
        "GET /api/locations/:id": "Get location by ID",
        "PUT /api/locations/:id": "Update location",
        "GET /api/locations/center/:center_id": "Get locations by center",
      },
      departments: {
        "GET /api/departments": "Get all departments",
        "POST /api/departments": "Create new department",
        "GET /api/departments/:id": "Get department by ID",
        "PUT /api/departments/:id": "Update department",
      },
      assetCategories: {
        "GET /api/asset-categories/main-categories": "Get all main categories",
        "GET /api/asset-categories/item-types": "Get all item types",
        "GET /api/asset-categories/middle-categories":
          "Get all middle categories",
        "POST /api/asset-categories/middle-categories":
          "Create middle category",
      },
    },
  });
});

// API routes
app.use("/api/centers", centerRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/asset-categories", assetCategoryRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

module.exports = app;
