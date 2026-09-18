const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ========================================
// GET ALL INVESTMENTS
// ========================================
router.get("/", (req, res) => {
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
            console.error("Investments GET Error:", err);

            return res.status(500).json({
                success: false,
                message: "Failed to load investments",
            });
        }

        res.json({
            success: true,
            investments: results,
        });
    });
});


// ========================================
// EDIT INVESTMENT
// ========================================
router.put("/:id", (req, res) => {

    const investmentId = req.params.id;

    const {
        investment_name,
        investment_type,
        current_price,
        risk_level,
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
            message: "All investment details are required",
        });
    }

    if (Number(current_price) <= 0) {
        return res.status(400).json({
            success: false,
            message: "Price must be greater than 0",
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
    `;

    db.query(
        sql,
        [
            investment_name,
            investment_type,
            Number(current_price),
            risk_level,
            investmentId,
        ],
        (err, result) => {

            if (err) {
                console.error(
                    "Investment UPDATE Error:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Failed to update investment",
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Investment not found",
                });
            }

            res.json({
                success: true,
                message: "Investment updated successfully",
            });
        }
    );
});


// ========================================
// BUY INVESTMENT
// ========================================
router.post("/buy", (req, res) => {

    const {
        user_id,
        investment_id,
        quantity,
    } = req.body;

    if (
        !user_id ||
        !investment_id ||
        !quantity ||
        Number(quantity) <= 0
    ) {
        return res.status(400).json({
            success: false,
            message: "Invalid investment details",
        });
    }

    const buyQuantity = Number(quantity);

    // ========================================
    // GET INVESTMENT
    // ========================================
    const investmentSQL = `
        SELECT
            investment_id,
            investment_name,
            current_price
        FROM investments
        WHERE investment_id = ?
    `;

    db.query(
        investmentSQL,
        [investment_id],
        (err, investmentResults) => {

            if (err) {
                console.error(err);

                return res.status(500).json({
                    success: false,
                    message: "Failed to find investment",
                });
            }

            if (investmentResults.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Investment not found",
                });
            }

            const investment = investmentResults[0];

            const price =
                Number(investment.current_price);

            const totalAmount =
                price * buyQuantity;

            // ========================================
            // GET WALLET
            // ========================================
            const walletSQL = `
                SELECT
                    wallet_id,
                    balance
                FROM wallet
                WHERE user_id = ?
            `;

            db.query(
                walletSQL,
                [user_id],
                (err, walletResults) => {

                    if (err) {
                        console.error(err);

                        return res.status(500).json({
                            success: false,
                            message: "Failed to load wallet",
                        });
                    }

                    if (walletResults.length === 0) {
                        return res.status(404).json({
                            success: false,
                            message: "Wallet not found",
                        });
                    }

                    const wallet = walletResults[0];

                    const balance =
                        Number(wallet.balance);

                    // ========================================
                    // CHECK BALANCE
                    // ========================================
                    if (balance < totalAmount) {
                        return res.status(400).json({
                            success: false,
                            message:
                                "Insufficient wallet balance",
                        });
                    }

                    const newBalance =
                        balance - totalAmount;

                    // ========================================
                    // UPDATE WALLET
                    // ========================================
                    const updateWalletSQL = `
                        UPDATE wallet
                        SET balance = ?
                        WHERE user_id = ?
                    `;

                    db.query(
                        updateWalletSQL,
                        [
                            newBalance,
                            user_id,
                        ],
                        (err) => {

                            if (err) {
                                console.error(err);

                                return res.status(500).json({
                                    success: false,
                                    message:
                                        "Failed to update wallet",
                                });
                            }

                            // ========================================
                            // CHECK EXISTING PORTFOLIO
                            // ========================================
                            const portfolioCheckSQL = `
                                SELECT
                                    portfolio_id,
                                    quantity,
                                    invested_amount
                                FROM portfolio
                                WHERE user_id = ?
                                AND investment_id = ?
                                LIMIT 1
                            `;

                            db.query(
                                portfolioCheckSQL,
                                [
                                    user_id,
                                    investment_id,
                                ],
                                (err, portfolioResults) => {

                                    if (err) {
                                        console.error(err);

                                        return res.status(500).json({
                                            success: false,
                                            message:
                                                "Failed to check portfolio",
                                        });
                                    }

                                    // ========================================
                                    // EXISTING PORTFOLIO
                                    // ========================================
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
                                                portfolio.invested_amount
                                            ) +
                                            totalAmount;

                                        const updatePortfolioSQL = `
                                            UPDATE portfolio
                                            SET
                                                quantity = ?,
                                                invested_amount = ?
                                            WHERE portfolio_id = ?
                                        `;

                                        db.query(
                                            updatePortfolioSQL,
                                            [
                                                newQuantity,
                                                newInvestedAmount,
                                                portfolio.portfolio_id,
                                            ],
                                            (err) => {

                                                if (err) {
                                                    console.error(err);

                                                    return res.status(500).json({
                                                        success: false,
                                                        message:
                                                            "Failed to update portfolio",
                                                    });
                                                }

                                                addBuyTransaction();
                                            }
                                        );

                                    } else {

                                        // ========================================
                                        // NEW PORTFOLIO
                                        // ========================================
                                        const portfolioSQL = `
                                            INSERT INTO portfolio
                                            (
                                                user_id,
                                                investment_id,
                                                quantity,
                                                invested_amount,
                                                purchase_date
                                            )
                                            VALUES
                                            (?, ?, ?, ?, CURDATE())
                                        `;

                                        db.query(
                                            portfolioSQL,
                                            [
                                                user_id,
                                                investment_id,
                                                buyQuantity,
                                                totalAmount,
                                            ],
                                            (err) => {

                                                if (err) {
                                                    console.error(err);

                                                    return res.status(500).json({
                                                        success: false,
                                                        message:
                                                            "Failed to add investment to portfolio",
                                                    });
                                                }

                                                addBuyTransaction();
                                            }
                                        );
                                    }

                                    // ========================================
                                    // ADD BUY TRANSACTION
                                    // ========================================
                                    function addBuyTransaction() {

                                        const transactionSQL = `
                                            INSERT INTO transactions
                                            (
                                                user_id,
                                                investment_id,
                                                transaction_type,
                                                amount,
                                                quantity
                                            )
                                            VALUES
                                            (?, ?, 'BUY', ?, ?)
                                        `;

                                        db.query(
                                            transactionSQL,
                                            [
                                                user_id,
                                                investment_id,
                                                totalAmount,
                                                buyQuantity,
                                            ],
                                            (err) => {

                                                if (err) {
                                                    console.error(err);

                                                    return res.status(500).json({
                                                        success: false,
                                                        message:
                                                            "Investment saved but transaction failed",
                                                    });
                                                }

                                                res.json({
                                                    success: true,
                                                    message:
                                                        "Investment purchased successfully",
                                                    investment:
                                                        investment.investment_name,
                                                    quantity:
                                                        buyQuantity,
                                                    amount:
                                                        totalAmount,
                                                    balance:
                                                        newBalance,
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


// ========================================
// SELL INVESTMENT
// ========================================
router.post("/sell", (req, res) => {

    const {
        user_id,
        investment_id,
        quantity,
    } = req.body;

    if (
        !user_id ||
        !investment_id ||
        !quantity ||
        Number(quantity) <= 0
    ) {
        return res.status(400).json({
            success: false,
            message: "Invalid sell details",
        });
    }

    const sellQuantity = Number(quantity);

    // ========================================
    // GET INVESTMENT
    // ========================================
    const investmentSQL = `
        SELECT
            investment_id,
            investment_name,
            current_price
        FROM investments
        WHERE investment_id = ?
    `;

    db.query(
        investmentSQL,
        [investment_id],
        (err, investmentResults) => {

            if (err) {
                console.error(err);

                return res.status(500).json({
                    success: false,
                    message: "Failed to find investment",
                });
            }

            if (investmentResults.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Investment not found",
                });
            }

            const investment =
                investmentResults[0];

            const price =
                Number(investment.current_price);

            const sellAmount =
                price * sellQuantity;

            // ========================================
            // GET PORTFOLIO
            // ========================================
            const portfolioSQL = `
                SELECT
                    portfolio_id,
                    quantity,
                    invested_amount
                FROM portfolio
                WHERE user_id = ?
                AND investment_id = ?
                LIMIT 1
            `;

            db.query(
                portfolioSQL,
                [
                    user_id,
                    investment_id,
                ],
                (err, portfolioResults) => {

                    if (err) {
                        console.error(err);

                        return res.status(500).json({
                            success: false,
                            message:
                                "Failed to load portfolio",
                        });
                    }

                    if (portfolioResults.length === 0) {
                        return res.status(404).json({
                            success: false,
                            message:
                                "Investment not found in portfolio",
                        });
                    }

                    const portfolio =
                        portfolioResults[0];

                    const ownedQuantity =
                        Number(portfolio.quantity);

                    // ========================================
                    // CHECK SHARES
                    // ========================================
                    if (
                        sellQuantity >
                        ownedQuantity
                    ) {
                        return res.status(400).json({
                            success: false,
                            message:
                                `You only own ${ownedQuantity} shares`,
                        });
                    }

                    // ========================================
                    // CALCULATE REMAINING
                    // ========================================
                    const remainingQuantity =
                        ownedQuantity -
                        sellQuantity;

                    /*
                     * Reduce invested amount
                     * proportionally based on average cost.
                     */
                    const averageCost =
                        Number(
                            portfolio.invested_amount
                        ) /
                        ownedQuantity;

                    const reducedInvestment =
                        averageCost *
                        sellQuantity;

                    const remainingInvestedAmount =
                        Math.max(
                            0,
                            Number(
                                portfolio.invested_amount
                            ) -
                            reducedInvestment
                        );

                    // ========================================
                    // UPDATE WALLET
                    // ========================================
                    const walletSQL = `
                        SELECT balance
                        FROM wallet
                        WHERE user_id = ?
                    `;

                    db.query(
                        walletSQL,
                        [user_id],
                        (err, walletResults) => {

                            if (err) {
                                console.error(err);

                                return res.status(500).json({
                                    success: false,
                                    message:
                                        "Failed to load wallet",
                                });
                            }

                            if (
                                walletResults.length === 0
                            ) {
                                return res.status(404).json({
                                    success: false,
                                    message:
                                        "Wallet not found",
                                });
                            }

                            const currentBalance =
                                Number(
                                    walletResults[0].balance
                                );

                            const newBalance =
                                currentBalance +
                                sellAmount;

                            // ========================================
                            // UPDATE WALLET
                            // ========================================
                            const updateWalletSQL = `
                                UPDATE wallet
                                SET balance = ?
                                WHERE user_id = ?
                            `;

                            db.query(
                                updateWalletSQL,
                                [
                                    newBalance,
                                    user_id,
                                ],
                                (err) => {

                                    if (err) {
                                        console.error(err);

                                        return res.status(500).json({
                                            success: false,
                                            message:
                                                "Failed to update wallet",
                                        });
                                    }

                                    // ========================================
                                    // UPDATE / DELETE PORTFOLIO
                                    // ========================================
                                    if (
                                        remainingQuantity === 0
                                    ) {

                                        const deletePortfolioSQL = `
                                            DELETE FROM portfolio
                                            WHERE portfolio_id = ?
                                        `;

                                        db.query(
                                            deletePortfolioSQL,
                                            [
                                                portfolio.portfolio_id,
                                            ],
                                            (err) => {

                                                if (err) {
                                                    console.error(err);

                                                    return res.status(500).json({
                                                        success: false,
                                                        message:
                                                            "Failed to remove portfolio investment",
                                                    });
                                                }

                                                addSellTransaction();
                                            }
                                        );

                                    } else {

                                        const updatePortfolioSQL = `
                                            UPDATE portfolio
                                            SET
                                                quantity = ?,
                                                invested_amount = ?
                                            WHERE portfolio_id = ?
                                        `;

                                        db.query(
                                            updatePortfolioSQL,
                                            [
                                                remainingQuantity,
                                                remainingInvestedAmount,
                                                portfolio.portfolio_id,
                                            ],
                                            (err) => {

                                                if (err) {
                                                    console.error(err);

                                                    return res.status(500).json({
                                                        success: false,
                                                        message:
                                                            "Failed to update portfolio",
                                                    });
                                                }

                                                addSellTransaction();
                                            }
                                        );
                                    }

                                    // ========================================
                                    // ADD SELL TRANSACTION
                                    // ========================================
                                    function addSellTransaction() {

                                        const transactionSQL = `
                                            INSERT INTO transactions
                                            (
                                                user_id,
                                                investment_id,
                                                transaction_type,
                                                amount,
                                                quantity
                                            )
                                            VALUES
                                            (?, ?, 'SELL', ?, ?)
                                        `;

                                        db.query(
                                            transactionSQL,
                                            [
                                                user_id,
                                                investment_id,
                                                sellAmount,
                                                sellQuantity,
                                            ],
                                            (err) => {

                                                if (err) {
                                                    console.error(err);

                                                    return res.status(500).json({
                                                        success: false,
                                                        message:
                                                            "Sell completed but transaction failed",
                                                    });
                                                }

                                                res.json({
                                                    success: true,
                                                    message:
                                                        "Investment sold successfully",
                                                    investment:
                                                        investment.investment_name,
                                                    quantity:
                                                        sellQuantity,
                                                    amount:
                                                        sellAmount,
                                                    balance:
                                                        newBalance,
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


module.exports = router;