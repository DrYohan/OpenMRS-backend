const pool = require("../config/database");

class ItemGRNDetailModel {
  // Create multiple details
  static async createMultiple(detailsData) {
    if (detailsData.length === 0) return [];

    const query = `
      INSERT INTO item_grn_details 
        (item_grn_id, center, location, department, employee, 
         serial_no, book_no_local_id, barcode_no) 
      VALUES ?
    `;

    const values = detailsData.map((detail) => [
      detail.item_grn_id,
      detail.center,
      detail.location,
      detail.department,
      detail.employee,
      detail.serial_no,
      detail.book_no_local_id,
      detail.barcode_no,
    ]);

    const [result] = await pool.query(query, [values]);
    return result;
  }

  // Get details by Item GRN ID
  static async findByItemGRNId(item_grn_id) {
    const [rows] = await pool.execute(
      "SELECT * FROM item_grn_details WHERE item_grn_id = ? ORDER BY created_at DESC",
      [item_grn_id]
    );
    return rows;
  }

  // Update detail by ID
  static async update(id, updateData) {
    const fields = Object.keys(updateData);
    const values = Object.values(updateData);

    if (fields.length === 0) {
      return 0;
    }

    const setClause = fields.map((field) => `${field} = ?`).join(", ");
    const query = `UPDATE item_grn_details SET ${setClause} WHERE id = ?`;

    values.push(id);
    const [result] = await pool.execute(query, values);
    return result.affectedRows;
  }

  // Delete detail by ID
  static async delete(id) {
    const [result] = await pool.execute(
      "DELETE FROM item_grn_details WHERE id = ?",
      [id]
    );
    return result.affectedRows;
  }

  // Delete all details for an Item GRN
  static async deleteByItemGRNId(item_grn_id) {
    const [result] = await pool.execute(
      "DELETE FROM item_grn_details WHERE item_grn_id = ?",
      [item_grn_id]
    );
    return result.affectedRows;
  }
}

module.exports = ItemGRNDetailModel;
