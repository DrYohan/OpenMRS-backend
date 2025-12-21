const pool = require("../config/database");

class ItemGRNFileModel {
  // Create multiple files
  static async createMultiple(filesData) {
    if (filesData.length === 0) return [];

    const query = `
      INSERT INTO item_grn_files 
        (item_grn_id, file_name, file_path, file_type, file_size) 
      VALUES ?
    `;

    const values = filesData.map((file) => [
      file.item_grn_id,
      file.file_name,
      file.file_path,
      file.file_type,
      file.file_size,
    ]);

    const [result] = await pool.query(query, [values]);
    return result;
  }

  // Get files by Item GRN ID
  static async findByItemGRNId(item_grn_id) {
    const [rows] = await pool.execute(
      "SELECT * FROM item_grn_files WHERE item_grn_id = ? ORDER BY uploaded_at DESC",
      [item_grn_id]
    );
    return rows;
  }

  // Get file by ID
  static async findById(id) {
    const [rows] = await pool.execute(
      "SELECT * FROM item_grn_files WHERE id = ?",
      [id]
    );
    return rows[0];
  }

  // Delete file by ID
  static async delete(id) {
    const [result] = await pool.execute(
      "DELETE FROM item_grn_files WHERE id = ?",
      [id]
    );
    return result.affectedRows;
  }

  // Delete all files for an Item GRN
  static async deleteByItemGRNId(item_grn_id) {
    const [result] = await pool.execute(
      "DELETE FROM item_grn_files WHERE item_grn_id = ?",
      [item_grn_id]
    );
    return result.affectedRows;
  }
}

module.exports = ItemGRNFileModel;
