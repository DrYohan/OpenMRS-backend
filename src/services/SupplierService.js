const pool = require("../config/database");

const SupplierService = {

    async isEmailExist(email) {
        try {
            const [rows] = await pool.execute(
                "SELECT COUNT(*) AS count FROM suppliers WHERE email = ?",
                [email]
            );
            return rows[0].count > 0 ? true : false;
        } catch (error) {
            console.error("Error checking email existence:", error);
            throw error;
        }
    }

}

module.exports = SupplierService;