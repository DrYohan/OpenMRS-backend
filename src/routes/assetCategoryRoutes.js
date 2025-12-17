const express = require("express");
const router = express.Router();
const assetCategoryController = require("../controllers/assetCategoryController");

// Main Categories
router.get("/main-categories", assetCategoryController.getAllMainCategories);

// Item Types
router.get("/item-types", assetCategoryController.getAllItemTypes);

// Middle Categories
router.post("/middle-categories", assetCategoryController.createMiddleCategory);
router.get(
  "/middle-categories",
  assetCategoryController.getAllMiddleCategories
);
router.get(
  "/middle-categories/:id",
  assetCategoryController.getMiddleCategoryById
);
router.put(
  "/middle-categories/:id",
  assetCategoryController.updateMiddleCategory
);
router.delete(
  "/middle-categories/:id",
  assetCategoryController.deleteMiddleCategory
);
router.get(
  "/middle-categories/main-category/:main_category_id",
  assetCategoryController.getMiddleCategoriesByMainCategory
);

module.exports = router;
