const ItemGRNModel = require("../models/itemGRNModel");
const ItemGRNFileModel = require("../models/itemGRNFileModel");
const ItemGRNDetailModel = require("../models/itemGRNDetailModel");
const {
  validateGRNData,
  generateGRNNumber,
  deleteFile,
} = require("../utils/helpers");
const pool = require("../config/database");

class ItemGRNController {
  // Create new Item GRN with files and details - FIXED VERSION
  static async createItemGRN(req, res) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      console.log("=== CREATE ITEM GRN REQUEST ===");
      console.log("Request body keys:", Object.keys(req.body));
      console.log("Files count:", req.files ? req.files.length : 0);

      // Log all received fields
      Object.keys(req.body).forEach((key) => {
        console.log(`${key}:`, req.body[key]);
      });

      // First, let's log all keys in req.body to see what we're getting
      console.log("All req.body keys (raw):", Object.keys(req.body));

      // Create a trimmed version of req.body for validation
      const trimmedBody = {};
      Object.keys(req.body).forEach((key) => {
        trimmedBody[key.trim()] = req.body[key];
      });

      console.log("All req.body keys (trimmed):", Object.keys(trimmedBody));

      // Validate required fields
      const requiredFields = [
        "middle_category",
        "sub_category",
        "item_name",
        "po_no",
        "supplier",
        "qty",
        "date",
        "invoice_no",
        "grn_date",
        "grn_no",
      ];

      const validationErrors = [];

      requiredFields.forEach((field) => {
        const value = trimmedBody[field];
        console.log(`Validating ${field}:`, value, "Type:", typeof value);

        if (!value || value.toString().trim() === "") {
          validationErrors.push(`${field.replace("_", " ")} is required`);
        }
      });

