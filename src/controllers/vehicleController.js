const pool = require("../config/database");
const VehicleService = require("../services/vehicleService")
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const VehicleController = {
    async createVehicle(req, res) {
    try {
        const data = req.body;
        const files = req.files;

        console.log("data", req.body)
        console.log("files", files)

        if (!data.registrationId || !data.chasisNo || !data.engineNo) {
            return res.status(400).json({ error: "registrationId, chasisNo, and engineNo are required" });
        }

        const regExists  = await VehicleService.checkRegistrationIdExist(data.registrationId);
        if (regExists ) {
            return res.status(400).json({ error: `Registration ID '${data.registrationId}' already exists` });
        }


        const chasisExists = await VehicleService.checkChasisNoExist(data.chasisNo);
        if (chasisExists) {
            return res.status(400).json({ error: `Chasis No '${data.chasisNo}' already exists` });
        }

        const engineExists = await VehicleService.checkEngineNoExist(data.engineNo);
        if (engineExists) {
            return res.status(400).json({ error: `Engine No '${data.engineNo}' already exists` });
        }


        // Prepare file paths joined by "@@@"
        let filePaths = null;
        if (files && files.length > 0) {
        const paths = files.map(file => file.path.replace(/\\/g, "/"));
        filePaths = paths.join("@@@"); // join all paths by "@@@"
        }


        const sql = `
        INSERT INTO vehicles (
            station, middle_category, sub_category, registration_id, taxation_class,
            year, chasis_no, engine_no, color, seating_capacity, cylinder_capacity,
            make, model, body_type, weight_unlader, weight_gross, height, length,
            horse_power, fuel_type, licence_renewal, insurance_renewal, purchase_type,
            lease_period_start_date, lease_period_end_date, supplier, invoice_no,
            purchased_date, receive_type, vote_no, remarks, total_amount, purchased_price, file
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
        data.station || null,
        data.middleCategory || null,
        data.subCategory || null,
        data.registrationId,
        data.taxationClass || null,
        data.year || null,
        data.chasisNo,
        data.engineNo,
        data.color || null,
        data.seatingCapacity || null,
        data.cylinderCapacity || null,
        data.make || null,
        data.model || null,
        data.bodyType || null,
        data.weightUnlader || null,
        data.weightGross || null,
        data.height || null,
        data.length || null,
        data.horsePower || null,
        data.fuelType || null,
        data.licenceRenewal || null,
        data.insuranceRenewal || null,
        data.purchaseType || null,
        data.leasePeriodStartDate || null,
        data.leasePeriodEndDate || null,
        data.supplier || null,
        data.invoiceNo || null,
        data.purchasedDate || null,
        data.receiveType || null,
        data.voteNo || null,
        data.remarks || null,
        data.totalAmount || null,
        data.purchasedPrice || null,
        filePaths

        ];

        const [result] = await pool.execute(sql, values);

        return res.status(201).json({
        message: "Vehicle created successfully",
        vehicleId: result.insertId
        });

    } catch (error) {
        console.error("Error creating vehicle:", error);

        if (error.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ error: "Duplicate registration, chasis, or engine number" });
        }

        return res.status(500).json({ error: "Internal server error" });
    }
    },

    async getAllRegistrationId(req, res) {
        try {
        const [rows] = await pool.execute(
        "SELECT registration_id FROM vehicles WHERE status IS NULL"
      );
      //const data = rows.map(r => r.registration_id)
      return res.status(200).json({ message: "Registration ids fetched successfully", data: rows || [] });
            
        } catch (error) {
            return res.status(500).json({ error: "Internal server error" });
        }
    },

    async getVehicleByRegistrationId(req, res) {
    try {
        const { registrationId } = req.params;

        const sql = `
        SELECT *
        FROM vehicles
        WHERE registration_id = ?
        LIMIT 1
        `;

        const [rows] = await pool.execute(sql, [registrationId]);

        console.log("rows", rows)

        if (rows.length === 0) {
        return res.status(404).json({ error: "Vehicle not found" });
        }

        return res.status(200).json({
            data: rows[0]
        });
    } catch (error) {
        console.error("Error fetching vehicle:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
    },

    async fetchPendingApprovalVehicles(req, res) {
        try {

            const [rows] = await pool.execute(
                `SELECT sub_category, registration_id, model, make, purchased_price, purchased_date, status
                 FROM vehicles WHERE status IS NULL`
            );
            return res.status(200).json({ message: "Data fetched successfully", data: rows || [] });
            
        } catch (error) {
            console.error("Error fetching vehile records:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    },

    async approveVehicle(req, res) {
      const connection = await pool.getConnection();

      try {
        const { vehicles } = req.body;

        if (!Array.isArray(vehicles) || vehicles.length === 0) {
          return res.status(400).json({ message: "Invalid request body" });
        }

        await connection.beginTransaction();

        for (const vehicle of vehicles) {
          const { registration_id, status } = vehicle;

          // 1️⃣ Update status in vehicles table
          await connection.execute(
            `
            UPDATE vehicles
            SET status = ?
            WHERE registration_id = ?
            `,
            [status, registration_id]
          );

          // 2️⃣ ONLY if approved → insert into master
          if (status === 1) {
            await connection.execute(
              `
              INSERT INTO vehicles_master (
                station, sub_category, registration_id, taxation_class, year,
                chasis_no, engine_no, color, seating_capacity, cylinder_capacity,
                make, model, body_type, weight_unlader, weight_gross,
                height, length, horse_power, fuel_type,
                licence_renewal, insurance_renewal, purchase_type,
                lease_period_start_date, lease_period_end_date,
                file,
                supplier, invoice_no, purchased_date,
                receive_type, vote_no, remarks,
                total_amount, purchased_price,
                middle_category, status
              )
              SELECT
                station, sub_category, registration_id, taxation_class, year,
                chasis_no, engine_no, color, seating_capacity, cylinder_capacity,
                make, model, body_type, weight_unlader, weight_gross,
                height, length, horse_power, fuel_type,
                licence_renewal, insurance_renewal, purchase_type,
                lease_period_start_date, lease_period_end_date,
                file,
                supplier, invoice_no, purchased_date,
                receive_type, vote_no, remarks,
                total_amount, purchased_price,
                middle_category, 1
              FROM vehicles v
              WHERE v.registration_id = ?
              AND NOT EXISTS (
                SELECT 1 FROM vehicles_master vm
                WHERE vm.registration_id = v.registration_id
              )
              `,
              [registration_id]
            );
          }
        }

        await connection.commit();

        return res.status(200).json({
          message: "Vehicle approval process completed successfully"
        });

      } catch (error) {
        await connection.rollback();
        console.error("Error approving vehicle records:", error);
        return res.status(500).json({ error: "Internal server error" });
      } finally {
        connection.release();
      }
    },

    // fetch all suppliers
    async getAllSuppliers(req, res) {
        try {
            const [rows] = await pool.execute(
            "SELECT supplier_code, supplier_name FROM suppliers"
            );
            return res.status(200).json({ message: "Suppliers fetched successfully", data: rows || [] });
        } catch (error) {
            console.error("Error fetching supplier codes:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    },

    async updateVehicle(req, res) {
      try {
        const vehicleId = req.params.id;
        const data = req.body;
        const files = req.files || []; 

        if (!data.registrationId || !data.chasisNo || !data.engineNo) {
          return res.status(400).json({
            error: "registrationId, chasisNo, and engineNo are required",
          });
        }

        if (await VehicleService.checkRegistrationIdExistForUpdate(data.registrationId, vehicleId)) {
          return res.status(400).json({ error: `Registration ID '${data.registrationId}' already exists` });
        }
        if (await VehicleService.checkChasisNoExistForUpdate(data.chasisNo, vehicleId)) {
          return res.status(400).json({ error: `Chasis No '${data.chasisNo}' already exists` });
        }
        if (await VehicleService.checkEngineNoExistForUpdate(data.engineNo, vehicleId)) {
          return res.status(400).json({ error: `Engine No '${data.engineNo}' already exists` });
        }

        const [rows] = await pool.execute("SELECT file FROM vehicles WHERE id = ?", [vehicleId]);
        if (!rows.length) return res.status(404).json({ error: "Vehicle not found" });

        const existingFilePaths = rows[0].file ? rows[0].file.split("@@@") : [];

        const frontendExistingFiles = data.existingFiles
          ? (Array.isArray(data.existingFiles) ? data.existingFiles : [data.existingFiles])
          : [];

        const filesToDelete = existingFilePaths.filter(f => !frontendExistingFiles.includes(f));
        filesToDelete.forEach(filePath => {
          const fileName = path.basename(filePath);
          const fullPath = path.resolve("base_uploads/vehicle", fileName); 
          if (fs.existsSync(fullPath)) {
            try {
              fs.unlinkSync(fullPath);
              console.log("Deleted old file:", fullPath);
            } catch (err) {
              console.error("Failed to delete file:", fullPath, err);
            }
          }
        });

        const newFiles = files.map(f => f.path.replace(/\\/g, "/"));
        const finalFilePaths = [...frontendExistingFiles, ...newFiles].join("@@@") || null;

        const sql = `
          UPDATE vehicles SET
            station = ?, middle_category = ?, sub_category = ?, registration_id = ?,
            taxation_class = ?, year = ?, chasis_no = ?, engine_no = ?, color = ?,
            seating_capacity = ?, cylinder_capacity = ?, make = ?, model = ?, body_type = ?,
            weight_unlader = ?, weight_gross = ?, height = ?, length = ?, horse_power = ?,
            fuel_type = ?, licence_renewal = ?, insurance_renewal = ?, purchase_type = ?,
            lease_period_start_date = ?, lease_period_end_date = ?, supplier = ?, invoice_no = ?,
            purchased_date = ?, receive_type = ?, vote_no = ?, remarks = ?, total_amount = ?,
            purchased_price = ?, file = ?
          WHERE id = ?
        `;

        const values = [
          data.station || null,
          data.middleCategory || null,
          data.subCategory || null,
          data.registrationId,
          data.taxationClass || null,
          data.year || null,
          data.chasisNo,
          data.engineNo,
          data.color || null,
          data.seatingCapacity || null,
          data.cylinderCapacity || null,
          data.make || null,
          data.model || null,
          data.bodyType || null,
          data.weightUnlader || null,
          data.weightGross || null,
          data.height || null,
          data.length || null,
          data.horsePower || null,
          data.fuelType || null,
          data.licenceRenewal || null,
          data.insuranceRenewal || null,
          data.purchaseType || null,
          data.leasePeriodStartDate || null,
          data.leasePeriodEndDate || null,
          data.supplier || null,
          data.invoiceNo || null,
          data.purchasedDate || null,
          data.receiveType || null,
          data.voteNo || null,
          data.remarks || null,
          data.totalAmount || null,
          data.purchasedPrice || null,
          finalFilePaths,
          vehicleId
        ];

        await pool.execute(sql, values);

        return res.status(200).json({ message: "Vehicle updated successfully" });
      } catch (error) {
        console.error("Error updating vehicle:", error);
        return res.status(500).json({ error: "Internal server error" });
      }
    },


    async getMiddleCategoriesByStation(req, res){
      const {stationId} = req.params;
      console.log("appi called station", stationId);
      try {
        const [row] = await pool.execute(
          `SELECT DISTINCT m.middle_category, f.middle_category_name
          FROM vehicles_master m
          JOIN fixed_asset_middle_categories f ON f.middle_category_id = m.middle_category
          WHERE m.status = 1 AND m.station = ?`,
          [stationId]
        );
        console.log("row", row)
        res.json({success: true, data: row,});
      } catch (error) {
        console.error("Error fetching middle categories by station:", error);
        return res.status(500).json({ error: "Internal server error" });
      }
     },

    async getSubCategoriesByMiddleCategory(req, res){
      const {middleCategory} = req.params;
      console.log("appi called middleCategory", middleCategory);
      try {
        const [row] = await pool.execute(
          `SELECT DISTINCT m.sub_category, s.sub_category_name
FROM vehicles_master m
JOIN fixed_asset_sub_categories s
  ON s.sub_category_id = m.sub_category COLLATE utf8mb4_unicode_ci
WHERE m.status = 1
  AND m.middle_category COLLATE utf8mb4_unicode_ci = ?;
`,
          [middleCategory]
        );
        console.log("row", row)
        res.json({success: true, data: row,});
      } catch (error) {
        console.error("Error fetching sub categories by middle categories:", error);
        return res.status(500).json({ error: "Internal server error" });
      }
     },
     
    async getRegistrationIdBySlectedValues(req, res){
      const {station, middleCategory, subCategory} = req.params;
      console.log("appi called station", station, middleCategory, subCategory);

      if(!station || !middleCategory || !subCategory) {
        return res.status(400).json({ error: "Missing feilds"});
      }
      try {
        const [rows] = await pool.execute(
          `
          SELECT registration_id
          FROM vehicles_master
          WHERE station = ?
            AND middle_category = ?
            AND sub_category = ?
          `,
          [station, middleCategory, subCategory]
        );

        console.log("row", rows)
        res.json({success: true, data: rows,}); 
      } catch (error) {
        console.error("Error fetching registration ids:", error);
        return res.status(500).json({ error: "Internal server error" });
      }
     }








};

module.exports = VehicleController;
