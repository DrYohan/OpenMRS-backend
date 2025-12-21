const pool = require("../config/database");

class ItemGRNModel {
  // Create new Item GRN
  // Create new Item GRN
  static async create(itemGRNData) {
    console.log("Creating Item GRN with data:", itemGRNData);
    console.log("Data keys:", Object.keys(itemGRNData));

    // Filter out undefined/null values and map to SQL safe format
    const columns = [];
    const values = [];
    const placeholders = [];

    // Define all possible columns in order
    const allColumns = [
      "middle_category",
      "sub_category",
      "item_name",
      "po_no",
      "brand",
      "model",
      "supplier",
      "qty",
      "date",
      "invoice_no",
      "unit_price",
      "inv_total",
      "manufacturer",
      "type",
      "source",
      "receive_type",
      "remarks",
      "grn_date",
      "grn_no",
      "warranty_expiry",
      "service_start",
      "service_end",
      "salvage_value",
      "replicate",
    ];

    // Only include columns that exist in the data
    allColumns.forEach((column) => {
      if (itemGRNData[column] !== undefined && itemGRNData[column] !== null) {
        columns.push(column);
        values.push(itemGRNData[column]);
        placeholders.push("?");
      }
    });

    if (columns.length === 0) {
      throw new Error("No data provided for Item GRN");
    }

    const query = `
    INSERT INTO item_grn (${columns.join(", ")})
    VALUES (${placeholders.join(", ")})
  `;

    console.log("SQL Query:", query);
    console.log("Values:", values);
    console.log("Columns count:", columns.length);
    console.log("Values count:", values.length);

    try {
      const [result] = await pool.execute(query, values);
      console.log("Insert successful, ID:", result.insertId);
      return result.insertId;
    } catch (error) {
      console.error("SQL Error:", error.message);
      console.error("SQL Query:", query);
      console.error("SQL Values:", values);
      throw error;
    }
  }

  // Get all Item GRNs with pagination
  static async findAll(page = 1, limit = 10, search = "") {
    const offset = (page - 1) * limit;

    let query = `
      SELECT * FROM item_grn 
      WHERE 1=1
    `;
    let countQuery = `
      SELECT COUNT(*) as total FROM item_grn WHERE 1=1
    `;
    const queryParams = [];
    const countParams = [];

    if (search) {
      query += ` AND (
        item_name LIKE ? OR 
        po_no LIKE ? OR 
        invoice_no LIKE ? OR 
        grn_no LIKE ? OR 
        supplier LIKE ?
      )`;
      countQuery += ` AND (
        item_name LIKE ? OR 
        po_no LIKE ? OR 
        invoice_no LIKE ? OR 
        grn_no LIKE ? OR 
        supplier LIKE ?
      )`;
      const searchTerm = `%${search}%`;
      queryParams.push(
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm
      );
      countParams.push(
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm
      );
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);

    const [rows] = await pool.execute(query, queryParams);
    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;

    return {
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Get Item GRN by ID
  static async findById(id) {
    const [rows] = await pool.execute("SELECT * FROM item_grn WHERE id = ?", [
      id,
    ]);
    return rows[0];
  }

  // Update Item GRN
  static async update(id, updateData) {
    const fields = Object.keys(updateData);
    const values = Object.values(updateData);

    if (fields.length === 0) {
      return 0;
    }

    const setClause = fields.map((field) => `${field} = ?`).join(", ");
    const query = `UPDATE item_grn SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

    values.push(id);
    const [result] = await pool.execute(query, values);
    return result.affectedRows;
  }

  // Delete Item GRN
  static async delete(id) {
    const [result] = await pool.execute("DELETE FROM item_grn WHERE id = ?", [
      id,
    ]);
    return result.affectedRows;
  }

  // Check if GRN number exists
  static async checkGRNNoExists(grn_no, excludeId = null) {
    let query = "SELECT id FROM item_grn WHERE grn_no = ?";
    const params = [grn_no];

    if (excludeId) {
      query += " AND id != ?";
      params.push(excludeId);
    }

    const [rows] = await pool.execute(query, params);
    return rows.length > 0;
  }

  // Get Item GRN statistics
  static async getStats() {
    const [totalResult] = await pool.execute(
      "SELECT COUNT(*) as total FROM item_grn"
    );
    const [recentResult] = await pool.execute(
      "SELECT COUNT(*) as recent FROM item_grn WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)"
    );
    const [valueResult] = await pool.execute(
      "SELECT SUM(inv_total) as total_value FROM item_grn"
    );

    return {
      total: totalResult[0].total,
      recent: recentResult[0].recent,
      totalValue: valueResult[0].total_value || 0,
    };
  }

  // Create new Item GRN - SIMPLIFIED VERSION
  static async create(itemGRNData) {
    console.log("Creating Item GRN with data:", itemGRNData);
    console.log("Number of keys:", Object.keys(itemGRNData).length);

    // List all columns in the table (adjust based on your actual table structure)
    const allColumns = [
      "middle_category",
      "sub_category",
      "item_name",
      "po_no",
      "brand",
      "model",
      "supplier",
      "qty",
      "date",
      "invoice_no",
      "unit_price",
      "inv_total",
      "manufacturer",
      "type",
      "source",
      "receive_type",
      "remarks",
      "grn_date",
      "grn_no",
      "warranty_expiry",
      "service_start",
      "service_end",
      "salvage_value",
      "replicate",
    ];

    // Build query dynamically based on what data we have
    const columns = [];
    const values = [];
    const placeholders = [];

    allColumns.forEach((col) => {
      if (itemGRNData[col] !== undefined) {
        columns.push(col);
        values.push(itemGRNData[col]);
        placeholders.push("?");
      }
    });

    if (columns.length === 0) {
      throw new Error("No valid data provided for Item GRN");
    }

    const query = `INSERT INTO item_grn (${columns.join(
      ", "
    )}) VALUES (${placeholders.join(", ")})`;

    console.log("Generated Query:", query);
    console.log("Values to insert:", values);

    try {
      const [result] = await pool.execute(query, values);
      console.log("Insert successful, ID:", result.insertId);
      return result.insertId;
    } catch (error) {
      console.error("SQL Error in create method:");
      console.error("Message:", error.message);
      console.error("Code:", error.code);
      console.error("SQL State:", error.sqlState);
      console.error("Query:", query);
      console.error("Values:", values);
      throw error;
    }
  }
}

module.exports = ItemGRNModel;
