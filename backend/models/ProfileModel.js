const db = require("../config/db");

// ==========================
// Get User Profile
// ==========================
exports.getProfile = (userId, callback) => {
    const sql = `
        SELECT
            user_id,
            full_name,
            email,
            phone,
            risk_level,
            created_at
        FROM users
        WHERE user_id = ?
    `;

    db.query(sql, [userId], callback);
};