const ItemGRNFileModel = require("../models/itemGRNFileModel");
const ItemGRNModel = require("../models/itemGRNModel");
const { deleteFile } = require("../utils/helpers");
const pool = require("../config/database");

class FileUploadController {
  // Add files to existing Item GRN
  static async addFiles(req, res) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const { id } = req.params;

      // Check if Item GRN exists
      const existingItemGRN = await ItemGRNModel.findById(id);
      if (!existingItemGRN) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          message: "Item GRN not found",
        });
      }

      // Process uploaded files
      if (!req.files || req.files.length === 0) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: "No files uploaded",
        });
      }

      const filesData = req.files.map((file) => ({
        item_grn_id: id,
        file_name: file.originalname,
        file_path: `/uploads/${file.filename}`,
        file_type: file.mimetype,
        file_size: file.size,
      }));

      await ItemGRNFileModel.createMultiple(filesData);

      await connection.commit();

      res.status(201).json({
        success: true,
        message: "Files added successfully",
        data: {
          files_count: filesData.length,
        },
      });
    } catch (error) {
      await connection.rollback();
      console.error("Error adding files:", error);
      res.status(500).json({
        success: false,
        message: "Failed to add files",
        error: error.message,
      });
    } finally {
      connection.release();
    }
  }

  // Delete file
  static async deleteFile(req, res) {
    try {
      const { id } = req.params;

      // Get file details
      const file = await ItemGRNFileModel.findById(id);
      if (!file) {
        return res.status(404).json({
          success: false,
          message: "File not found",
        });
      }

      // Delete from database
      const deletedRows = await ItemGRNFileModel.delete(id);
      if (deletedRows === 0) {
        return res.status(400).json({
          success: false,
          message: "Failed to delete file",
        });
      }

      // Delete from filesystem
      deleteFile(file.file_path);

      res.json({
        success: true,
        message: "File deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting file:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete file",
        error: error.message,
      });
    }
  }

  // Get files for Item GRN
  static async getFilesByItemGRN(req, res) {
    try {
      const { id } = req.params;

      // Check if Item GRN exists
      const existingItemGRN = await ItemGRNModel.findById(id);
      if (!existingItemGRN) {
        return res.status(404).json({
          success: false,
          message: "Item GRN not found",
        });
      }

      const files = await ItemGRNFileModel.findByItemGRNId(id);

      res.json({
        success: true,
        data: files,
      });
    } catch (error) {
      console.error("Error fetching files:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch files",
        error: error.message,
      });
    }
  }
}

module.exports = FileUploadController;
