const pool = require("../config/database");

const VehicleService = {

    async checkRegistrationIdExist(registrationId) {
        try {
            const [rows] = await pool.execute(
                "SELECT COUNT(*) AS count FROM vehicles WHERE registration_id = ?",
                [registrationId]
            );
            return rows[0].count > 0 ? true : false;
        } catch (error) {
            console.error("Error checking registration id existence:", error);
            throw error;
        }
    },


    async checkChasisNoExist(chasisNo) {
        try {
            const [rows] = await pool.execute(
                "SELECT COUNT(*) AS count FROM vehicles WHERE chasis_no = ?",
                [chasisNo]
            );
            return rows[0].count > 0 ? true : false;
        } catch (error) {
            console.error("Error checking chasis no existence:", error);
            throw error;
        }
    },

    async checkEngineNoExist(engineNo) {
        try {
            const [rows] = await pool.execute(
                "SELECT COUNT(*) AS count FROM vehicles WHERE engine_no = ?",
                [engineNo]
            );
            return rows[0].count > 0 ? true : false;
        } catch (error) {
            console.error("Error checking engine no existence:", error);
            throw error;
        }
    },


    async checkRegistrationIdExistForUpdate(registrationId, vehicleId) {
        const [rows] = await pool.execute(
        "SELECT COUNT(*) AS count FROM vehicles WHERE registration_id = ? AND id != ?",
        [registrationId, vehicleId]
        );
        return rows[0].count > 0;
    },

    async checkChasisNoExistForUpdate(chasisNo, vehicleId) {
        const [rows] = await pool.execute(
        "SELECT COUNT(*) AS count FROM vehicles WHERE chasis_no = ? AND id != ?",
        [chasisNo, vehicleId]
        );
        return rows[0].count > 0;
    },

    async checkEngineNoExistForUpdate(engineNo, vehicleId) {
        const [rows] = await pool.execute(
        "SELECT COUNT(*) AS count FROM vehicles WHERE engine_no = ? AND id != ?",
        [engineNo, vehicleId]
        );
        return rows[0].count > 0;
    },





}

module.exports = VehicleService;