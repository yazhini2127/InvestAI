const db = require("../config/db");

// Get all transactions for a user
exports.getTransactions = (userId, callback) => {
    const sql = `
        SELECT
            transaction_id,
            user_id,
            investment_id,
            transaction_type,
            amount,
            quantity,
            transaction_date
        FROM transactions
        WHERE user_id = ?
        ORDER BY transaction_date DESC
    `;

    db.query(sql, [userId], callback);
};