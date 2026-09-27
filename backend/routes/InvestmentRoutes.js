const express = require("express");
const router = express.Router();

const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

// =====================================================
// GET ALL INVESTMENTS
// GET /api/investments
// IMPORTANT:
// Investments are COMMON for all users.
// Do NOT filter investments by user_id.
// =====================================================

router.get("/", authMiddleware, (req, res) => {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });
    }

    const sql = `
        SELECT
            investment_id,
            investment_name,
            investment_type,
            current_price,
            risk_level
        FROM investments
        ORDER BY investment_id DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("❌ Investments GET Error:", err);

            return res.status(500).json({
                success: false,
                message: "Failed to load investments",
                error: err.message
            });
        }

        return res.status(200).json({
            success: true,
            investments: results
        });
    });
});


// =====================================================
// GET SINGLE INVESTMENT
// GET /api/investments/:id
// Common investment - available to all users
// =====================================================

router.get("/:id", authMiddleware, (req, res) => {
    const userId = req.user?.id;
    const investmentId = Number(req.params.id);

    if (!userId) {
        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });
    }

    if (!Number.isInteger(investmentId) || investmentId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid investment ID"
        });
    }

    const sql = `
        SELECT
            investment_id,
            investment_name,
            investment_type,
            current_price,
            risk_level
        FROM investments
        WHERE investment_id = ?
        LIMIT 1
    `;

    db.query(
        sql,
        [investmentId],
        (err, results) => {
            if (err) {
                console.error("❌ Single Investment Error:", err);

                return res.status(500).json({
                    success: false,
                    message: "Failed to load investment",
                    error: err.message
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Investment not found"
                });
            }

            return res.status(200).json({
                success: true,
                investment: results[0]
            });
        }
    );
});


// =====================================================
// EDIT INVESTMENT
// PUT /api/investments/:id
//
// Kept user-protected because editing the common
// investment catalog should not be allowed to everyone.
// =====================================================

router.put("/:id", authMiddleware, (req, res) => {
    const userId = req.user?.id;
    const investmentId = Number(req.params.id);

    if (!userId) {
        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });
    }

    if (!Number.isInteger(investmentId) || investmentId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid investment ID"
        });
    }

    const {
        investment_name,
        investment_type,
        current_price,
        risk_level
    } = req.body;

    if (
        !investment_name ||
        !investment_type ||
        current_price === undefined ||
        current_price === null ||
        !risk_level
    ) {
        return res.status(400).json({
            success: false,
            message: "All investment details are required"
        });
    }

    const price = Number(current_price);

    if (!Number.isFinite(price) || price <= 0) {
        return res.status(400).json({
            success: false,
            message: "Price must be greater than 0"
        });
    }

    const sql = `
        UPDATE investments
        SET
            investment_name = ?,
            investment_type = ?,
            current_price = ?,
            risk_level = ?
        WHERE investment_id = ?
        AND user_id = ?
    `;

    db.query(
        sql,
        [
            investment_name,
            investment_type,
            price,
            risk_level,
            investmentId,
            userId
        ],
        (err, result) => {
            if (err) {
                console.error("❌ Investment UPDATE Error:", err);

                return res.status(500).json({
                    success: false,
                    message: "Failed to update investment",
                    error: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Investment not found or you do not have permission"
                });
            }

            return res.status(200).json({
                success: true,
                message: "Investment updated successfully"
            });
        }
    );
});


// =====================================================
// DELETE INVESTMENT
// DELETE /api/investments/:id
//
// Kept user-protected.
// =====================================================

router.delete("/:id", authMiddleware, (req, res) => {
    const userId = req.user?.id;
    const investmentId = Number(req.params.id);

    if (!userId) {
        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });
    }

    if (!Number.isInteger(investmentId) || investmentId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid investment ID"
        });
    }

    const sql = `
        DELETE FROM investments
        WHERE investment_id = ?
        AND user_id = ?
    `;

    db.query(
        sql,
        [investmentId, userId],
        (err, result) => {
            if (err) {
                console.error("❌ Investment DELETE Error:", err);

                return res.status(500).json({
                    success: false,
                    message: "Failed to delete investment",
                    error: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Investment not found or you do not have permission"
                });
            }

            return res.status(200).json({
                success: true,
                message: "Investment deleted successfully"
            });
        }
    );
});


// =====================================================
// BUY INVESTMENT
// POST /api/investments/buy
//
// Body:
// {
//     "investment_id": 1,
//     "platform_id": 1,
//     "quantity": 2
// }
// =====================================================

router.post("/buy", authMiddleware, (req, res) => {
    const userId = req.user?.id;

    const {
        investment_id,
        platform_id,
        quantity
    } = req.body;

    if (!userId) {
        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });
    }

    const investmentId = Number(investment_id);
    const platformId = Number(platform_id);
    const buyQuantity = Number(quantity);

    if (
        !Number.isInteger(investmentId) ||
        investmentId <= 0 ||
        !Number.isInteger(platformId) ||
        platformId <= 0 ||
        !Number.isInteger(buyQuantity) ||
        buyQuantity <= 0
    ) {
        return res.status(400).json({
            success: false,
            message: "Invalid investment, platform or quantity"
        });
    }

    // =================================================
    // CHECK PLATFORM
    // =================================================

    const platformSQL = `
        SELECT
            platform_id,
            platform_name
        FROM platforms
        WHERE platform_id = ?
        LIMIT 1
    `;

    db.query(
        platformSQL,
        [platformId],
        (platformError, platformResults) => {
            if (platformError) {
                console.error("❌ Platform lookup error:", platformError);

                return res.status(500).json({
                    success: false,
                    message: "Failed to load platform",
                    error: platformError.message
                });
            }

            if (platformResults.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Platform not found"
                });
            }

            // =============================================
            // GET INVESTMENT
            // IMPORTANT:
            // No user_id filter here.
            // All users can buy common investments.
            // =============================================

            const investmentSQL = `
                SELECT
                    investment_id,
                    investment_name,
                    current_price
                FROM investments
                WHERE investment_id = ?
                LIMIT 1
            `;

            db.query(
                investmentSQL,
                [investmentId],
                (investmentError, investmentResults) => {
                    if (investmentError) {
                        console.error(
                            "❌ Investment lookup error:",
                            investmentError
                        );

                        return res.status(500).json({
                            success: false,
                            message: "Failed to find investment",
                            error: investmentError.message
                        });
                    }

                    if (investmentResults.length === 0) {
                        return res.status(404).json({
                            success: false,
                            message: "Investment not found"
                        });
                    }

                    const investment = investmentResults[0];

                    const price = Number(
                        investment.current_price
                    );

                    const totalAmount =
                        price * buyQuantity;

                    // =========================================
                    // GET USER WALLET
                    // =========================================

                    const walletSQL = `
                        SELECT
                            wallet_id,
                            balance
                        FROM wallet
                        WHERE user_id = ?
                        LIMIT 1
                    `;

                    db.query(
                        walletSQL,
                        [userId],
                        (walletError, walletResults) => {
                            if (walletError) {
                                console.error(
                                    "❌ Wallet lookup error:",
                                    walletError
                                );

                                return res.status(500).json({
                                    success: false,
                                    message: "Failed to load wallet",
                                    error: walletError.message
                                });
                            }

                            if (walletResults.length === 0) {
                                return res.status(404).json({
                                    success: false,
                                    message: "Wallet not found"
                                });
                            }

                            const balance = Number(
                                walletResults[0].balance || 0
                            );

                            if (balance < totalAmount) {
                                return res.status(400).json({
                                    success: false,
                                    message: "Insufficient wallet balance",
                                    balance,
                                    required: totalAmount
                                });
                            }

                            const newBalance =
                                balance - totalAmount;

                            // =================================
                            // UPDATE WALLET
                            // =================================

                            const updateWalletSQL = `
                                UPDATE wallet
                                SET balance = ?
                                WHERE user_id = ?
                            `;

                            db.query(
                                updateWalletSQL,
                                [
                                    newBalance,
                                    userId
                                ],
                                (walletUpdateError) => {
                                    if (walletUpdateError) {
                                        console.error(
                                            "❌ Wallet update error:",
                                            walletUpdateError
                                        );

                                        return res.status(500).json({
                                            success: false,
                                            message:
                                                "Failed to update wallet",
                                            error:
                                                walletUpdateError.message
                                        });
                                    }

                                    // =================================
                                    // CHECK USER PORTFOLIO
                                    // =================================

                                    const portfolioSQL = `
                                        SELECT
                                            portfolio_id,
                                            quantity,
                                            invested_amount
                                        FROM portfolio
                                        WHERE user_id = ?
                                        AND investment_id = ?
                                        AND platform_id = ?
                                        LIMIT 1
                                    `;

                                    db.query(
                                        portfolioSQL,
                                        [
                                            userId,
                                            investmentId,
                                            platformId
                                        ],
                                        (
                                            portfolioError,
                                            portfolioResults
                                        ) => {
                                            if (portfolioError) {
                                                console.error(
                                                    "❌ Portfolio check error:",
                                                    portfolioError
                                                );

                                                return res.status(500).json({
                                                    success: false,
                                                    message:
                                                        "Failed to check portfolio",
                                                    error:
                                                        portfolioError.message
                                                });
                                            }

                                            // =================================
                                            // EXISTING PORTFOLIO
                                            // =================================

                                            if (
                                                portfolioResults.length > 0
                                            ) {
                                                const portfolio =
                                                    portfolioResults[0];

                                                const newQuantity =
                                                    Number(
                                                        portfolio.quantity
                                                    ) +
                                                    buyQuantity;

                                                const newInvestedAmount =
                                                    Number(
                                                        portfolio.invested_amount || 0
                                                    ) +
                                                    totalAmount;

                                                const updatePortfolioSQL = `
                                                    UPDATE portfolio
                                                    SET
                                                        quantity = ?,
                                                        invested_amount = ?
                                                    WHERE portfolio_id = ?
                                                    AND user_id = ?
                                                `;

                                                db.query(
                                                    updatePortfolioSQL,
                                                    [
                                                        newQuantity,
                                                        newInvestedAmount,
                                                        portfolio.portfolio_id,
                                                        userId
                                                    ],
                                                    (updateError) => {
                                                        if (updateError) {
                                                            console.error(
                                                                "❌ Portfolio update error:",
                                                                updateError
                                                            );

                                                            return res.status(500).json({
                                                                success: false,
                                                                message:
                                                                    "Failed to update portfolio",
                                                                error:
                                                                    updateError.message
                                                            });
                                                        }

                                                        addBuyTransaction(
                                                            newBalance
                                                        );
                                                    }
                                                );
                                            }

                                            // =================================
                                            // NEW PORTFOLIO
                                            // =================================

                                            else {
                                                const createPortfolioSQL = `
                                                    INSERT INTO portfolio
                                                    (
                                                        user_id,
                                                        investment_id,
                                                        platform_id,
                                                        quantity,
                                                        invested_amount,
                                                        purchase_date
                                                    )
                                                    VALUES
                                                    (?, ?, ?, ?, ?, CURDATE())
                                                `;

                                                db.query(
                                                    createPortfolioSQL,
                                                    [
                                                        userId,
                                                        investmentId,
                                                        platformId,
                                                        buyQuantity,
                                                        totalAmount
                                                    ],
                                                    (createError) => {
                                                        if (createError) {
                                                            console.error(
                                                                "❌ Portfolio create error:",
                                                                createError
                                                            );

                                                            return res.status(500).json({
                                                                success: false,
                                                                message:
                                                                    "Failed to add investment to portfolio",
                                                                error:
                                                                    createError.message
                                                            });
                                                        }

                                                        addBuyTransaction(
                                                            newBalance
                                                        );
                                                    }
                                                );
                                            }
                                        }
                                    );

                                    // =================================
                                    // ADD BUY TRANSACTION
                                    // =================================

                                    function addBuyTransaction(
                                        finalBalance
                                    ) {
                                        const transactionSQL = `
                                            INSERT INTO transactions
                                            (
                                                user_id,
                                                investment_id,
                                                platform_id,
                                                transaction_type,
                                                amount,
                                                quantity
                                            )
                                            VALUES
                                            (?, ?, ?, 'BUY', ?, ?)
                                        `;

                                        db.query(
                                            transactionSQL,
                                            [
                                                userId,
                                                investmentId,
                                                platformId,
                                                totalAmount,
                                                buyQuantity
                                            ],
                                            (transactionError) => {
                                                if (transactionError) {
                                                    console.error(
                                                        "❌ Transaction error:",
                                                        transactionError
                                                    );

                                                    return res.status(500).json({
                                                        success: false,
                                                        message:
                                                            "Investment saved but transaction failed",
                                                        error:
                                                            transactionError.message
                                                    });
                                                }

                                                return res.status(200).json({
                                                    success: true,
                                                    message:
                                                        "Investment purchased successfully",
                                                    investment:
                                                        investment.investment_name,
                                                    platform:
                                                        platformResults[0]
                                                            .platform_name,
                                                    quantity:
                                                        buyQuantity,
                                                    amount:
                                                        totalAmount,
                                                    balance:
                                                        finalBalance
                                                });
                                            }
                                        );
                                    }
                                }
                            );
                        }
                    );
                }
            );
        }
    );
});


// =====================================================
// SELL INVESTMENT
// POST /api/investments/sell
//
// Body:
// {
//     "investment_id": 1,
//     "platform_id": 1,
//     "quantity": 2
// }
// =====================================================

router.post("/sell", authMiddleware, (req, res) => {
    const userId = req.user?.id;

    const {
        investment_id,
        platform_id,
        quantity
    } = req.body;

    if (!userId) {
        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });
    }

    const investmentId = Number(investment_id);
    const platformId = Number(platform_id);
    const sellQuantity = Number(quantity);

    if (
        !Number.isInteger(investmentId) ||
        investmentId <= 0 ||
        !Number.isInteger(platformId) ||
        platformId <= 0 ||
        !Number.isInteger(sellQuantity) ||
        sellQuantity <= 0
    ) {
        return res.status(400).json({
            success: false,
            message: "Invalid investment, platform or quantity"
        });
    }

    // =================================================
    // CHECK PLATFORM
    // =================================================

    const platformSQL = `
        SELECT
            platform_id,
            platform_name
        FROM platforms
        WHERE platform_id = ?
        LIMIT 1
    `;

    db.query(
        platformSQL,
        [platformId],
        (platformError, platformResults) => {
            if (platformError) {
                console.error(
                    "❌ Platform lookup error:",
                    platformError
                );

                return res.status(500).json({
                    success: false,
                    message: "Failed to load platform",
                    error: platformError.message
                });
            }

            if (platformResults.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Platform not found"
                });
            }

            // =============================================
            // GET INVESTMENT
            // IMPORTANT:
            // No user_id filter.
            // =============================================

            const investmentSQL = `
                SELECT
                    investment_id,
                    investment_name,
                    current_price
                FROM investments
                WHERE investment_id = ?
                LIMIT 1
            `;

            db.query(
                investmentSQL,
                [investmentId],
                (investmentError, investmentResults) => {
                    if (investmentError) {
                        console.error(
                            "❌ Investment lookup error:",
                            investmentError
                        );

                        return res.status(500).json({
                            success: false,
                            message: "Failed to find investment",
                            error: investmentError.message
                        });
                    }

                    if (investmentResults.length === 0) {
                        return res.status(404).json({
                            success: false,
                            message: "Investment not found"
                        });
                    }

                    const investment = investmentResults[0];

                    const price = Number(
                        investment.current_price
                    );

                    const sellAmount =
                        price * sellQuantity;

                    // =========================================
                    // GET USER PORTFOLIO
                    // =========================================

                    const portfolioSQL = `
                        SELECT
                            portfolio_id,
                            quantity,
                            invested_amount
                        FROM portfolio
                        WHERE user_id = ?
                        AND investment_id = ?
                        AND platform_id = ?
                        LIMIT 1
                    `;

                    db.query(
                        portfolioSQL,
                        [
                            userId,
                            investmentId,
                            platformId
                        ],
                        (
                            portfolioError,
                            portfolioResults
                        ) => {
                            if (portfolioError) {
                                console.error(
                                    "❌ Portfolio lookup error:",
                                    portfolioError
                                );

                                return res.status(500).json({
                                    success: false,
                                    message:
                                        "Failed to load portfolio",
                                    error:
                                        portfolioError.message
                                });
                            }

                            if (
                                portfolioResults.length === 0
                            ) {
                                return res.status(404).json({
                                    success: false,
                                    message:
                                        "Investment not found in selected platform portfolio"
                                });
                            }

                            const portfolio =
                                portfolioResults[0];

                            const ownedQuantity =
                                Number(
                                    portfolio.quantity
                                );

                            if (
                                sellQuantity >
                                ownedQuantity
                            ) {
                                return res.status(400).json({
                                    success: false,
                                    message:
                                        `You only own ${ownedQuantity} shares on this platform`
                                });
                            }

                            // =================================
                            // CALCULATE REMAINING
                            // =================================

                            const remainingQuantity =
                                ownedQuantity -
                                sellQuantity;

                            const investedAmount =
                                Number(
                                    portfolio.invested_amount || 0
                                );

                            const averageCost =
                                ownedQuantity > 0
                                    ? investedAmount /
                                      ownedQuantity
                                    : 0;

                            const reducedInvestment =
                                averageCost *
                                sellQuantity;

                            const remainingInvestedAmount =
                                Math.max(
                                    0,
                                    investedAmount -
                                    reducedInvestment
                                );

                            // =================================
                            // GET WALLET
                            // =================================

                            const walletSQL = `
                                SELECT
                                    wallet_id,
                                    balance
                                FROM wallet
                                WHERE user_id = ?
                                LIMIT 1
                            `;

                            db.query(
                                walletSQL,
                                [userId],
                                (
                                    walletError,
                                    walletResults
                                ) => {
                                    if (walletError) {
                                        console.error(
                                            "❌ Wallet lookup error:",
                                            walletError
                                        );

                                        return res.status(500).json({
                                            success: false,
                                            message:
                                                "Failed to load wallet",
                                            error:
                                                walletError.message
                                        });
                                    }

                                    if (
                                        walletResults.length === 0
                                    ) {
                                        return res.status(404).json({
                                            success: false,
                                            message:
                                                "Wallet not found"
                                        });
                                    }

                                    const currentBalance =
                                        Number(
                                            walletResults[0]
                                                .balance || 0
                                        );

                                    const newBalance =
                                        currentBalance +
                                        sellAmount;

                                    // =================================
                                    // UPDATE WALLET
                                    // =================================

                                    const updateWalletSQL = `
                                        UPDATE wallet
                                        SET balance = ?
                                        WHERE user_id = ?
                                    `;

                                    db.query(
                                        updateWalletSQL,
                                        [
                                            newBalance,
                                            userId
                                        ],
                                        (walletUpdateError) => {
                                            if (
                                                walletUpdateError
                                            ) {
                                                console.error(
                                                    "❌ Wallet update error:",
                                                    walletUpdateError
                                                );

                                                return res.status(500).json({
                                                    success: false,
                                                    message:
                                                        "Failed to update wallet",
                                                    error:
                                                        walletUpdateError.message
                                                });
                                            }

                                            // =================================
                                            // DELETE OR UPDATE PORTFOLIO
                                            // =================================

                                            if (
                                                remainingQuantity ===
                                                0
                                            ) {
                                                const deleteSQL = `
                                                    DELETE FROM portfolio
                                                    WHERE portfolio_id = ?
                                                    AND user_id = ?
                                                `;

                                                db.query(
                                                    deleteSQL,
                                                    [
                                                        portfolio.portfolio_id,
                                                        userId
                                                    ],
                                                    (
                                                        deleteError
                                                    ) => {
                                                        if (
                                                            deleteError
                                                        ) {
                                                            console.error(
                                                                "❌ Portfolio delete error:",
                                                                deleteError
                                                            );

                                                            return res.status(500).json({
                                                                success: false,
                                                                message:
                                                                    "Failed to remove portfolio investment",
                                                                error:
                                                                    deleteError.message
                                                            });
                                                        }

                                                        addSellTransaction(
                                                            newBalance
                                                        );
                                                    }
                                                );
                                            } else {
                                                const updateSQL = `
                                                    UPDATE portfolio
                                                    SET
                                                        quantity = ?,
                                                        invested_amount = ?
                                                    WHERE portfolio_id = ?
                                                    AND user_id = ?
                                                `;

                                                db.query(
                                                    updateSQL,
                                                    [
                                                        remainingQuantity,
                                                        remainingInvestedAmount,
                                                        portfolio.portfolio_id,
                                                        userId
                                                    ],
                                                    (
                                                        updateError
                                                    ) => {
                                                        if (
                                                            updateError
                                                        ) {
                                                            console.error(
                                                                "❌ Portfolio update error:",
                                                                updateError
                                                            );

                                                            return res.status(500).json({
                                                                success: false,
                                                                message:
                                                                    "Failed to update portfolio",
                                                                error:
                                                                    updateError.message
                                                            });
                                                        }

                                                        addSellTransaction(
                                                            newBalance
                                                        );
                                                    }
                                                );
                                            }

                                            // =================================
                                            // ADD SELL TRANSACTION
                                            // =================================

                                            function addSellTransaction(
                                                finalBalance
                                            ) {
                                                const transactionSQL = `
                                                    INSERT INTO transactions
                                                    (
                                                        user_id,
                                                        investment_id,
                                                        platform_id,
                                                        transaction_type,
                                                        amount,
                                                        quantity
                                                    )
                                                    VALUES
                                                    (?, ?, ?, 'SELL', ?, ?)
                                                `;

                                                db.query(
                                                    transactionSQL,
                                                    [
                                                        userId,
                                                        investmentId,
                                                        platformId,
                                                        sellAmount,
                                                        sellQuantity
                                                    ],
                                                    (
                                                        transactionError
                                                    ) => {
                                                        if (
                                                            transactionError
                                                        ) {
                                                            console.error(
                                                                "❌ Transaction error:",
                                                                transactionError
                                                            );

                                                            return res.status(500).json({
                                                                success: false,
                                                                message:
                                                                    "Sell completed but transaction failed",
                                                                error:
                                                                    transactionError.message
                                                            });
                                                        }

                                                        return res.status(200).json({
                                                            success: true,
                                                            message:
                                                                "Investment sold successfully",
                                                            investment:
                                                                investment.investment_name,
                                                            platform:
                                                                platformResults[0]
                                                                    .platform_name,
                                                            quantity:
                                                                sellQuantity,
                                                            amount:
                                                                sellAmount,
                                                            balance:
                                                                finalBalance
                                                        });
                                                    }
                                                );
                                            }
                                        }
                                    );
                                }
                            );
                        }
                    );
                }
            );
        }
    );
});


module.exports = router;