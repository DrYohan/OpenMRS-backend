const pool = require("../config/database");
const SupplierService = require("../services/SupplierService");

const SupplierController = {
  async createSupplier(req, res) {
    try {
      console.log("Request body:", req.body);

      const {
        stationId,
        supplierCode,
        supplierName,
        contactPerson,
        address,
        categories,
        telephone,
        fax,
        email,
        tinNo,
        status,
      } = req.body;

      const duplicatedEmail = await SupplierService.isEmailExist(email);
      console.log("Is email duplicated?", duplicatedEmail);
      if (duplicatedEmail)
        return res.status(400).json({ message: "Email already exists" });

      const sql = `
        INSERT INTO suppliers
        (
          station_id,
          supplier_code,
          supplier_name,
          contact_person,
          address,
          categories,
          telephone,
          fax,
          email,
          tin_no,
          status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await pool.execute(sql, [
        stationId,
        supplierCode,
        supplierName,
        contactPerson,
        address,
        JSON.stringify(categories), // store array as JSON
        telephone,
        fax,
        email,
        tinNo,
        status ? 1 : 0, // MySQL boolean
      ]);

      return res.status(201).json({
        message: "Supplier created successfully",
        supplierId: result.insertId,
      });
    } catch (error) {
      console.error("Error creating supplier:", error);

      // Duplicate entry handling
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(400).json({
          error: "Supplier code or email already exists",
        });
      }

      return res.status(500).json({
        error: "Internal server error",
      });
    }
  },

  // Get ALL suppliers data
  async getAllSuppliers(req, res) {
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM suppliers ORDER BY created_at DESC"
      );

      const suppliers = rows.map((row) => {
        // Create a copy of the row
        const supplier = { ...row };

        // Convert status to boolean
        supplier.status = row.status === 1;

        // Safely handle categories
        if (row.categories) {
          try {
            // First try to parse as JSON
            supplier.categories = JSON.parse(row.categories);
          } catch (parseError) {
            // If it's a string but not valid JSON, try to clean it
            if (typeof row.categories === "string") {
              // Remove any problematic characters
              const cleaned = row.categories
                .replace(/[^\x20-\x7E]/g, "") // Remove non-ASCII
                .replace(/'/g, '"') // Replace single quotes with double quotes
                .trim();

              // Try to parse cleaned version
              if (cleaned.startsWith("[") && cleaned.endsWith("]")) {
                try {
                  supplier.categories = JSON.parse(cleaned);
                } catch {
                  // If still fails, set to empty array
                  supplier.categories = [];
                }
              } else {
                // If it doesn't look like JSON array, wrap it in array
                supplier.categories = [row.categories];
              }
            } else {
              // If it's not a string, set to empty array
              supplier.categories = [];
            }
          }
        } else {
          supplier.categories = [];
        }

        return supplier;
      });

      return res.status(200).json({
        success: true,
        message: "Suppliers fetched successfully",
        count: suppliers.length,
        data: suppliers,
      });
    } catch (error) {
      console.error("Error fetching all suppliers:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch suppliers",
        error: error.message,
      });
    }
  },

  // Get all supplier codes (for dropdowns)
  async getAllSupplierCode(req, res) {
    try {
      const [rows] = await pool.execute("SELECT supplier_code FROM suppliers");
      const data = rows.map((r) => r.supplier_code);
      return res.status(200).json({
        message: "Supplier codes fetched successfully",
        data: data || [],
      });
    } catch (error) {
      console.error("Error fetching supplier codes:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  async getSupplierByCode(req, res) {
    const { code } = req.params;
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM suppliers WHERE supplier_code = ?",
        [code]
      );

      if (rows.length === 0) {
        return res.status(404).json({ message: "Supplier not found" });
      }

      const row = rows[0];
      // Process the single supplier similar to getAllSuppliers
      const supplier = { ...row };
      supplier.status = row.status === 1;

      if (row.categories) {
        try {
          supplier.categories = JSON.parse(row.categories);
        } catch {
          if (typeof row.categories === "string") {
            const cleaned = row.categories
              .replace(/[^\x20-\x7E]/g, "")
              .replace(/'/g, '"')
              .trim();
            if (cleaned.startsWith("[") && cleaned.endsWith("]")) {
              try {
                supplier.categories = JSON.parse(cleaned);
              } catch {
                supplier.categories = [];
              }
            } else {
              supplier.categories = [row.categories];
            }
          } else {
            supplier.categories = [];
          }
        }
      } else {
        supplier.categories = [];
      }

      return res.status(200).json({
        message: "Supplier fetched successfully",
        data: supplier,
      });
    } catch (error) {
      console.error("Error fetching supplier by code:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  async updateSupplier(req, res) {
    const { code } = req.params;
    const {
      stationId,
      supplierCode,
      supplierName,
      contactPerson,
      address,
      categories,
      telephone,
      fax,
      email,
      tinNo,
      status,
    } = req.body;

    try {
      const sql = `
        UPDATE suppliers
        SET
          station_id = ?,
          supplier_code = ?,
          supplier_name = ?,
          contact_person = ?,
          address = ?,
          categories = ?,
          telephone = ?,
          fax = ?,
          email = ?,
          tin_no = ?,
          status = ?
        WHERE supplier_code = ?
      `;

      const [result] = await pool.execute(sql, [
        stationId,
        supplierCode,
        supplierName,
        contactPerson,
        address,
        JSON.stringify(categories), // array as JSON
        telephone,
        fax,
        email,
        tinNo,
        status ? 1 : 0, // boolean to 1/0
        code, // supplier_code in WHERE clause
      ]);

      return res.status(200).json({
        success: true,
        message: "Supplier updated successfully",
      });
    } catch (error) {
      console.error("Error updating supplier:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  },
};

module.exports = SupplierController;
