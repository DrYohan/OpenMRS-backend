const pool = require("../config/database");
const path = require("path");
const fs = require("fs");



const BuildingController = {
    async createBuildingRecord(req, res) {
    try {
        const data = req.body;
        const files = req.files;

        const [existing] = await pool.execute(
            "SELECT building_id FROM buildings WHERE building_id = ?",
            [data.buildingId]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Building ID already exists"
            });
        }

        // Only handle building images
        let buildingImages = "";
        if (files?.buildingFiles) { // <-- match the multer field name
        buildingImages = files.buildingFiles
            .map(f => path.join("building_uploads", f.filename)) // store relative path
            .join("@@@"); // join multiple images
        }

        // Prepare SQL INSERT for buildings table
        const sql = `
        INSERT INTO buildings (
            main_category_id,
            middle_category_id,
            sub_category_id,
            land_id,
            building_id,
            building_name,
            address,
            rates_no,
            Area,
            no_of_floors,
            value,
            bench_marks,
            comment,
            building_images,
            station,
            status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
        data.mainCategoryId || null,
        data.middleCategoryId || null,
        data.subCategoryId || null,
        data.landId || null,
        data.buildingId || null,
        data.buildingName || null,
        data.address || null,
        data.ratesNo || null,
        data.area || null,
        data.noOfFloors || null,
        data.value || null,
        data.benchMarks || null,
        data.comment || null,
        buildingImages || null,
        data.station || null,
        data.status || null,
        ];

        await pool.execute(sql, values);

        return res
        .status(201)
        .json({ message: "Building record created successfully!" });

    } catch (error) {
        console.error("Error creating building record:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
    },

    async getAllBuildingId(req, res) {
    try {
        const sql = `SELECT building_id FROM buildings`;
        const [rows] = await pool.execute(sql); // Execute the query and get results
        return res.status(200).json({ data: rows }); // Send the rows back as JSON
    } catch (error) {
        console.error("Error fetching building IDs:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
    },

    async getDataByBuildingId(req, res) {
        try {
            const { buildingId } = req.params; // destructure buildingId from params
            const sql = `SELECT * FROM buildings WHERE building_id = ?`;
            const [rows] = await pool.execute(sql, [buildingId]);

            if (rows.length === 0) {
                return res.status(404).json({ message: "Building not found" });
            }

            return res.status(200).json({ data: rows });
        } catch (error) {
            console.error("Error fetching building data:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    },

    async updateBuilding(req, res) {
        try {
            const buildingId = req.params.buildingId;
            const data = req.body;
            const files = req.files; // multer files
            console.log("data", data)
            console.log("idd", buildingId)

            // ---------------- GET CURRENT BUILDING ----------------
            const [rows] = await pool.execute(
                "SELECT * FROM buildings WHERE building_id = ?",
                [buildingId]
            );

            if (rows.length === 0) {
                return res.status(404).json({ message: "Building not found" });
            }

            const current = rows[0];

            // ---------------- HANDLE EXISTING FILES ----------------
            let currentImages = current.building_images
                ? current.building_images.split("@@@")
                : [];

            let existingFiles = req.body.existingFiles || [];
            if (!Array.isArray(existingFiles)) existingFiles = [existingFiles];

            // Delete files that are removed
            const filesToDelete = currentImages.filter(f => !existingFiles.includes(f));
            filesToDelete.forEach(filePath => {
                const fullPath = path.join(__dirname, "../uploads/building_uploads", path.basename(filePath));
                if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
            });

            // ---------------- HANDLE NEW FILES ----------------
            let newFiles = [];
            if (files?.buildingFiles) {
                newFiles = files.buildingFiles.map(f =>
                    path.join("building_uploads", f.filename)
                );
            }

            const allFiles = [...existingFiles, ...newFiles];
            const buildingImagesString = allFiles.join("@@@");

            // ---------------- UPDATE DATABASE ----------------
            const sql = `
                UPDATE buildings SET
                    main_category_id = ?,
                    middle_category_id = ?,
                    sub_category_id = ?,
                    land_id = ?,
                    building_name = ?,
                    address = ?,
                    rates_no = ?,
                    Area = ?,
                    no_of_floors = ?,
                    value = ?,
                    bench_marks = ?,
                    comment = ?,
                    building_images = ?,
                    station = ?,
                    status = ?
                WHERE building_id = ?
            `;

            // Use current values if not provided in request
            const values = [
                data.mainCategoryId ?? current.main_category_id,
                data.middleCategoryId ?? current.middle_category_id,
                data.subCategoryId ?? current.sub_category_id,
                data.landId ?? current.land_id,
                data.buildingName ?? current.building_name,
                data.address ?? current.address,
                data.ratesNo ?? current.rates_no,
                data.area ?? current.Area,
                data.noOfFloors ?? current.no_of_floors,
                data.value ?? current.value,
                data.benchMarks ?? current.bench_marks,
                data.comment ?? current.comment,
                buildingImagesString ?? current.building_images,
                data.station ?? current.station,
                data.status ?? current.status,
                buildingId
            ];

            await pool.execute(sql, values);

            res.status(200).json({ message: "Building record updated successfully!" });
        } catch (error) {
            console.error("Error updating building record:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    async getBuildingIdByLandId(req, res) {
        try {
            const { landId } = req.params;

            if (!landId) {
                return res.status(400).json({ success: false, message: "landId is required" });
            }

            const sql = `SELECT building_id FROM buildings WHERE land_id = ?`;
            const [rows] = await pool.execute(sql, [landId]);

            // Return an empty array if no buildings exist
            const buildingIds = rows.map(r => r.building_id);

            return res.status(200).json({
                success: true,
                data: buildingIds, // [] if none
            });

        } catch (error) {
            console.error("Error fetching building by landId:", error);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    }




};

module.exports = BuildingController;
