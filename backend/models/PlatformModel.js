const db = require("../config/db");

const getAllPlatforms = (callback) => {
    const sql = `
        SELECT
            platform_id,
            platform_name
        FROM platforms
        ORDER BY platform_id ASC
    `;

    db.query(sql, callback);
};

module.exports = {
    getAllPlatforms
};