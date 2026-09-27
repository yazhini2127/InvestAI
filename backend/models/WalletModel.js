const db = require("../config/db");

// Get wallet by logged-in user ID
const getWalletByUserId = (userId, callback) => {
    const sql = `
        SELECT
            wallet_id,
            user_id,
            balance
        FROM wallet
        WHERE user_id = ?
        LIMIT 1
    `;

    db.query(sql, [userId], callback);
};

module.exports = {
    getWalletByUserId,
};