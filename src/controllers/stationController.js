const pool = require("../config/database");

const StationController = {

  async getAllStation(req, res) {
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM stations"
      );
      return res.status(200).json({ message: "Station data fetched successfully", data: rows || [] });
    } catch (error) {
      console.error("Error fetching in stations:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

};

module.exports = StationController;
