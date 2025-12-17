const pool = require("../config/database");

class AssetCategory {
  // Main Categories

  static async getAllMainCategories() {
    const query =
      "SELECT * FROM fixed_asset_main_categories ORDER BY category_name";
    const [rows] = await pool.execute(query);
    return rows;
  }

  static async createMainCategory(categoryName) {
    const query =
      "INSERT INTO fixed_asset_main_categories (category_name) VALUES (?)";
    const [result] = await pool.execute(query, [categoryName]);
    return { id: result.insertId, category_name: categoryName };
  }

  // Item Types

  static async getAllItemTypes() {
    const query = `
      SELECT fit.*, fam.category_name 
      FROM fixed_asset_item_types fit
      LEFT JOIN fixed_asset_main_categories fam ON fit.main_category_id = fam.id
      ORDER BY fit.item_type_name
    `;
    const [rows] = await pool.execute(query);
    return rows;
  }

  static async createItemType(itemTypeData) {
    const { item_type_name, main_category_id } = itemTypeData;
    const query =
      "INSERT INTO fixed_asset_item_types (item_type_name, main_category_id) VALUES (?, ?)";
    const [result] = await pool.execute(query, [
      item_type_name,
      main_category_id,
    ]);
    return { id: result.insertId, item_type_name, main_category_id };
  }

  // Middle Categories

  static async createMiddleCategory(categoryData) {
    const {
      main_category_id,
      item_type_id,
      middle_category_id,
      middle_category_name,
      description,
    } = categoryData;
    const query = `
      INSERT INTO fixed_asset_middle_categories 
      (main_category_id, item_type_id, middle_category_id, middle_category_name, description) 
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await pool.execute(query, [
      main_category_id,
      item_type_id,
      middle_category_id,
      middle_category_name,
      description,
    ]);
    return { id: result.insertId, ...categoryData };
  }

  static async getAllMiddleCategories(filters = {}) {
    let query = `
      SELECT 
        famc.*,
        fam.category_name AS main_category,
        fait.item_type_name
      FROM fixed_asset_middle_categories famc
      LEFT JOIN fixed_asset_main_categories fam ON famc.main_category_id = fam.id
      LEFT JOIN fixed_asset_item_types fait ON famc.item_type_id = fait.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.main_category_id) {
      query += " AND famc.main_category_id = ?";
      params.push(filters.main_category_id);
    }

    query += " ORDER BY famc.middle_category_name";
    const [rows] = await pool.execute(query, params);
    return rows;
  }

  static async getMiddleCategoryById(id) {
    const query = `
      SELECT 
        famc.*,
        fam.category_name AS main_category,
        fait.item_type_name
      FROM fixed_asset_middle_categories famc
      LEFT JOIN fixed_asset_main_categories fam ON famc.main_category_id = fam.id
      LEFT JOIN fixed_asset_item_types fait ON famc.item_type_id = fait.id
      WHERE famc.id = ?
    `;
    const [rows] = await pool.execute(query, [id]);
    return rows[0];
  }

  static async updateMiddleCategory(id, categoryData) {
    const {
      middle_category_name,
      description,
      main_category_id,
      item_type_id,
    } = categoryData;
    const query = `
      UPDATE fixed_asset_middle_categories 
      SET middle_category_name = ?, description = ?, 
          main_category_id = ?, item_type_id = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;
    const [result] = await pool.execute(query, [
      middle_category_name,
      description,
      main_category_id,
      item_type_id,
      id,
    ]);
    return result.affectedRows > 0;
  }

  static async deleteMiddleCategory(id) {
    const query = "DELETE FROM fixed_asset_middle_categories WHERE id = ?";
    const [result] = await pool.execute(query, [id]);
    return result.affectedRows > 0;
  }

  // Get middle categories by main category
  static async getMiddleCategoriesByMainCategory(mainCategoryId) {
    const query = `
      SELECT famc.*, fam.category_name 
      FROM fixed_asset_middle_categories famc
      LEFT JOIN fixed_asset_main_categories fam ON famc.main_category_id = fam.id
      WHERE famc.main_category_id = ?
      ORDER BY famc.middle_category_name
    `;
    const [rows] = await pool.execute(query, [mainCategoryId]);
    return rows;
  }
}

module.exports = AssetCategory;
