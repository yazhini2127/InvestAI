const db = require("../config/db");

// =====================================================
// GET ALL TRANSACTIONS BY USER
// =====================================================

const getTransactionsByUserModel = (userId, callback) => {
    const sql = `
        SELECT
            t.transaction_id,
            t.user_id,
            t.investment_id,
            t.transaction_type,
            t.amount,
            t.quantity,
            t.transaction_date,

            COALESCE(
                i.investment_name,
                'Unknown Investment'
            ) AS investment_name,

            COALESCE(
                i.investment_type,
                'Investment'
            ) AS investment_type,

            COALESCE(
                i.current_price,
                0
            ) AS current_price,

            COALESCE(
                i.risk_level,
                ''
            ) AS risk_level

        FROM transactions t

        LEFT JOIN investments i
            ON t.investment_id = i.investment_id

        WHERE t.user_id = ?

        ORDER BY t.transaction_date DESC
    `;

    db.query(
        sql,
        [userId],
        callback
    );
};


// =====================================================
// GET SINGLE TRANSACTION
// =====================================================

const getTransactionByIdModel = (
    transactionId,
    callback
) => {
    const sql = `
        SELECT
            t.transaction_id,
            t.user_id,
            t.investment_id,
            t.transaction_type,
            t.amount,
            t.quantity,
            t.transaction_date,

            COALESCE(
                i.investment_name,
                'Unknown Investment'
            ) AS investment_name,

            COALESCE(
                i.investment_type,
                'Investment'
            ) AS investment_type,

            COALESCE(
                i.current_price,
                0
            ) AS current_price,

            COALESCE(
                i.risk_level,
                ''
            ) AS risk_level

        FROM transactions t

        LEFT JOIN investments i
            ON t.investment_id = i.investment_id

        WHERE t.transaction_id = ?
    `;

    db.query(
        sql,
        [transactionId],
        callback
    );
};


// =====================================================
// CREATE TRANSACTION
// =====================================================

const createTransactionModel = (
    transactionData,
    callback
) => {
    const {
        user_id,
        investment_id,
        transaction_type,
        amount,
        quantity
    } = transactionData;

    const sql = `
        INSERT INTO transactions
        (
            user_id,
            investment_id,
            transaction_type,
            amount,
            quantity,
            transaction_date
        )
        VALUES (?, ?, ?, ?, ?, NOW())
    `;

    db.query(
        sql,
        [
            user_id,
            investment_id,
            transaction_type,
            amount,
            quantity
        ],
        callback
    );
};


// =====================================================
// DELETE SINGLE TRANSACTION
// =====================================================

const deleteTransactionModel = (
    transactionId,
    callback
) => {
    const sql = `
        DELETE FROM transactions
        WHERE transaction_id = ?
    `;

    db.query(
        sql,
        [transactionId],
        callback
    );
};


// =====================================================
// DELETE ALL TRANSACTIONS BY USER
// =====================================================

const deleteAllTransactionsByUserModel = (
    userId,
    callback
) => {
    const sql = `
        DELETE FROM transactions
        WHERE user_id = ?
    `;

    db.query(
        sql,
        [userId],
        callback
    );
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {
    getTransactionsByUserModel,
    getTransactionByIdModel,
    createTransactionModel,
    deleteTransactionModel,
    deleteAllTransactionsByUserModel
};