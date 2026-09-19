const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

// ==========================
// GET WALLET BALANCE
// ==========================
router.get("/", authMiddleware, (req, res) => {
    const userId = req.user.id;

    const selectSql = `
        SELECT wallet_id, user_id, balance, updated_at
        FROM wallet
        WHERE user_id = ?
    `;

    db.query(selectSql, [userId], (err, results) => {
        if (err) {
            console.error("Wallet GET Error:", err);

            return res.status(500).json({
                success: false,
                message: "Failed to load wallet",
            });
        }

        // Wallet already exists
        if (results.length > 0) {
            return res.json({
                success: true,
                wallet: results[0],
            });
        }

        // ==========================
        // CREATE WALLET IF NOT EXISTS
        // ==========================

        const insertSql = `
            INSERT INTO wallet (user_id, balance)
            VALUES (?, ?)
        `;

        db.query(
            insertSql,
            [userId, 0],
            (insertErr, insertResult) => {
                if (insertErr) {
                    console.error(
                        "Wallet Create Error:",
                        insertErr
                    );

                    return res.status(500).json({
                        success: false,
                        message:
                            "Failed to create wallet",
                    });
                }

                return res.json({
                    success: true,
                    wallet: {
                        wallet_id:
                            insertResult.insertId,
                        user_id: userId,
                        balance: 0,
                    },
                });
            }
        );
    });
});


// ==========================
// DEPOSIT MONEY
// ==========================
router.post(
    "/deposit",
    authMiddleware,
    (req, res) => {
        const userId = req.user.id;
        const amount = Number(req.body.amount);

        if (!Number.isFinite(amount) || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid amount",
            });
        }

        // First check wallet
        const checkSql = `
            SELECT wallet_id, balance
            FROM wallet
            WHERE user_id = ?
        `;

        db.query(
            checkSql,
            [userId],
            (err, results) => {
                if (err) {
                    console.error(
                        "Wallet Check Error:",
                        err
                    );

                    return res.status(500).json({
                        success: false,
                        message:
                            "Database error",
                    });
                }

                // ==========================
                // CREATE WALLET IF MISSING
                // ==========================
                if (results.length === 0) {
                    const insertSql = `
                        INSERT INTO wallet
                        (user_id, balance)
                        VALUES (?, ?)
                    `;

                    db.query(
                        insertSql,
                        [userId, amount],
                        (insertErr, insertResult) => {
                            if (insertErr) {
                                console.error(
                                    "Wallet Create Error:",
                                    insertErr
                                );

                                return res.status(500).json({
                                    success: false,
                                    message:
                                        "Deposit failed",
                                });
                            }

                            return res.json({
                                success: true,
                                message:
                                    "Money added successfully",
                                wallet: {
                                    wallet_id:
                                        insertResult.insertId,
                                    user_id: userId,
                                    balance: amount,
                                },
                            });
                        }
                    );

                    return;
                }

                // ==========================
                // UPDATE EXISTING WALLET
                // ==========================

                const updateSql = `
                    UPDATE wallet
                    SET balance = balance + ?
                    WHERE user_id = ?
                `;

                db.query(
                    updateSql,
                    [amount, userId],
                    (updateErr) => {
                        if (updateErr) {
                            console.error(
                                "Deposit Error:",
                                updateErr
                            );

                            return res.status(500).json({
                                success: false,
                                message:
                                    "Deposit failed",
                            });
                        }

                        // Get updated balance
                        const balanceSql = `
                            SELECT wallet_id, user_id, balance
                            FROM wallet
                            WHERE user_id = ?
                        `;

                        db.query(
                            balanceSql,
                            [userId],
                            (balanceErr, balanceResults) => {
                                if (balanceErr) {
                                    console.error(
                                        "Balance Fetch Error:",
                                        balanceErr
                                    );

                                    return res.json({
                                        success: true,
                                        message:
                                            "Money added successfully",
                                    });
                                }

                                return res.json({
                                    success: true,
                                    message:
                                        "Money added successfully",
                                    wallet:
                                        balanceResults[0],
                                });
                            }
                        );
                    }
                );
            }
        );
    }
);


// ==========================
// WITHDRAW MONEY
// ==========================
router.post(
    "/withdraw",
    authMiddleware,
    (req, res) => {
        const userId = req.user.id;
        const amount = Number(req.body.amount);

        if (!Number.isFinite(amount) || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid amount",
            });
        }

        const checkSql = `
            SELECT wallet_id, balance
            FROM wallet
            WHERE user_id = ?
        `;

        db.query(
            checkSql,
            [userId],
            (err, results) => {
                if (err) {
                    console.error(
                        "Balance Check Error:",
                        err
                    );

                    return res.status(500).json({
                        success: false,
                        message:
                            "Database error",
                    });
                }

                // No wallet
                if (results.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message:
                            "Wallet not found",
                    });
                }

                const balance = Number(
                    results[0].balance
                );

                if (amount > balance) {
                    return res.status(400).json({
                        success: false,
                        message:
                            "Insufficient Balance",
                    });
                }

                const updateSql = `
                    UPDATE wallet
                    SET balance = balance - ?
                    WHERE user_id = ?
                `;

                db.query(
                    updateSql,
                    [amount, userId],
                    (updateErr) => {
                        if (updateErr) {
                            console.error(
                                "Withdraw Error:",
                                updateErr
                            );

                            return res.status(500).json({
                                success: false,
                                message:
                                    "Withdraw failed",
                            });
                        }

                        const balanceSql = `
                            SELECT wallet_id, user_id, balance
                            FROM wallet
                            WHERE user_id = ?
                        `;

                        db.query(
                            balanceSql,
                            [userId],
                            (balanceErr, balanceResults) => {
                                if (balanceErr) {
                                    return res.json({
                                        success: true,
                                        message:
                                            "Money withdrawn successfully",
                                    });
                                }

                                return res.json({
                                    success: true,
                                    message:
                                        "Money withdrawn successfully",
                                    wallet:
                                        balanceResults[0],
                                });
                            }
                        );
                    }
                );
            }
        );
    }
);


module.exports = router;