const pool = require("../config/database");

const assetCategoryController = {
  // Get all main categories
  async getAllMainCategories(req, res) {
    try {
      const [categories] = await pool.execute(
        "SELECT * FROM fixed_asset_main_categories ORDER BY category_name"
      );
      res.json({
        success: true,
        count: categories.length,
        data: categories,
      });
    } catch (error) {
      console.error("Error fetching main categories:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // Get all item types
  async getAllItemTypes(req, res) {
    try {
      const [itemTypes] = await pool.execute(`
        SELECT fit.*, fam.category_name 
        FROM fixed_asset_item_types fit
        LEFT JOIN fixed_asset_main_categories fam ON fit.main_category_id = fam.id
        ORDER BY fit.item_type_name
      `);
      res.json({
        success: true,
        count: itemTypes.length,
        data: itemTypes,
      });
    } catch (error) {
      console.error("Error fetching item types:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // Get all middle categories
  async getAllMiddleCategories(req, res) {
    try {
      const [categories] = await pool.execute(`
        SELECT 
          famc.*,
          fam.category_name AS main_category,
          fait.item_type_name
        FROM fixed_asset_middle_categories famc
        LEFT JOIN fixed_asset_main_categories fam ON famc.main_category_id = fam.id
        LEFT JOIN fixed_asset_item_types fait ON famc.item_type_id = fait.id
        ORDER BY famc.middle_category_name
      `);
      res.json({
        success: true,
        count: categories.length,
        data: categories,
      });
    } catch (error) {
      console.error("Error fetching middle categories:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // Create middle category
  async createMiddleCategory(req, res) {
    try {
      const {
        main_category_id,
        item_type_id,
        middle_category_id,
        middle_category_name,
        description,
      } = req.body;

      if (!main_category_id || !middle_category_id || !middle_category_name) {
        return res.status(400).json({
          error:
            "main_category_id, middle_category_id, and middle_category_name are required",
        });
      }

      // Check if middle_category_id exists
      const [existing] = await pool.execute(
        "SELECT * FROM fixed_asset_middle_categories WHERE middle_category_id = ?",
        [middle_category_id]
      );

      if (existing.length > 0) {
        return res
          .status(400)
          .json({ error: "Middle Category ID already exists" });
      }

      const [result] = await pool.execute(
        "INSERT INTO fixed_asset_middle_categories (main_category_id, item_type_id, middle_category_id, middle_category_name, description) VALUES (?, ?, ?, ?, ?)",
        [
          main_category_id,
          item_type_id || null,
          middle_category_id,
          middle_category_name,
          description,
        ]
      );

      res.status(201).json({
        success: true,
        message: "Middle category created successfully",
        data: {
          id: result.insertId,
          main_category_id,
          item_type_id,
          middle_category_id,
          middle_category_name,
          description,
        },
      });
    } catch (error) {
      console.error("Error creating middle category:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // Get middle category by ID
  async getMiddleCategoryById(req, res) {
    try {
      const { id } = req.params;
      const [categories] = await pool.execute(
        `SELECT 
          famc.*,
          fam.category_name AS main_category,
          fait.item_type_name
        FROM fixed_asset_middle_categories famc
        LEFT JOIN fixed_asset_main_categories fam ON famc.main_category_id = fam.id
        LEFT JOIN fixed_asset_item_types fait ON famc.item_type_id = fait.id
        WHERE famc.id = ?`,
        [id]
      );

      if (categories.length === 0) {
        return res.status(404).json({ error: "Middle category not found" });
      }

      res.json({
        success: true,
        data: categories[0],
      });
    } catch (error) {
      console.error("Error fetching middle category:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // Update middle category
  async updateMiddleCategory(req, res) {
    try {
      const { id } = req.params;
      const {
        middle_category_name,
        description,
        main_category_id,
        item_type_id,
      } = req.body;

      if (
        !middle_category_name &&
        !description &&
        !main_category_id &&
        !item_type_id
      ) {
        return res.status(400).json({ error: "No fields to update" });
      }

      const [categories] = await pool.execute(
        "SELECT * FROM fixed_asset_middle_categories WHERE id = ?",
        [id]
      );

      if (categories.length === 0) {
        return res.status(404).json({ error: "Middle category not found" });
      }

      const updateFields = [];
      const params = [];

      if (middle_category_name) {
        updateFields.push("middle_category_name = ?");
        params.push(middle_category_name);
      }

      if (description !== undefined) {
        updateFields.push("description = ?");
        params.push(description);
      }

      if (main_category_id) {
        updateFields.push("main_category_id = ?");
        params.push(main_category_id);
      }

      if (item_type_id !== undefined) {
        updateFields.push("item_type_id = ?");
        params.push(item_type_id);
      }

      params.push(id);

      await pool.execute(
        `UPDATE fixed_asset_middle_categories SET ${updateFields.join(
          ", "
        )} WHERE id = ?`,
        params
      );

      res.json({
        success: true,
        message: "Middle category updated successfully",
      });
    } catch (error) {
      console.error("Error updating middle category:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // Delete middle category
  async deleteMiddleCategory(req, res) {
    try {
      const { id } = req.params;

      const [result] = await pool.execute(
        "DELETE FROM fixed_asset_middle_categories WHERE id = ?",
        [id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Middle category not found" });
      }

      res.json({
        success: true,
        message: "Middle category deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting middle category:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // Get middle categories by main category
  async getMiddleCategoriesByMainCategory(req, res) {
    try {
      const { main_category_id } = req.params;

      const [categories] = await pool.execute(
        `SELECT famc.*, fam.category_name 
         FROM fixed_asset_middle_categories famc
         LEFT JOIN fixed_asset_main_categories fam ON famc.main_category_id = fam.id
         WHERE famc.main_category_id = ?
         ORDER BY famc.middle_category_name`,
        [main_category_id]
      );

      res.json({
        success: true,
        count: categories.length,
        data: categories,
      });
    } catch (error) {
      console.error(
        "Error fetching middle categories by main category:",
        error
      );
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = assetCategoryController;
