const pool = require("../config/database");

const landRepository = {
  async registerBuildingData(data, files) {
    try {
      const sql = `
            INSERT INTO lands (
            station,
            main_category_id,
            middle_category_id,
            sub_category_id,
            land_id,
            land_name,
            land_description,
            surveyor_id,
            surveyor_name,
            purchased_date,
            price,
            method,
            vote_no,
            land_image,
            deed_no,
            lawyer_name,
            registered_date,
            status,
            boundary_details,
            area_hectare,
            area_acre,
            area_perch,
            district,
            divisional_sec,
            gn_division,
            not_use_area,
            deed_copy
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
      const values = [
        data.station || null,
        data.mainCategoryId || null,
        data.middleCategoryId || null,
        data.subCategoryId || null,
        data.landId || null,
        data.landName || null,
        data.landDescription || null,
        data.surveyorId || null,
        data.surveyorName || null,
        data.purchasedDate || null,
        data.price || null,
        data.method || null,
        data.voteNo || null,
        data.buildingImages || null,
        data.deedNo || null,
        data.lawyerName || null,
        data.registeredDate || null,
        data.status || null,
        data.boundryDetails || null,
        data.areaHectare || null,
        data.areaAcre || null,
        data.areaPerch || null,
        data.destrict || null,
        data.divisionalSec || null,
        data.gnDivision || null,
        data.notUseArea || null,
        data.deedCopyPath || null,
      ];
      return pool.execute(sql, values);
    } catch (error) {
      console.error("Error in building repository:", error);
      throw error;
    }
  },

  async getAllLandIds(data, files) {
    try {
      const sql = `
          SELECT land_id from lands
          `;

      return pool.execute(sql);
    } catch (error) {
      console.error("Error in building repository:", error);
      throw error;
    }
  },

  async fetchDataBylandId(landId) {
    try {
      const sql = `
            SELECT *  from lands WHERE land_id = ?
            `;
      const value = [landId];

      return pool.execute(sql, value);
    } catch (error) {
      console.error("Error in building repository:", error);
      throw error;
    }
  },

  async updateLandData(landId, data) {
    console.log("comming in updating", data);
    try {
      const sql = `
        UPDATE lands SET
          station = ?,
          main_category_id = ?,
          middle_category_id = ?,
          sub_category_id = ?,
          land_name = ?,
          land_description = ?,
          surveyor_id = ?,
          surveyor_name = ?,
          purchased_date = ?,
          price = ?,
          method = ?,
          vote_no = ?,
          land_image = ?,
          deed_no = ?,
          lawyer_name = ?,
          registered_date = ?,
          status = ?,
          boundary_details = ?,
          area_hectare = ?,
          area_acre = ?,
          area_perch = ?,
          district = ?,
          divisional_sec = ?,
          gn_division = ?,
          not_use_area = ?,
          deed_copy = ?
        WHERE land_id = ?
      `;

      const values = [
        data.station || null,
        data.mainCategoryId || null,
        data.middleCategoryId || null,
        data.subCategoryId || null,
        data.landName || null,
        data.landDescription || null,
        data.surveyorId || null,
        data.surveyorName || null,
        data.purchasedDate || null,
        data.price || null,
        data.method || null,
        data.voteNo || null,
        data.buildingImages || null,
        data.deedNo || null,
        data.lawyerName || null,
        data.registeredDate || null,
        data.status || null,
        data.boundryDetails || null,
        data.areaHectare || null,
        data.areaAcre || null,
        data.areaPerch || null,
        data.destrict || null,
        data.divisionalSec || null,
        data.gnDivision || null,
        data.notUseArea || null,
        data.deedCopyPath || null,
        landId,
      ];

      return pool.execute(sql, values);
    } catch (error) {
      console.error("Repository update error:", error);
      throw error;
    }
  },

  async landIdExists(landId) {
    try {
      const sql = `
      SELECT 1
      FROM lands
      WHERE land_id = ?
      LIMIT 1
    `;

      const [rows] = await pool.execute(sql, [landId]);
      return rows.length > 0;
    } catch (error) {
      console.error("Error checking landId existence:", error);
      throw error;
    }
  },

  async getAllLands() {
    try {
      const sql = `
        SELECT * FROM lands
      `;
      return pool.execute(sql);
    } catch (error) {
      console.error("Error fetching all lands:", error);
      throw error;
    }
  },
};

module.exports = landRepository;
