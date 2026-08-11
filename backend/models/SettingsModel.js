const db = require("../config/db");

// Get Settings
exports.getSettings = (userId, callback) => {
    const sql = `
        SELECT
            settings_id,
            user_id,
            notifications,
            dark_mode,
            email_alerts,
            risk_level
        FROM settings
        WHERE user_id = ?
    `;

    db.query(sql, [userId], callback);
};

// Update Settings
exports.updateSettings = (userId, data, callback) => {
    const sql = `
        UPDATE settings
        SET
            notifications = ?,
            dark_mode = ?,
            email_alerts = ?,
            risk_level = ?
        WHERE user_id = ?
    `;

    db.query(
        sql,
        [
            data.notifications,
            data.dark_mode,
            data.email_alerts,
            data.risk_level,
            userId,
        ],
        callback
    );
};