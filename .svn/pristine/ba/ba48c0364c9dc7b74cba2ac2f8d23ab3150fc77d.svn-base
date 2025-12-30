const pool = require("../config/database");

const departmentController = {
  // Create a new department
  async createDepartment(req, res) {
    try {
      const {
        center_id,
        location_id,
        department_id,
        department_name,
        status = "Active",
      } = req.body;

      if (!center_id || !location_id || !department_id || !department_name) {
        return res.status(400).json({
          error:
            "center_id, location_id, department_id, and department_name are required",
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

      // Check if location exists
      const [locations] = await pool.execute(
        "SELECT * FROM locations WHERE location_id = ?",
        [location_id]
      );

      if (locations.length === 0) {
        return res.status(404).json({ error: "Location not found" });
      }

      // Check if department_id exists
      const [existing] = await pool.execute(
        "SELECT * FROM departments WHERE department_id = ?",
        [department_id]
      );

      if (existing.length > 0) {
        return res.status(400).json({ error: "Department ID already exists" });
      }

      const [result] = await pool.execute(
        "INSERT INTO departments (center_id, location_id, department_id, department_name, status) VALUES (?, ?, ?, ?, ?)",
        [center_id, location_id, department_id, department_name, status]
      );

      res.status(201).json({
        success: true,
        message: "Department created successfully",
        data: {
          id: result.insertId,
          center_id,
          location_id,
          department_id,
          department_name,
          status,
        },
      });
    } catch (error) {
      console.error("Error creating department:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // Get all departments
  async getAllDepartments(req, res) {
    try {
      const { center_id, location_id, status } = req.query;
      let query = `
        SELECT d.*, c.center_name, l.location_name 
        FROM departments d
        LEFT JOIN centers c ON d.center_id = c.center_id
        LEFT JOIN locations l ON d.location_id = l.location_id
        WHERE 1=1
      `;
      const params = [];

      if (center_id) {
        query += " AND d.center_id = ?";
        params.push(center_id);
      }

      if (location_id) {
        query += " AND d.location_id = ?";
        params.push(location_id);
      }

      if (status) {
        query += " AND d.status = ?";
        params.push(status);
      }

      query += " ORDER BY d.created_at DESC";

      const [departments] = await pool.execute(query, params);
      res.json({
        success: true,
        count: departments.length,
        data: departments,
      });
    } catch (error) {
      console.error("Error fetching departments:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // Get department by ID
  async getDepartmentById(req, res) {
    try {
      const { id } = req.params;
      const [departments] = await pool.execute(
        `SELECT d.*, c.center_name, l.location_name 
         FROM departments d
         LEFT JOIN centers c ON d.center_id = c.center_id
         LEFT JOIN locations l ON d.location_id = l.location_id
         WHERE d.id = ?`,
        [id]
      );

      if (departments.length === 0) {
        return res.status(404).json({ error: "Department not found" });
      }

      res.json({
        success: true,
        data: departments[0],
      });
    } catch (error) {
      console.error("Error fetching department:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // Update department
  async updateDepartment(req, res) {
    try {
      const { id } = req.params;
      const { department_name, status, center_id, location_id } = req.body;

      if (!department_name && !status && !center_id && !location_id) {
        return res.status(400).json({ error: "No fields to update" });
      }

      const [departments] = await pool.execute(
        "SELECT * FROM departments WHERE id = ?",
        [id]
      );

      if (departments.length === 0) {
        return res.status(404).json({ error: "Department not found" });
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

      // If updating location_id, verify the new location exists
      if (location_id) {
        const [locations] = await pool.execute(
          "SELECT * FROM locations WHERE location_id = ?",
          [location_id]
        );

        if (locations.length === 0) {
          return res.status(404).json({ error: "Location not found" });
        }
      }

      const updateFields = [];
      const params = [];

      if (department_name) {
        updateFields.push("department_name = ?");
        params.push(department_name);
      }

      if (status) {
        updateFields.push("status = ?");
        params.push(status);
      }

      if (center_id) {
        updateFields.push("center_id = ?");
        params.push(center_id);
      }

      if (location_id) {
        updateFields.push("location_id = ?");
        params.push(location_id);
      }

      params.push(id);

      await pool.execute(
        `UPDATE departments SET ${updateFields.join(", ")} WHERE id = ?`,
        params
      );

      res.json({
        success: true,
        message: "Department updated successfully",
      });
    } catch (error) {
      console.error("Error updating department:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // Delete department
  async deleteDepartment(req, res) {
    try {
      const { id } = req.params;

      const [result] = await pool.execute(
        "DELETE FROM departments WHERE id = ?",
        [id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Department not found" });
      }

      res.json({
        success: true,
        message: "Department deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting department:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // Get departments by center and location
  async getDepartmentsByCenterAndLocation(req, res) {
    try {
      const { center_id, location_id } = req.params;

      const [departments] = await pool.execute(
        `SELECT d.*, c.center_name, l.location_name 
         FROM departments d
         LEFT JOIN centers c ON d.center_id = c.center_id
         LEFT JOIN locations l ON d.location_id = l.location_id
         WHERE d.center_id = ? AND d.location_id = ? 
         ORDER BY d.department_name`,
        [center_id, location_id]
      );

      res.json({
        success: true,
        count: departments.length,
        data: departments,
      });
    } catch (error) {
      console.error(
        "Error fetching departments by center and location:",
        error
      );
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = departmentController;
