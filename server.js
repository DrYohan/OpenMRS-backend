require("dotenv").config();
const app = require("./src/app");
const pool = require("./src/config/database");
const itemGRNRoutes = require("../OpenMRS backend/src/routes/itemGRNRoutes");
const supplierRoutes = require("../OpenMRS backend/src/routes/supplierRoutes");
app.use("/api/suppliers", supplierRoutes);

const PORT = process.env.PORT || 3000;

// Test database connection
async function testDatabaseConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Database connected successfully");
    connection.release();
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    console.log("⚠️  Make sure:");
    console.log("   1. MySQL is running on port 3306");
    console.log('   2. Database "OpenMRS" exists');
    console.log("   3. Check your .env file credentials");
    return false;
  }
}

app.use("/api/item-grn", itemGRNRoutes);

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📡 API available at: http://localhost:${PORT}`);
  console.log("");
  console.log("📋 Available Endpoints:");
  console.log("   GET  /api/centers");
  console.log("   POST /api/centers");
  console.log("   GET  /api/locations");
  console.log("   POST /api/locations");
  console.log("   GET  /api/departments");
  console.log("   POST /api/departments");
  console.log("   GET  /api/asset-categories");
  console.log("   POST /api/asset-categories");
  console.log("   GET  /api/item-grn");
  console.log("   POST /api/item-grn");
  console.log("   GET  /api/item-grn/stats");
  console.log("   GET  /api/item-grn/generate-grn");
  console.log("   GET  /api/item-grn/:id");
  console.log("   PUT  /api/item-grn/:id");
  console.log("   DELETE /api/item-grn/:id");
  console.log("   POST /api/item-grn/:id/files");
  console.log("   GET  /api/item-grn/:id/files");
  console.log("   DELETE /api/item-grn/files/:id");
  console.log("");

  // Test database connection
  await testDatabaseConnection();
});
