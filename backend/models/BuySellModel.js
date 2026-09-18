const db = require("../config/db");

// =====================================================
// GET INVESTMENT
// =====================================================

const getInvestment = (investmentId, callback) => {
    const sql = `
        SELECT
            investment_id,
            investment_name,
            investment_type,
            current_price,
            risk_level
        FROM investments
        WHERE investment_id = ?
    `;

    db.query(sql, [investmentId], callback);
};


// =====================================================
// GET USER WALLET
// =====================================================

const getWallet = (userId, callback) => {
    const sql = `
        SELECT
            wallet_id,
            user_id,
            balance
        FROM wallet
        WHERE user_id = ?
    `;

    db.query(sql, [userId], callback);
};


// =====================================================
// GET PORTFOLIO INVESTMENT
// =====================================================

const getPortfolioInvestment = (
    userId,
    investmentId,
    callback
) => {
    const sql = `
        SELECT
            portfolio_id,
            user_id,
            investment_id,
            quantity,
            invested_amount,
            purchase_date
        FROM portfolio
        WHERE user_id = ?
        AND investment_id = ?
        LIMIT 1
    `;

    db.query(
        sql,
        [userId, investmentId],
        callback
    );
};


// =====================================================
// UPDATE WALLET
// =====================================================

const updateWallet = (
    userId,
    balance,
    callback
) => {
    const sql = `
        UPDATE wallet
        SET balance = ?
        WHERE user_id = ?
    `;

    db.query(
        sql,
        [balance, userId],
        callback
    );
};


// =====================================================
// CREATE PORTFOLIO
// =====================================================

const createPortfolio = (
    data,
    callback
) => {
    const {
        user_id,
        investment_id,
        quantity,
        invested_amount
    } = data;

    const sql = `
        INSERT INTO portfolio
        (
            user_id,
            investment_id,
            quantity,
            invested_amount,
            purchase_date
        )
        VALUES (?, ?, ?, ?, CURDATE())
    `;

    db.query(
        sql,
        [
            user_id,
            investment_id,
            quantity,
            invested_amount
        ],
        callback
    );
};


// =====================================================
// UPDATE PORTFOLIO
// =====================================================

const updatePortfolio = (
    portfolioId,
    quantity,
    investedAmount,
    callback
) => {
    const sql = `
        UPDATE portfolio
        SET
            quantity = ?,
            invested_amount = ?
        WHERE portfolio_id = ?
    `;

    db.query(
        sql,
        [
            quantity,
            investedAmount,
            portfolioId
        ],
        callback
    );
};


// =====================================================
// DELETE PORTFOLIO
// =====================================================

const deletePortfolio = (
    portfolioId,
    callback
) => {
    const sql = `
        DELETE FROM portfolio
        WHERE portfolio_id = ?
    `;

    db.query(
        sql,
        [portfolioId],
        callback
    );
};


// =====================================================
// CREATE TRANSACTION
// =====================================================

const createTransaction = (
    data,
    callback
) => {
    const {
        user_id,
        investment_id,
        transaction_type,
        amount,
        quantity
    } = data;

    const sql = `
        INSERT INTO transactions
        (
            user_id,
            investment_id,
            transaction_type,
            amount,
            quantity
        )
        VALUES (?, ?, ?, ?, ?)
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
// EXPORT
// =====================================================

module.exports = {
    getInvestment,
    getWallet,
    getPortfolioInvestment,
    updateWallet,
    createPortfolio,
    updatePortfolio,
    deletePortfolio,
    createTransaction
};