      if (validationErrors.length > 0) {
        console.log("Validation errors:", validationErrors);
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validationErrors,
        });
      }

      // Extract main form data with defaults
      const itemGRNData = {
        middle_category: trimmedBody.middle_category || "",
        sub_category: trimmedBody.sub_category || "",
        item_name: trimmedBody.item_name || "",
        po_no: trimmedBody.po_no || "",
        brand: trimmedBody.brand || null,
        model: trimmedBody.model || null,
        supplier: trimmedBody.supplier || "",
        qty: trimmedBody.qty ? parseInt(trimmedBody.qty) : 1,
        date: trimmedBody.date || "",
        invoice_no: trimmedBody.invoice_no || "",
        unit_price: trimmedBody.unit_price
          ? parseFloat(trimmedBody.unit_price)
          : null,
        inv_total: trimmedBody.inv_total
          ? parseFloat(trimmedBody.inv_total)
          : null,
        manufacturer: trimmedBody.manufacturer || null,
        type: trimmedBody.type || null,
        source: trimmedBody.source || null,
        receive_type: trimmedBody.receive_type || null,
        remarks: trimmedBody.remarks || null,
        grn_date: trimmedBody.grn_date || "",
        grn_no: trimmedBody.grn_no || "",
        warranty_expiry: trimmedBody.warranty_expiry || null,
        service_start: trimmedBody.service_start || null,
        service_end: trimmedBody.service_end || null,
        salvage_value: trimmedBody.salvage_value
          ? parseFloat(trimmedBody.salvage_value)
          : null,
        replicate:
          trimmedBody.replicate === "true" || trimmedBody.replicate === true
            ? 1
            : 0,
      };

      console.log("Processed Item GRN Data:", itemGRNData);

      // Check if GRN number already exists
      const grnExists = await ItemGRNModel.checkGRNNoExists(itemGRNData.grn_no);
      if (grnExists) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: "GRN number already exists. Please use a unique GRN number.",
        });
      }

      // 1. Create Item GRN
      const itemGRNId = await ItemGRNModel.create(itemGRNData);
      console.log("Created Item GRN with ID:", itemGRNId);

      // 2. Process uploaded files
      let filesData = [];
      if (req.files && req.files.length > 0) {
        console.log("Processing", req.files.length, "files");
        filesData = req.files.map((file) => ({
          item_grn_id: itemGRNId,
          file_name: file.originalname,
          file_path: `/uploads/${file.filename}`,
          file_type: file.mimetype,
          file_size: file.size,
        }));

        if (filesData.length > 0) {
          await ItemGRNFileModel.createMultiple(filesData);
          console.log("Files saved:", filesData.length);
        }
      }

      // 3. Process asset allocation details
      let detailsData = [];
      if (trimmedBody.assetAllocations) {
        try {
          const assetAllocations = JSON.parse(trimmedBody.assetAllocations);
          console.log("Parsed asset allocations:", assetAllocations);

          if (assetAllocations.length > 0) {
            detailsData = assetAllocations.map((detail) => ({
              item_grn_id: itemGRNId,
              center: detail.center || null,
              location: detail.location || null,
              department: detail.department || null,
              employee: detail.employee || null,
              serial_no: detail.serialNo || null,
              book_no_local_id: detail.bookNoLocalId || null,
              barcode_no: detail.barcodeNo || null,
            }));

            await ItemGRNDetailModel.createMultiple(detailsData);
            console.log("Details saved:", detailsData.length);
          }
        } catch (error) {
          console.error("Error parsing asset allocations:", error);
          console.error(
            "Asset allocations string:",
            trimmedBody.assetAllocations
          );
          // Continue without details if parsing fails
        }
      }

      await connection.commit();

      res.status(201).json({
        success: true,
        message: "Item GRN created successfully",
        data: {
          id: itemGRNId,
          grn_no: itemGRNData.grn_no,
          files_count: filesData.length,
          details_count: detailsData.length,
        },
      });
    } catch (error) {
      await connection.rollback();
      console.error("Error creating Item GRN:", error);
      console.error("Error stack:", error.stack);
      console.error("Full error object:", error);

      // Handle duplicate GRN number error
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(400).json({
          success: false,
          message: "GRN number already exists. Please use a unique GRN number.",
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to create Item GRN",
        error: error.message,
        sqlMessage: error.sqlMessage,
        code: error.code,
      });
    } finally {
      connection.release();
    }
  }

  // Get all Item GRNs with pagination
  static async getAllItemGRNs(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || "";

      const result = await ItemGRNModel.findAll(page, limit, search);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error("Error fetching Item GRNs:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch Item GRNs",
        error: error.message,
      });
    }
  }

  // Get Item GRN by ID with files and details
  static async getItemGRNById(req, res) {
    try {
      const { id } = req.params;

      // Get main Item GRN data
      const itemGRN = await ItemGRNModel.findById(id);
      if (!itemGRN) {
        return res.status(404).json({
          success: false,
          message: "Item GRN not found",
        });
      }

      // Get files
      const files = await ItemGRNFileModel.findByItemGRNId(id);

      // Get details
      const details = await ItemGRNDetailModel.findByItemGRNId(id);

      res.json({
        success: true,
        data: {
          ...itemGRN,
          files,
          details,
        },
      });
    } catch (error) {
      console.error("Error fetching Item GRN:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch Item GRN",
        error: error.message,
      });
    }
  }

  // Update Item GRN
  static async updateItemGRN(req, res) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const { id } = req.params;
      const updateData = req.body;

      // Check if Item GRN exists
      const existingItemGRN = await ItemGRNModel.findById(id);
      if (!existingItemGRN) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          message: "Item GRN not found",
        });
      }

      // Check if GRN number is being updated and if it already exists
      if (updateData.grn_no && updateData.grn_no !== existingItemGRN.grn_no) {
        const grnExists = await ItemGRNModel.checkGRNNoExists(
          updateData.grn_no,
          id
        );
        if (grnExists) {
          await connection.rollback();
          return res.status(400).json({
            success: false,
            message:
              "GRN number already exists. Please use a unique GRN number.",
          });
        }
      }

      // Update Item GRN
      const updatedRows = await ItemGRNModel.update(id, updateData);
      if (updatedRows === 0) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: "No changes made",
        });
      }

      await connection.commit();

      res.json({
        success: true,
        message: "Item GRN updated successfully",
      });
    } catch (error) {
      await connection.rollback();
      console.error("Error updating Item GRN:", error);

      if (error.code === "ER_DUP_ENTRY") {
        return res.status(400).json({
          success: false,
          message: "GRN number already exists. Please use a unique GRN number.",
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to update Item GRN",
        error: error.message,
      });
    } finally {
      connection.release();
    }
  }

  // Delete Item GRN
  static async deleteItemGRN(req, res) {
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

      // Get files to delete from filesystem
      const files = await ItemGRNFileModel.findByItemGRNId(id);

      // Delete Item GRN (cascade will delete files and details)
      const deletedRows = await ItemGRNModel.delete(id);

      if (deletedRows === 0) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: "Failed to delete Item GRN",
        });
      }

      // Delete files from filesystem
      files.forEach((file) => {
        deleteFile(file.file_path);
      });

      await connection.commit();

      res.json({
        success: true,
        message: "Item GRN deleted successfully",
      });
    } catch (error) {
      await connection.rollback();
      console.error("Error deleting Item GRN:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete Item GRN",
        error: error.message,
      });
    } finally {
      connection.release();
    }
  }

  // Get Item GRN statistics
  static async getStats(req, res) {
    try {
      const stats = await ItemGRNModel.getStats();
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("Error fetching Item GRN stats:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch Item GRN statistics",
        error: error.message,
      });
    }
  }

  // Generate new GRN number
  static async generateGRNNo(req, res) {
    try {
      const grnNo = generateGRNNumber();
      res.json({
        success: true,
        data: {
          grn_no: grnNo,
        },
      });
    } catch (error) {
      console.error("Error generating GRN number:", error);
      res.status(500).json({
        success: false,
        message: "Failed to generate GRN number",
        error: error.message,
      });
    }
  }
}

module.exports = ItemGRNController;
