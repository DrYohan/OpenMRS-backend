const pool = require("../config/database");

// Helper function to extract numeric ID
function extractNumericId(idString) {
  if (!idString) return null;

  // If it's already a number, return it
  if (!isNaN(idString) && idString !== "") {
    return parseInt(idString);
  }

  // Extract numbers from string like "D001", "DEPT001", etc.
  if (typeof idString === "string") {
    const match = idString.match(/\d+/);
    return match ? parseInt(match[0]) : null;
  }

  return null;
}

class ItemGRNModel {
  // Create new Item GRN - UPDATED FOR FILE PATHS
  static async create(itemGRNData) {
    console.log("Creating Item GRN with data:", {
      item_serial: itemGRNData.item_serial,
      item_name: itemGRNData.item_name,
      grn_no: itemGRNData.grn_no,
      serial_no: itemGRNData.serial_no,
      has_images: !!(
        itemGRNData.Item1Pic ||
        itemGRNData.Item2Pic ||
        itemGRNData.Item3Pic ||
        itemGRNData.Item4Pic
      ),
    });

    // Map from frontend field names to database column names
    const mappedData = {
      // CUSTOM ItemSerial - must be included
      ItemSerial: itemGRNData.item_serial || null,

      // Map basic fields from frontend form
      StationId: itemGRNData.center || null,

      // FIXED: Handle DepartmentSerial - extract numeric part from D001
      DepartmentSerial: extractNumericId(itemGRNData.department),
      MiddleCategory: itemGRNData.middle_category || null,
      EmployeeSerial: itemGRNData.employee || null,
      SupplierSerial: itemGRNData.supplier
        ? isNaN(parseInt(itemGRNData.supplier))
          ? null
          : parseInt(itemGRNData.supplier)
        : null,
      PONo: itemGRNData.po_no || "",
      PurchaseDate: itemGRNData.date ? new Date(itemGRNData.date) : null,
      InvoiceNo: itemGRNData.invoice_no || "",
      UnitPrice: itemGRNData.unit_price || null,
      InvoiceTotal: itemGRNData.inv_total || null,
      InType: itemGRNData.receive_type || null,
      Source: itemGRNData.source || null,
      SalvageValue: itemGRNData.salvage_value || null,
      Remarks: itemGRNData.remarks || null,
      SubCategory: itemGRNData.sub_category || null,
      SubCategoryId: itemGRNData.sub_category || null,
      ItemName: itemGRNData.item_name || "",
      Brand: itemGRNData.brand || null,
      Model: itemGRNData.model || null,
      Manufacture: itemGRNData.manufacturer || null,
      Type: itemGRNData.type || null,
      WarrantyExpireDate: itemGRNData.warranty_expiry
        ? new Date(itemGRNData.warranty_expiry)
        : null,
      ServiceAgreementStartDate: itemGRNData.service_start
        ? new Date(itemGRNData.service_start)
        : null,
      ServiceAgreementEndDate: itemGRNData.service_end
        ? new Date(itemGRNData.service_end)
        : null,
      SerialNo: itemGRNData.serial_no || null,
      BookNo: itemGRNData.book_no_local_id || null,
      BarcodeNo: itemGRNData.barcode_no || null,
      GrnNo: itemGRNData.grn_no || "",
      GRNdate: itemGRNData.grn_date ? new Date(itemGRNData.grn_date) : null,
      CDate: new Date(),
      Status: "Active",
      CBy: 1,
      ReplicateFlag: itemGRNData.replicate || 0,
      X: itemGRNData.location || null,
      Supplier: itemGRNData.supplier || null,
      // Image path fields - store as VARCHAR
      Item1Pic: itemGRNData.Item1Pic || null,
      Item2Pic: itemGRNData.Item2Pic || null,
      Item3Pic: itemGRNData.Item3Pic || null,
      Item4Pic: itemGRNData.Item4Pic || null,
    };

    // Debug: Check if image paths are present
    console.log("Image path check:");
    console.log(
      "Item1Pic:",
      mappedData.Item1Pic ? `Path: ${mappedData.Item1Pic}` : "Null"
    );
    console.log(
      "Item2Pic:",
      mappedData.Item2Pic ? `Path: ${mappedData.Item2Pic}` : "Null"
    );
    console.log(
      "Item3Pic:",
      mappedData.Item3Pic ? `Path: ${mappedData.Item3Pic}` : "Null"
    );
    console.log(
      "Item4Pic:",
      mappedData.Item4Pic ? `Path: ${mappedData.Item4Pic}` : "Null"
    );

    // Validate that ItemSerial is provided
    if (!mappedData.ItemSerial) {
      throw new Error("ItemSerial is required");
    }

    // Define columns for the new structure
    const columns = [];
    const values = [];
    const placeholders = [];

    Object.keys(mappedData).forEach((key) => {
      if (mappedData[key] !== undefined && mappedData[key] !== null) {
        columns.push(key);
        values.push(mappedData[key]);
        placeholders.push("?");
      }
    });

    if (columns.length === 0) {
      throw new Error("No data provided for Item GRN");
    }

    const query = `INSERT INTO item_grn (${columns.join(
      ", "
    )}) VALUES (${placeholders.join(", ")})`;

    console.log("Generated Query:", query);
    console.log("Number of columns:", columns.length);
    console.log(
      "Columns with image paths:",
      columns.filter((col) => col.includes("Item") && col.includes("Pic"))
    );

    try {
      const [result] = await pool.execute(query, values);
      console.log("✓ Insert successful, ItemSerial:", mappedData.ItemSerial);
      return mappedData.ItemSerial; // Return the custom ItemSerial instead of auto-increment ID
    } catch (error) {
      console.error("✗ SQL Error in create method:");
      console.error("Message:", error.message);
      console.error("Code:", error.code);
      console.error("SQL State:", error.sqlState);
      console.error("Query:", query);
      console.error("First 3 values:", values.slice(0, 3));
      throw error;
    }
  }

