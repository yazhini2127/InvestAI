const express = require("express");
const router = express.Router();

const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

// =====================================================
// GET WALLET BALANCE
// GET /api/wallet
// =====================================================
router.get("/", authMiddleware, (req, res) => {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({
            success: false,
            message: "Authentication required",
        });
    }

    const sql = `
        SELECT
            wallet_id,
            user_id,
            balance,
            updated_at
        FROM wallet
        WHERE user_id = ?
        LIMIT 1
    `;

    db.query(sql, [userId], (error, results) => {
        if (error) {
            console.error("❌ Wallet GET Error:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to load wallet",
                error: error.message,
            });
        }

        // Wallet exists
        if (results.length > 0) {
            return res.status(200).json({
                success: true,
                wallet: results[0],
            });
        }

        // Create wallet if it doesn't exist
        const createSql = `
            INSERT INTO wallet
            (
                user_id,
                balance
            )
            VALUES (?, 0)
        `;

        db.query(
            createSql,
            [userId],
            (createError, createResult) => {
                if (createError) {
                    console.error(
                        "❌ Wallet Create Error:",
                        createError
                    );

                    return res.status(500).json({
                        success: false,
                        message: "Failed to create wallet",
                        error: createError.message,
                    });
                }

                return res.status(200).json({
                    success: true,
                    wallet: {
                        wallet_id: createResult.insertId,
                        user_id: userId,
                        balance: 0,
                    },
                });
            }
        );
    });
});


// =====================================================
// DEPOSIT MONEY
// POST /api/wallet/deposit
// =====================================================
router.post(
    "/deposit",
    authMiddleware,
    (req, res) => {
        const userId = req.user?.id;
        const amount = Number(req.body.amount);

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        if (!Number.isFinite(amount) || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid amount",
            });
        }

        const checkSql = `
            SELECT
                wallet_id,
                user_id,
                balance
            FROM wallet
            WHERE user_id = ?
            LIMIT 1
        `;

        db.query(
            checkSql,
            [userId],
            (error, results) => {
                if (error) {
                    console.error(
                        "❌ Wallet Check Error:",
                        error
                    );

                    return res.status(500).json({
                        success: false,
                        message: "Database error",
                        error: error.message,
                    });
                }

                // Wallet doesn't exist
                if (results.length === 0) {
                    const insertSql = `
                        INSERT INTO wallet
                        (
                            user_id,
                            balance
                        )
                        VALUES (?, ?)
                    `;

                    db.query(
                        insertSql,
                        [userId, amount],
                        (insertError, insertResult) => {
                            if (insertError) {
                                console.error(
                                    "❌ Wallet Create Error:",
                                    insertError
                                );

                                return res.status(500).json({
                                    success: false,
                                    message: "Deposit failed",
                                    error: insertError.message,
                                });
                            }

                            return res.status(200).json({
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

                // Wallet exists → add money
                const updateSql = `
                    UPDATE wallet
                    SET balance = balance + ?
                    WHERE user_id = ?
                `;

                db.query(
                    updateSql,
                    [amount, userId],
                    (updateError) => {
                        if (updateError) {
                            console.error(
                                "❌ Deposit Update Error:",
                                updateError
                            );

                            return res.status(500).json({
                                success: false,
                                message: "Deposit failed",
                                error: updateError.message,
                            });
                        }

                        const balanceSql = `
                            SELECT
                                wallet_id,
                                user_id,
                                balance,
                                updated_at
                            FROM wallet
                            WHERE user_id = ?
                            LIMIT 1
                        `;

                        db.query(
                            balanceSql,
                            [userId],
                            (balanceError, balanceResults) => {
                                if (balanceError) {
                                    console.error(
                                        "❌ Balance Fetch Error:",
                                        balanceError
                                    );

                                    return res.status(200).json({
                                        success: true,
                                        message:
                                            "Money added successfully",
                                    });
                                }

                                return res.status(200).json({
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


// =====================================================
// WITHDRAW MONEY
// POST /api/wallet/withdraw
// =====================================================
router.post(
    "/withdraw",
    authMiddleware,
    (req, res) => {
        const userId = req.user?.id;
        const amount = Number(req.body.amount);

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        if (!Number.isFinite(amount) || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid amount",
            });
        }

        const checkSql = `
            SELECT
                wallet_id,
                user_id,
                balance
            FROM wallet
            WHERE user_id = ?
            LIMIT 1
        `;

        db.query(
            checkSql,
            [userId],
            (error, results) => {
                if (error) {
                    console.error(
                        "❌ Balance Check Error:",
                        error
                    );

                    return res.status(500).json({
                        success: false,
                        message: "Database error",
                        error: error.message,
                    });
                }

                if (results.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: "Wallet not found",
                    });
                }

                const balance = Number(
                    results[0].balance || 0
                );

                if (amount > balance) {
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
                    [amount, userId],
                    (updateError) => {
                        if (updateError) {
                            console.error(
                                "❌ Withdraw Error:",
                                updateError
                            );

                            return res.status(500).json({
                                success: false,
                                message: "Withdraw failed",
                                error: updateError.message,
                            });
                        }

                        const balanceSql = `
                            SELECT
                                wallet_id,
                                user_id,
                                balance,
                                updated_at
                            FROM wallet
                            WHERE user_id = ?
                            LIMIT 1
                        `;

                        db.query(
                            balanceSql,
                            [userId],
                            (balanceError, balanceResults) => {
                                if (balanceError) {
                                    console.error(
                                        "❌ Balance Fetch Error:",
                                        balanceError
                                    );

                                    return res.status(200).json({
                                        success: true,
                                        message:
                                            "Money withdrawn successfully",
                                    });
                                }

                                return res.status(200).json({
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


// =====================================================
// EXPORT
// =====================================================
module.exports = router;