const db = require("../config/db");

// Get SIP Plans
exports.getSIPPlans = (userId, callback) => {
    const sql = `
        SELECT
            sip_id,
            user_id,
            investment_id,
            monthly_amount,
            sip_date,
            status
        FROM sip_plans
        WHERE user_id = ?
        ORDER BY sip_id DESC
    `;

    db.query(sql, [userId], callback);
};