  // ... rest of your itemGRNModel.js code remains the same ...

  // Find by ID
  static async findById(id) {
    const [rows] = await pool.execute(
      "SELECT * FROM item_grn WHERE ItemSerial = ?",
      [id]
    );
    return rows[0];
  }

  // Find all items by GRN number
  static async findByGrnNo(grn_no) {
    const [rows] = await pool.execute(
      "SELECT * FROM item_grn WHERE GrnNo = ? ORDER BY ItemSerial ASC",
      [grn_no]
    );
    return rows;
  }

  // Check if GRN number exists
  static async checkGRNNoExists(grn_no, excludeId = null) {
    let query = "SELECT ItemSerial FROM item_grn WHERE GrnNo = ?";
    const params = [grn_no];

    if (excludeId) {
      query += " AND ItemSerial != ?";
      params.push(excludeId);
    }

    const [rows] = await pool.execute(query, params);
    return rows.length > 0;
  }

  // Get first item by GRN number
  static async findFirstByGrnNo(grn_no) {
    const [rows] = await pool.execute(
      "SELECT * FROM item_grn WHERE GrnNo = ? LIMIT 1",
      [grn_no]
    );
    return rows[0];
  }

  // Update Item GRN
  static async update(id, updateData) {
    console.log("Updating Item GRN with ID:", id);
    console.log("Update data received:", updateData);

    // Map frontend field names to database column names - CORRECTED BASED ON TABLE SCHEMA
    const fieldMapping = {
      // Main form fields
      middle_category: "StationId", // Map middle_category to StationId
      sub_category: "SubCategoryId", // Map sub_category to SubCategoryId
      item_name: "ItemName",
      po_no: "PONo",
      brand: "Brand",
      model: "Model",
      supplier: "SupplierSerial",

      date: "PurchaseDate",
      invoice_no: "InvoiceNo",
      unit_price: "UnitPrice",
      inv_total: "InvoiceTotal",
      manufacturer: "Manufacture",
      type: "Type",
      source: "Source",
      receive_type: "InType",
      remarks: "Remarks",
      grn_date: "GRNdate",
      grn_no: "GrnNo",
      warranty_expiry: "WarrantyExpireDate",
      service_start: "ServiceAgreementStartDate",
      service_end: "ServiceAgreementEndDate",
      salvage_value: "SalvageValue", // This column exists
      replicate: "ReplicateFlag",

      // Asset allocation fields
      center: "StationId",
      department: "DepartmentSerial",
      location: "X",
      employee: "EmployeeSerial",
      serial_no: "SerialNo",
      book_no_local_id: "BookNo",
      barcode_no: "BarcodeNo",

      // Image fields
      Item1Pic: "Item1Pic",
      Item2Pic: "Item2Pic",
      Item3Pic: "Item3Pic",
      Item4Pic: "Item4Pic",
    };

    // Prepare mapped update data
    const mappedData = {};
    Object.keys(updateData).forEach((key) => {
      if (
        updateData[key] !== undefined &&
        updateData[key] !== null &&
        fieldMapping[key]
      ) {
        mappedData[fieldMapping[key]] = updateData[key];
      }
    });

    // Handle special cases
    // 1. Remove Qty since it doesn't exist in the table
    delete mappedData.Qty;

    // 2. Convert numeric fields
    if (
      mappedData.SupplierSerial &&
      typeof mappedData.SupplierSerial === "string"
    ) {
      mappedData.SupplierSerial = isNaN(parseInt(mappedData.SupplierSerial))
        ? null
        : parseInt(mappedData.SupplierSerial);
    }

    if (
      mappedData.DepartmentSerial &&
      typeof mappedData.DepartmentSerial === "string"
    ) {
      mappedData.DepartmentSerial = extractNumericId(
        mappedData.DepartmentSerial
      );
    }

    if (mappedData.StationId && typeof mappedData.StationId === "string") {
      mappedData.StationId = extractNumericId(mappedData.StationId);
    }

    if (
      mappedData.EmployeeSerial &&
      typeof mappedData.EmployeeSerial === "string"
    ) {
      mappedData.EmployeeSerial = isNaN(parseInt(mappedData.EmployeeSerial))
        ? null
        : parseInt(mappedData.EmployeeSerial);
    }

    // 3. Convert dates to proper format
    if (mappedData.PurchaseDate && mappedData.PurchaseDate instanceof Date) {
      mappedData.PurchaseDate = mappedData.PurchaseDate.toISOString()
        .slice(0, 19)
        .replace("T", " ");
    }

    if (mappedData.GRNdate && mappedData.GRNdate instanceof Date) {
      mappedData.GRNdate = mappedData.GRNdate.toISOString()
        .slice(0, 19)
        .replace("T", " ");
    }

    if (
      mappedData.WarrantyExpireDate &&
      mappedData.WarrantyExpireDate instanceof Date
    ) {
      mappedData.WarrantyExpireDate =
        mappedData.WarrantyExpireDate.toISOString()
          .slice(0, 19)
          .replace("T", " ");
    }

    if (
      mappedData.ServiceAgreementStartDate &&
      mappedData.ServiceAgreementStartDate instanceof Date
    ) {
      mappedData.ServiceAgreementStartDate =
        mappedData.ServiceAgreementStartDate.toISOString()
          .slice(0, 19)
          .replace("T", " ");
    }

    if (
      mappedData.ServiceAgreementEndDate &&
      mappedData.ServiceAgreementEndDate instanceof Date
    ) {
      mappedData.ServiceAgreementEndDate =
        mappedData.ServiceAgreementEndDate.toISOString()
          .slice(0, 19)
          .replace("T", " ");
    }

    console.log("Mapped update data:", mappedData);

    const fields = Object.keys(mappedData);
    const values = Object.values(mappedData);

    if (fields.length === 0) {
      console.log("No valid fields to update");
      return 0;
    }

    const setClause = fields.map((field) => `${field} = ?`).join(", ");
    const query = `UPDATE item_grn SET ${setClause}, UpdatedAt = CURRENT_TIMESTAMP WHERE ItemSerial = ?`;

    values.push(id);

    console.log("Update query:", query);
    console.log("Update values:", values);

    try {
      const [result] = await pool.execute(query, values);
      console.log(`Rows affected: ${result.affectedRows}`);
      return result.affectedRows;
    } catch (error) {
      console.error("Error in update method:");
      console.error("Message:", error.message);
      console.error("Code:", error.code);
      console.error("SQL State:", error.sqlState);
      console.error("Query:", query);
      console.error("Values:", values);
      throw error;
    }
  }

