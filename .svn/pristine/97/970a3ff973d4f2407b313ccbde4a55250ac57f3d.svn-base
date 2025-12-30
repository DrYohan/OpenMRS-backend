const pool = require("../config/database");

const centerController = {
  // Create a new center
  async createCenter(req, res) {
    try {
      const { center_id, center_name, status = "Active" } = req.body;

      if (!center_id || !center_name) {
        return res
          .status(400)
          .json({ error: "center_id and center_name are required" });
      }

      const [existing] = await pool.execute(
        "SELECT * FROM centers WHERE center_id = ?",
        [center_id]
      );

      if (existing.length > 0) {
        return res.status(400).json({ error: "Center ID already exists" });
      }

      const [result] = await pool.execute(
        "INSERT INTO centers (center_id, center_name, status) VALUES (?, ?, ?)",
        [center_id, center_name, status]
      );

      res.status(201).json({
        success: true,
        message: "Center created successfully",
        data: { id: result.insertId, center_id, center_name, status },
      });
    } catch (error) {
      console.error("Error creating center:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // Get all centers
  async getAllCenters(req, res) {
    try {
      const { status } = req.query;
      let query = "SELECT * FROM centers";
      const params = [];

      if (status) {
        query += " WHERE status = ?";
        params.push(status);
      }

      query += " ORDER BY created_at DESC";

      const [centers] = await pool.execute(query, params);
      res.json({
        success: true,
        count: centers.length,
        data: centers,
      });
    } catch (error) {
      console.error("Error fetching centers:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // Get center by ID
  async getCenterById(req, res) {
    try {
      const { id } = req.params;
      const [centers] = await pool.execute(
        "SELECT * FROM centers WHERE id = ?",
        [id]
      );

      if (centers.length === 0) {
        return res.status(404).json({ error: "Center not found" });
      }

      res.json({
        success: true,
        data: centers[0],
      });
    } catch (error) {
      console.error("Error fetching center:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // Update center
  async updateCenter(req, res) {
    try {
      const { id } = req.params;
      const { center_name, status } = req.body;

      if (!center_name && !status) {
        return res.status(400).json({ error: "No fields to update" });
      }

      const [centers] = await pool.execute(
        "SELECT * FROM centers WHERE id = ?",
        [id]
      );

      if (centers.length === 0) {
        return res.status(404).json({ error: "Center not found" });
      }

      const updateFields = [];
      const params = [];

      if (center_name) {
        updateFields.push("center_name = ?");
        params.push(center_name);
      }

      if (status) {
        updateFields.push("status = ?");
        params.push(status);
      }

      params.push(id);

      await pool.execute(
        `UPDATE centers SET ${updateFields.join(", ")} WHERE id = ?`,
        params
      );

      res.json({
        success: true,
        message: "Center updated successfully",
      });
    } catch (error) {
      console.error("Error updating center:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // Delete center
  async deleteCenter(req, res) {
    try {
      const { id } = req.params;

      const [result] = await pool.execute("DELETE FROM centers WHERE id = ?", [
        id,
      ]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Center not found" });
      }

      res.json({
        success: true,
        message: "Center deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting center:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // Get centers with location count
  async getCentersWithLocationCount(req, res) {
    try {
      const [centers] = await pool.execute(`
        SELECT 
          c.*,
          COUNT(l.id) AS location_count
        FROM centers c
        LEFT JOIN locations l ON c.center_id = l.center_id
        GROUP BY c.id
        ORDER BY c.center_name
      `);

      res.json({
        success: true,
        count: centers.length,
        data: centers,
      });
    } catch (error) {
      console.error("Error fetching centers with location count:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = centerController;
