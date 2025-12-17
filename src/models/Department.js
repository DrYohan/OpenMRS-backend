const pool = require("../config/database");

class Department {
  // Create a new department
  static async create(departmentData) {
    const {
      center_id,
      location_id,
      department_id,
      department_name,
      status = "Active",
    } = departmentData;
    const query = `
      INSERT INTO departments (center_id, location_id, department_id, department_name, status) 
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await pool.execute(query, [
      center_id,
      location_id,
      department_id,
      department_name,
      status,
    ]);
    return { id: result.insertId, ...departmentData };
  }

  // Get all departments
  static async findAll(filters = {}) {
    let query = `
      SELECT d.*, c.center_name, l.location_name 
      FROM departments d
      LEFT JOIN centers c ON d.center_id = c.center_id
      LEFT JOIN locations l ON d.location_id = l.location_id
      WHERE 1=1
    `;
    const params = [];

    if (filters.center_id) {
      query += " AND d.center_id = ?";
      params.push(filters.center_id);
    }

    if (filters.location_id) {
      query += " AND d.location_id = ?";
      params.push(filters.location_id);
    }

    if (filters.status) {
      query += " AND d.status = ?";
      params.push(filters.status);
    }

    query += " ORDER BY d.created_at DESC";
    const [rows] = await pool.execute(query, params);
    return rows;
  }

  // Get department by ID
  static async findById(id) {
    const query = `
      SELECT d.*, c.center_name, l.location_name 
      FROM departments d
      LEFT JOIN centers c ON d.center_id = c.center_id
      LEFT JOIN locations l ON d.location_id = l.location_id
      WHERE d.id = ?
    `;
    const [rows] = await pool.execute(query, [id]);
    return rows[0];
  }

  // Get department by department_id
  static async findByDepartmentId(departmentId) {
    const query = "SELECT * FROM departments WHERE department_id = ?";
    const [rows] = await pool.execute(query, [departmentId]);
    return rows[0];
  }

  // Update department
  static async update(id, departmentData) {
    const { department_name, status, center_id, location_id } = departmentData;
    const query = `
      UPDATE departments 
      SET department_name = ?, status = ?, center_id = ?, location_id = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;
    const [result] = await pool.execute(query, [
      department_name,
      status,
      center_id,
      location_id,
      id,
    ]);
    return result.affectedRows > 0;
  }

  // Delete department
  static async delete(id) {
    const query = "DELETE FROM departments WHERE id = ?";
    const [result] = await pool.execute(query, [id]);
    return result.affectedRows > 0;
  }

  // Soft delete
  static async softDelete(id) {
    const query = 'UPDATE departments SET status = "Inactive" WHERE id = ?';
    const [result] = await pool.execute(query, [id]);
    return result.affectedRows > 0;
  }

  // Get departments by center and location
  static async getByCenterAndLocation(centerId, locationId) {
    const query = `
      SELECT * FROM departments 
      WHERE center_id = ? AND location_id = ? AND status = 'Active'
    `;
    const [rows] = await pool.execute(query, [centerId, locationId]);
    return rows;
  }
}

module.exports = Department;
