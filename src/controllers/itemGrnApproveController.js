const pool = require("../config/database");

const ItemGrnApproveController = { 
    async getAllGrnNo(req, res) {
        try {
            const [rows] =  await pool.execute(
                "SELECT grn_no FROM item_grn ORDER BY grn_no ASC"
            );
             // extract only grn_no
            const grnNos = rows.map(row => row.grn_no);
            console.log(grnNos);
            res.status(200).json({
                success: true,
                data: grnNos
            });
            
        } catch (error) {
            console.error("Error fetching GRN numbers:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    },


  async getRecordsByGrnNo(req, res) {
    try {
      const { grnNo } = req.params;

      const [rows] = await pool.execute(
        `
       SELECT 
    i.*,
    (SELECT JSON_ARRAYAGG(f.file_path)
     FROM item_grn_files f
     WHERE f.item_grn_id = i.id) AS file_paths,
    (SELECT JSON_ARRAYAGG(JSON_OBJECT(
        'id', d.id,
        'item_grn_id', d.item_grn_id,
        'center_id', d.center,
        'center_name', c.center_name,
        'location_id', d.location,
        'location_name', l.location_name,
        'department', d.department,
        'department_name', dep.department_name,
        'employee', d.employee,
        'employee_name', e.employee_name,
        'serial_no', d.serial_no,
        'book_no_local_id', d.book_no_local_id,
        'barcode_no', d.barcode_no,
        'status', d.status,
        'created_at', d.created_at
    ))
     FROM item_grn_details d
     LEFT JOIN centers c ON c.id = d.center
     LEFT JOIN locations l ON l.id = d.location
     LEFT JOIN employees e ON e.id = d.employee
     LEFT JOIN departments dep ON dep.id = d.department
     WHERE d.item_grn_id = i.id
    ) AS details
FROM item_grn i
WHERE i.grn_no = ?;

        `,
        [grnNo]
      );

      console.log("rows", rows)

      res.status(200).json({ success: true, data: rows });

    } catch (error) {
      console.error("Error fetching records by GRN number:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },


  // Update status of a single item
  async updateItemStatus(req, res) {
    try {
      const { id } = req.params; // id of the item_grn_details
      const { status } = req.body; // status: 1 (approve) or 0 (reject)

      // Validate input
      if (status !== 0 && status !== 1) {
        return res.status(400).json({ error: "Invalid status value" });
      }

      const [result] = await pool.execute(
        "UPDATE item_grn_details SET status = ? WHERE id = ?",
        [status, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Item not found" });
      }

      res.status(200).json({ success: true, message: "Status updated successfully" });
    } catch (error) {
      console.error("Error updating item status:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },


  async handleApproveItems1 (req, res) {
    const connection = await pool.getConnection();

    try {
      const { items } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "No items provided" });
      }

      await connection.beginTransaction();

      // 🔹 Get current year
      const year = new Date().getFullYear();

      // 🔹 Get last item_code for the year
      const [lastRow] = await connection.execute(
        `SELECT item_code 
        FROM fixed_asset_master 
        WHERE item_code LIKE ? 
        ORDER BY item_code DESC 
        LIMIT 1`,
        [`${year}%`]
      );

      let serial = 0;
      if (lastRow.length > 0) {
        serial = parseInt(lastRow[0].item_code.slice(-5), 10);
      }

      // 🔁 Insert each approved item
      for (const item of items) {
        const itemGrnId = Number(item.item_grn_id);

        // 🔒 FK validation
        if (!itemGrnId) {
          throw new Error(`Invalid item_grn_id: ${item.item_grn_id}`);
        }

        serial += 1;

        // 🔹 Generate item_code: YYYY + 5-digit serial
        const itemCode = `${year}${String(serial).padStart(5, "0")}`;

        console.log("Generated item_code:", itemCode);

        await connection.execute(
          `INSERT INTO fixed_asset_master (
            item_grn_id,
            center,
            location,
            department,
            employee,
            serial_no,
            book_no_local_id,
            barcode_no,
            item_code,
            status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            itemGrnId,
            item.center,
            item.location,
            item.department,
            item.employee,
            item.serial_no,
            item.book_no_local_id,
            item.barcode_no,
            itemCode,
            item.status ?? 1
          ]
        );
      }

      await connection.commit();

      res.status(200).json({
        message: "Items approved and assets created successfully"
      });

    } catch (error) {
      await connection.rollback();
      console.error("Error inserting master records:", error);

      res.status(500).json({
        message: "Failed to approve items",
        error: error.message
      });

    } finally {
      connection.release();
    }
  },

  async handleApproveItems2 (req, res) {
    const connection = await pool.getConnection();

    try {
      const { items } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "No items provided" });
      }

      await connection.beginTransaction();

      // 🔹 Get current year
      const year = new Date().getFullYear();

      // 🔹 Get last item_code for the year
      const [lastRow] = await connection.execute(
        `SELECT item_code 
        FROM fixed_asset_master 
        WHERE item_code LIKE ? 
        ORDER BY item_code DESC 
        LIMIT 1`,
        [`${year}%`]
      );

      let serial = 0;
      if (lastRow.length > 0) {
        serial = parseInt(lastRow[0].item_code.slice(-5), 10);
      }
  console.log("eeee Serial number for item_code:", serial);
        serial += 1;

        console.log("Serial number for item_code:", serial);

        // 🔹 Generate item_code: YYYY + 5-digit serial
        const itemCode = `${year}${String(serial).padStart(6, "0")}`;

        console.log("Generated item_code:", itemCode);

      // 🔁 Insert each approved item
      for (const item of items) {
        const itemGrnId = Number(item.item_grn_id);

        // 🔒 FK validation
        if (!itemGrnId) {
          throw new Error(`Invalid item_grn_id: ${item.item_grn_id}`);
        }



        await connection.execute(
          `INSERT INTO fixed_asset_master (
            item_grn_id,
            center,
            location,
            department,
            employee,
            serial_no,
            book_no_local_id,
            barcode_no,
            item_code,
            status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            itemGrnId,
            item.center,
            item.location,
            item.department,
            item.employee,
            item.serial_no,
            item.book_no_local_id,
            item.barcode_no,
            itemCode,
            item.status ?? 1
          ]
        );
      }

      await connection.commit();

      res.status(200).json({
        message: "Items approved and assets created successfully"
      });

    } catch (error) {
      await connection.rollback();
      console.error("Error inserting master records:", error);

      res.status(500).json({
        message: "Failed to approve items",
        error: error.message
      });

    } finally {
      connection.release();
    }
  },



  async handleApproveItemsFinal(req, res) {
  const connection = await pool.getConnection();

  try {
    const { itemGrn } = req.body;
    console.log("Form Data:", itemGrn);

    if (!itemGrn) {
      return res.status(400).json({ message: "No GRN data provided" });
    }

    const data = itemGrn;

    await connection.beginTransaction();

    // 🔹 Get current year
    const year = new Date().getFullYear();

    // 🔹 Get last item_code for the year
    const [lastRow] = await connection.execute(
      `SELECT item_code 
       FROM item_grn_master 
       WHERE item_code LIKE ? 
       ORDER BY item_code DESC 
       LIMIT 1`,
      [`${year}%`]
    );

    let serial = 0;
    if (lastRow.length > 0) {
      serial = parseInt(lastRow[0].item_code.slice(-6), 10); // last 6 digits
    }
    serial += 1;

    // 🔹 Generate item_code: YYYY + 6-digit serial
    const itemCode = `${year}${String(serial).padStart(6, "0")}`;

    console.log("Generated item_code:", itemCode);

    // 🔹 Insert into item_grn_master
    const sql = `
      INSERT INTO item_grn_master (
        middle_category,
        sub_category,
        item_name,
        po_no,
        brand,
        model,
        supplier,
        qty,
        date,
        invoice_no,
        unit_price,
        inv_total,
        manufacturer,
        type,
        source,
        receive_type,
        remarks,
        grn_date,
        grn_no,
        warranty_expiry,
        service_start,
        service_end,
        salvage_value,
        replicate,
        created_at,
        updated_at,
        approved_at,
        item_code
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `;

    //const approvedAt = new Date();

    const values = [
      data.middleCategory,
      data.subCategory,
      data.itemName,
      data.p0No,
      data.brand || null,
      data.model || null,
      data.supplier,
      data.qty || 1,
      data.date,
      data.invoiceNo,
      data.unitPrice || null,
      data.invTotal || null,
      data.manufacturer || null,
      data.type || null,
      data.source || null,
      data.receiveType || null,
      data.remarks || null,
      data.grnDate,
      data.grnNo,
      data.warrantyExp || null,
      data.serviceStart || null,
      data.serviceEnd || null,
      data.salvageValue || null,
      data.replicate ? 1 : 0,
      data.createdAt ? new Date(data.createdAt) : null,  
      data.updatedAt ? new Date(data.updatedAt) : null,
      itemCode
    ];

    await connection.execute(sql, values);

    const sql2 = ``

    await connection.commit();

    res.status(200).json({
      message: "GRN inserted successfully",
      item_code: itemCode
    });

  } catch (error) {
    await connection.rollback();
    console.error("Error inserting GRN:", error);

    res.status(500).json({
      message: "Failed to insert GRN",
      error: error.message
    });

  } finally {
    connection.release();
  }
},

async handleApproveItems(req, res) {
  const connection = await pool.getConnection();

  try {
    const { itemGrn, itemGrnDetails } = req.body;
    console.log("Form Data:", itemGrn);
    console.log("Items Data:", itemGrnDetails);

    if (!itemGrn) {
      return res.status(400).json({ message: "No GRN data provided" });
    }

    const data = itemGrn;

    await connection.beginTransaction();

    // 🔹 Get current year
    const year = new Date().getFullYear();

    // 🔹 Get last item_code for the year
    const [lastRow] = await connection.execute(
      `SELECT item_code 
       FROM item_grn_master 
       WHERE item_code LIKE ? 
       ORDER BY item_code DESC 
       LIMIT 1`,
      [`${year}%`]
    );

    let serial = 0;
    if (lastRow.length > 0) {
      serial = parseInt(lastRow[0].item_code.slice(-6), 10);
    }
    serial += 1;

    // 🔹 Generate item_code: YYYY + 6-digit serial
    const itemCode = `${year}${String(serial).padStart(6, "0")}`;
    console.log("Generated item_code:", itemCode);

    // 🔹 Insert into item_grn_master
    const sqlMaster = `
      INSERT INTO item_grn_master (
        middle_category, sub_category, item_name, po_no,
        brand, model, supplier, qty, date, invoice_no,
        unit_price, inv_total, manufacturer, type, source,
        receive_type, remarks, grn_date, grn_no,
        warranty_expiry, service_start, service_end,
        salvage_value, replicate, created_at, updated_at,
        approved_at, item_code
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `;

    const now = new Date();
    const valuesMaster = [
      data.middleCategory,
      data.subCategory,
      data.itemName,
      data.p0No,
      data.brand || null,
      data.model || null,
      data.supplier,
      data.qty || 1,
      data.date,
      data.invoiceNo,
      data.unitPrice || null,
      data.invTotal || null,
      data.manufacturer || null,
      data.type || null,
      data.source || null,
      data.receiveType || null,
      data.remarks || null,
      data.grnDate,
      data.grnNo,
      data.warrantyExp || null,
      data.serviceStart || null,
      data.serviceEnd || null,
      data.salvageValue || null,
      data.replicate ? 1 : 0,
      data.createdAt ? new Date(data.createdAt) : now,
      data.updatedAt ? new Date(data.updatedAt) : now,
      now, // approved_at
      itemCode
    ];

    await connection.execute(sqlMaster, valuesMaster);

    const [itemGrnId] = await connection.execute(
      `SELECT id FROM item_grn WHERE grn_no = ?`,
      [data.grnNo]
    );
    const id = itemGrnId[0].id;
    console.log("Inserted item_grn_master ID:", id);

    // 🔹 Update related item_grn_details to status = 1
    for (const item of itemGrnDetails) {
      await connection.execute(
        `UPDATE item_grn_details
        SET status = ?
        WHERE id = ? AND item_grn_id = ?`,
        [item.status, item.id, id]
      );
    }
    // 🔹 Update related item_grn_files to status = 1
    await connection.execute(
      `UPDATE item_grn_files
       SET status = 1
       WHERE item_grn_id = ?`,
      [id]
    );

    // 🔹 Delate the item record in item grn table(tempory)
    await connection.execute(
      `DELETE FROM item_grn WHERE id = ?`,
      [id]
    );


    await connection.commit();

    res.status(200).json({
      message: "GRN inserted and related details/files updated successfully",
      item_code: itemCode
    });

  } catch (error) {
    await connection.rollback();
    console.error("Error handling GRN:", error);

    res.status(500).json({
      message: "Failed to approve GRN",
      error: error.message
    });

  } finally {
    connection.release();
  }
}


}
module.exports = ItemGrnApproveController;
