const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Get wallet balance
router.get("/:userId", (req, res) => {
    const userId = req.params.userId;

    const sql = `
        SELECT wallet_id, user_id, balance, updated_at
        FROM wallet
        WHERE user_id = ?
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("Wallet GET Error:", err);
            return res.status(500).json({
                success: false,
                message: "Failed to load wallet",
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Wallet not found",
            });
        }

        res.json({
            success: true,
            wallet: results[0],
        });
    });
});

// Deposit
router.post("/:userId/deposit", (req, res) => {
    const userId = req.params.userId;
    const { amount } = req.body;

    if (!amount || Number(amount) <= 0) {
        return res.status(400).json({
            success: false,
            message: "Enter a valid amount",
        });
    }

    const sql = `
        UPDATE wallet
        SET balance = balance + ?
        WHERE user_id = ?
    `;

    db.query(sql, [Number(amount), userId], (err, result) => {
        if (err) {
            console.error("Deposit Error:", err);
            return res.status(500).json({
                success: false,
                message: "Deposit failed",
            });
        }

        res.json({
            success: true,
            message: "Money added successfully",
        });
    });
});

// Withdraw
router.post("/:userId/withdraw", (req, res) => {
    const userId = req.params.userId;
    const { amount } = req.body;

    if (!amount || Number(amount) <= 0) {
        return res.status(400).json({
            success: false,
            message: "Enter a valid amount",
        });
    }

    const checkSql = `
        SELECT balance
        FROM wallet
        WHERE user_id = ?
    `;

    db.query(checkSql, [userId], (err, results) => {
        if (err) {
            console.error("Balance Check Error:", err);
            return res.status(500).json({
                success: false,
                message: "Database error",
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Wallet not found",
            });
        }

        const balance = Number(results[0].balance);
        const withdrawAmount = Number(amount);

        if (withdrawAmount > balance) {
            return res.status(400).json({
                success: false,
                message: "Insufficient Balance",
            });
        }

        const updateSql = `
            UPDATE wallet
            SET balance = balance - ?
            WHERE user_id = ?
        `;

        db.query(
            updateSql,
            [withdrawAmount, userId],
            (err) => {
                if (err) {
                    console.error("Withdraw Error:", err);
                    return res.status(500).json({
                        success: false,
                        message: "Withdraw failed",
                    });
                }

                res.json({
                    success: true,
                    message: "Money withdrawn successfully",
                });
            }
        );
    });
});

module.exports = router;