const pool = require("../config/database");

const locationController = {
  // Create a new location
  async createLocation(req, res) {
    try {
      const {
        center_id,
        location_id,
        location_name,
        status = "Active",
      } = req.body;

      if (!center_id || !location_id || !location_name) {
        return res.status(400).json({
          error: "center_id, location_id, and location_name are required",
        });
      }

      // Check if center exists
      const [centers] = await pool.execute(
        "SELECT * FROM centers WHERE center_id = ?",
        [center_id]
      );

      if (centers.length === 0) {
        return res.status(404).json({ error: "Center not found" });
      }

      // Check if location_id exists
      const [existing] = await pool.execute(
        "SELECT * FROM locations WHERE location_id = ?",
        [location_id]
      );

      if (existing.length > 0) {
        return res.status(400).json({ error: "Location ID already exists" });
      }

      const [result] = await pool.execute(
        "INSERT INTO locations (center_id, location_id, location_name, status) VALUES (?, ?, ?, ?)",
        [center_id, location_id, location_name, status]
      );

      res.status(201).json({
        success: true,
        message: "Location created successfully",
        data: {
          id: result.insertId,
          center_id,
          location_id,
          location_name,
          status,
        },
      });
    } catch (error) {
      console.error("Error creating location:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // Get all locations
  async getAllLocations(req, res) {
    try {
      const { center_id, status } = req.query;
      let query = `
        SELECT l.*, c.center_name 
        FROM locations l
        LEFT JOIN centers c ON l.center_id = c.center_id
        WHERE 1=1
      `;
      const params = [];

      if (center_id) {
        query += " AND l.center_id = ?";
        params.push(center_id);
      }

      if (status) {
        query += " AND l.status = ?";
        params.push(status);
      }

      query += " ORDER BY l.created_at DESC";

      const [locations] = await pool.execute(query, params);
      res.json({
        success: true,
        count: locations.length,
        data: locations,
      });
    } catch (error) {
      console.error("Error fetching locations:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // Get location by ID
  async getLocationById(req, res) {
    try {
      const { id } = req.params;
      const [locations] = await pool.execute(
        `SELECT l.*, c.center_name 
         FROM locations l
         LEFT JOIN centers c ON l.center_id = c.center_id
         WHERE l.id = ?`,
        [id]
      );

      if (locations.length === 0) {
        return res.status(404).json({ error: "Location not found" });
      }

      res.json({
        success: true,
        data: locations[0],
      });
    } catch (error) {
      console.error("Error fetching location:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // Update location
  async updateLocation(req, res) {
    try {
      const { id } = req.params;
      const { location_name, status, center_id } = req.body;

      if (!location_name && !status && !center_id) {
        return res.status(400).json({ error: "No fields to update" });
      }

      const [locations] = await pool.execute(
        "SELECT * FROM locations WHERE id = ?",
        [id]
      );

      if (locations.length === 0) {
        return res.status(404).json({ error: "Location not found" });
      }

      // If updating center_id, verify the new center exists
      if (center_id) {
        const [centers] = await pool.execute(
          "SELECT * FROM centers WHERE center_id = ?",
          [center_id]
        );

        if (centers.length === 0) {
          return res.status(404).json({ error: "Center not found" });
        }
      }

      const updateFields = [];
      const params = [];

      if (location_name) {
        updateFields.push("location_name = ?");
        params.push(location_name);
      }

      if (status) {
        updateFields.push("status = ?");
        params.push(status);
      }

      if (center_id) {
        updateFields.push("center_id = ?");
        params.push(center_id);
      }

      params.push(id);

      await pool.execute(
        `UPDATE locations SET ${updateFields.join(", ")} WHERE id = ?`,
        params
      );

      res.json({
        success: true,
        message: "Location updated successfully",
      });
    } catch (error) {
      console.error("Error updating location:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // Delete location
  async deleteLocation(req, res) {
    try {
      const { id } = req.params;

      const [result] = await pool.execute(
        "DELETE FROM locations WHERE id = ?",
        [id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Location not found" });
      }

      res.json({
        success: true,
        message: "Location deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting location:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // Get locations by center
  async getLocationsByCenter(req, res) {
    try {
      const { center_id } = req.params;

      const [locations] = await pool.execute(
        `SELECT l.*, c.center_name 
         FROM locations l
         LEFT JOIN centers c ON l.center_id = c.center_id
         WHERE l.center_id = ? 
         ORDER BY l.location_name`,
        [center_id]
      );

      res.json({
        success: true,
        count: locations.length,
        data: locations,
      });
    } catch (error) {
      console.error("Error fetching locations by center:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = locationController;