  // Get all Item GRNs with pagination - RETURN ALL FIELDS
  static async findAll(page = 1, limit = 10, search = "") {
    const offset = (page - 1) * limit;

    // Select ALL fields from the item_grn table
    let query = `
  SELECT 
    ItemSerial,
    StationId,
    DepartmentSerial,
    EmployeeSerial,
    CurrentItemCode,
    SupplierSerial,
    PONo,
    PurchaseDate,
    InvoiceNo,
    UnitPrice,
    InvoiceTotal,
    InType,
    Source,
    SalvageValue,
    Remarks,
    SubCategoryId,
    ItemName,
    Brand,
    Model,
    Manufacture,
    Type,
    WarrantyExpireDate,
    ServiceAgreementStartDate,
    ServiceAgreementEndDate,
    SerialNo,
    BookNo,
    Status,
    X,
    Y,
    GrnNo,
    GRNdate,
    VoucherNo,
    VoucherDate,
    TransportCost,
    RefNo,
    InstallationCost,
    NBT,
    VAT,
    OtherCost,
    ApprovedBy,
    AuthorityGivenBy,
    AgreementNo,
    Author,
    IsbnNo,
    Capacity,
    Press,
    CBy,
    CDate,
    OperSystem,
    ManufAddress,
    ManufDate,
    RegistrationNo,
    LicenseFee,
    EngineNo,
    ChassisNo,
    Drive,
    FuelType,
    Lubricants,
    Material,
    CapacitySize,
    ReValueDate,
    ReValueAmount,
    ReValueRmarks,
    BarcodeNo,
    Vote,
    PurchaseType,
    ItemAppBy,
    ItemAppDate,
    UnitSerial,
    SubUnitSerial,
    BookNo2,
    Level3Serial,
    CreatedAt,
    UpdatedAt,
    ReplicateFlag,
    CustomItemSerial,
    (CASE WHEN Item1Pic IS NOT NULL OR Item2Pic IS NOT NULL OR Item3Pic IS NOT NULL OR Item4Pic IS NOT NULL THEN 1 ELSE 0 END) as HasImages
  FROM item_grn 
  WHERE 1=1
  `;

    let countQuery = `
  SELECT COUNT(*) as total FROM item_grn WHERE 1=1
  `;

    const queryParams = [];
    const countParams = [];

    if (search && search.trim() !== "") {
      const searchTerm = `%${search.trim()}%`;
      query += ` AND (
    ItemName LIKE ? OR 
    InvoiceNo LIKE ? OR 
    GrnNo LIKE ? OR 
    SerialNo LIKE ? OR
    BarcodeNo LIKE ? OR
    ItemSerial LIKE ? OR
    PONo LIKE ? OR
    Manufacture LIKE ?
  )`;
      countQuery += ` AND (
    ItemName LIKE ? OR 
    InvoiceNo LIKE ? OR 
    GrnNo LIKE ? OR 
    SerialNo LIKE ? OR
    BarcodeNo LIKE ? OR
    ItemSerial LIKE ? OR
    PONo LIKE ? OR
    Manufacture LIKE ?
  )`;

      // Add search parameters - 8 times for both queries
      for (let i = 0; i < 8; i++) {
        queryParams.push(searchTerm);
        countParams.push(searchTerm);
      }
    }

    // Use string interpolation for LIMIT and OFFSET
    query += ` ORDER BY ItemSerial DESC LIMIT ${limit} OFFSET ${offset}`;

    console.log("=== FINDALL QUERY DEBUG ===");
    console.log("Query:", query);
    console.log("Query params:", queryParams);

    try {
      // Execute main query with parameters (if any)
      const [rows] =
        queryParams.length > 0
          ? await pool.execute(query, queryParams)
          : await pool.execute(query);

      // Execute count query with parameters (if any)
      const [countResult] =
        countParams.length > 0
          ? await pool.execute(countQuery, countParams)
          : await pool.execute(countQuery);

      const total = countResult[0].total;

      console.log(`Found ${rows.length} rows out of ${total} total`);

      // Return all data
      return {
        data: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Error executing findAll query:", error);
      console.error("Query:", query);
      console.error("Parameters:", queryParams);
      throw error;
    }
  }

  // Get Item GRN statistics
  static async getStats() {
    const [totalResult] = await pool.execute(
      "SELECT COUNT(*) as total FROM item_grn"
    );
    const [recentResult] = await pool.execute(
      "SELECT COUNT(*) as recent FROM item_grn WHERE CreatedAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)"
    );
    const [valueResult] = await pool.execute(
      "SELECT SUM(InvoiceTotal) as total_value FROM item_grn"
    );
    const [grnCountResult] = await pool.execute(
      "SELECT COUNT(DISTINCT GrnNo) as unique_grns FROM item_grn"
    );

    return {
      total: totalResult[0].total,
      recent: recentResult[0].recent,
      totalValue: valueResult[0].total_value || 0,
      uniqueGrns: grnCountResult[0].unique_grns || 0,
    };
  }

  // Delete Item GRN
  static async delete(id) {
    const [result] = await pool.execute(
      "DELETE FROM item_grn WHERE ItemSerial = ?",
      [id]
    );
    return result.affectedRows;
  }

  // Get all item GRN data with images
  static async getAllWithImages(page = 1, limit = 10, search = "") {
    const offset = (page - 1) * limit;

    let query = `
    SELECT 
      ItemSerial,
      ItemName,
      SerialNo,
      BarcodeNo,
      BookNo,
      GrnNo,
      PONo,
      InvoiceNo,
      PurchaseDate,
      GRNdate,
      Status,
      CDate,
      CreatedAt,
      StationId,
      DepartmentSerial,
      EmployeeSerial,
      SupplierSerial,
      UnitPrice,
      InvoiceTotal,
      InType,
      Source,
      SalvageValue,
      Remarks,
      SubCategoryId,
      Brand,
      Model,
      Manufacture,
      Type,
      WarrantyExpireDate,
      ServiceAgreementStartDate,
      ServiceAgreementEndDate,
      X,
      ReplicateFlag,
      (CASE WHEN Item1Pic IS NOT NULL OR Item2Pic IS NOT NULL OR Item3Pic IS NOT NULL OR Item4Pic IS NOT NULL THEN 1 ELSE 0 END) as HasImages
    FROM item_grn 
    WHERE 1=1
  `;

    let countQuery = `SELECT COUNT(*) as total FROM item_grn WHERE 1=1`;
    const queryParams = [];
    const countParams = [];

    if (search && search.trim() !== "") {
      const searchTerm = `%${search.trim()}%`;
      query += ` AND (
      ItemName LIKE ? OR 
      PONo LIKE ? OR 
      InvoiceNo LIKE ? OR 
      GrnNo LIKE ? OR 
      SerialNo LIKE ? OR
      Manufacture LIKE ? OR
      BarcodeNo LIKE ?
    )`;
      countQuery += ` AND (
      ItemName LIKE ? OR 
      PONo LIKE ? OR 
      InvoiceNo LIKE ? OR 
      GrnNo LIKE ? OR 
      SerialNo LIKE ? OR
      Manufacture LIKE ? OR
      BarcodeNo LIKE ?
    )`;

      // Add search parameters - 7 times for both queries
      for (let i = 0; i < 7; i++) {
        queryParams.push(searchTerm);
        countParams.push(searchTerm);
      }
    }

    // FIX: Use string interpolation for LIMIT and OFFSET
    query += ` ORDER BY ItemSerial DESC LIMIT ${limit} OFFSET ${offset}`;

    console.log("=== GETALLWITHIMAGES QUERY DEBUG ===");
    console.log("Query:", query);
    console.log("Query params:", queryParams);

    try {
      // Execute main query with parameters (if any)
      const [rows] =
        queryParams.length > 0
          ? await pool.execute(query, queryParams)
          : await pool.execute(query);

      // Execute count query with parameters (if any)
      const [countResult] =
        countParams.length > 0
          ? await pool.execute(countQuery, countParams)
          : await pool.execute(countQuery);

      const total = countResult[0].total;

      console.log(`Found ${rows.length} rows out of ${total} total`);

      return {
        data: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Error executing getAllWithImages query:", error);
      console.error("Query:", query);
      console.error("Parameters:", queryParams);
      throw error;
    }
  }

  static async executeQueryWithLimit(query, params, limit, offset) {
    // Check if we need to use string interpolation for this MySQL version
    const useInterpolation = true; // Set based on your MySQL version

    if (useInterpolation) {
      // Use string interpolation for LIMIT and OFFSET
      const finalQuery = query + ` LIMIT ${limit} OFFSET ${offset}`;
      console.log("Executing with interpolation:", finalQuery);
      return await pool.execute(finalQuery, params);
    } else {
      // Use placeholders (for MySQL versions that support it)
      const finalQuery = query + ` LIMIT ? OFFSET ?`;
      const finalParams = [...params, limit, offset];
      console.log("Executing with placeholders:", finalQuery);
      return await pool.execute(finalQuery, finalParams);
    }
  }

  // In itemGRNModel.js, add this method:
  static async searchForBrowse(page = 1, limit = 20, search = "") {
    const offset = (page - 1) * limit;

    // Build WHERE clause
    let whereClause = "WHERE 1=1";
    const queryParams = [];
    const countParams = [];

    if (search && search.trim() !== "") {
      const searchTerm = `%${search.trim()}%`;
      whereClause += ` AND (
      ItemName LIKE ? OR 
      InvoiceNo LIKE ? OR 
      GrnNo LIKE ? OR 
      SerialNo LIKE ? OR
      BarcodeNo LIKE ? OR
      ItemSerial LIKE ?
    )`;

      // Add search parameters - 6 times
      for (let i = 0; i < 6; i++) {
        queryParams.push(searchTerm);
        countParams.push(searchTerm);
      }
    }

    // Build final queries
    const query = `
    SELECT 
      ItemSerial as id,
      ItemSerial,
      StationId,
      DepartmentSerial,
      InvoiceNo,
      ItemName,
      GrnNo,
      BarcodeNo,
      CreatedAt,
      (CASE WHEN Item1Pic IS NOT NULL OR Item2Pic IS NOT NULL OR Item3Pic IS NOT NULL OR Item4Pic IS NOT NULL THEN 1 ELSE 0 END) as HasImages
    FROM item_grn 
    ${whereClause}
    ORDER BY CreatedAt DESC
    LIMIT ${limit} OFFSET ${offset}
  `;

    const countQuery = `
    SELECT COUNT(*) as total 
    FROM item_grn 
    ${whereClause}
  `;

    console.log("=== SEARCH QUERY DEBUG ===");
    console.log("Query:", query);
    console.log("Query params:", queryParams);
    console.log("Count query:", countQuery);
    console.log("Count query params:", countParams);

    try {
      // Execute main query with parameters
      const [rows] =
        queryParams.length > 0
          ? await pool.execute(query, queryParams)
          : await pool.execute(query);

      // Execute count query with parameters
      const [countResult] =
        countParams.length > 0
          ? await pool.execute(countQuery, countParams)
          : await pool.execute(countQuery);

      const total = countResult[0].total;

      console.log(`Found ${rows.length} rows out of ${total} total`);

      return {
        data: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Error executing search query:", error);
      console.error("Query:", query);
      console.error("Parameters:", queryParams);
      throw error;
    }
  }

  // Get complete item details by ID including images
  static async getCompleteItemById(id) {
    const query = `
    SELECT 
      ItemSerial,
      ItemName,
      SerialNo,
      BarcodeNo,
      BookNo,
      GrnNo,
      PONo,
      InvoiceNo,
      PurchaseDate,
      GRNdate,
      Status,
      CDate,
      CreatedAt,
      StationId,
      DepartmentSerial,
      EmployeeSerial,
      SupplierSerial,
      UnitPrice,
      InvoiceTotal,
      InType,
      Source,
      SalvageValue,
      Remarks,
      SubCategoryId,
      Brand,
      Model,
      Manufacture,
      Type,
      WarrantyExpireDate,
      ServiceAgreementStartDate,
      ServiceAgreementEndDate,
      X,
      ReplicateFlag,
      Item1Pic,
      Item2Pic,
      Item3Pic,
      Item4Pic
    FROM item_grn 
    WHERE ItemSerial = ?
  `;

    const [rows] = await pool.execute(query, [id]);
    return rows[0];
  }
}

module.exports = ItemGRNModel;
