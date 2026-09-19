const {
    getInvestment,
    getWallet,
    getPortfolioInvestment,
    updateWallet,
    createPortfolio,
    updatePortfolio,
    deletePortfolio,
    createTransaction
} = require("../models/BuySellModel");


// =====================================================
// BUY INVESTMENT
// =====================================================

const buyInvestment = (req, res) => {

    // Get logged-in user ID from JWT
    const user_id = req.user.id;

    const {
        investment_id,
        quantity
    } = req.body;


    // -----------------------------
    // Validation
    // -----------------------------

    if (!investment_id || !quantity) {
        return res.status(400).json({
            success: false,
            message:
                "Investment ID and Quantity are required"
        });
    }


    if (Number(quantity) <= 0) {
        return res.status(400).json({
            success: false,
            message:
                "Quantity must be greater than 0"
        });
    }


    // -----------------------------
    // Get Investment
    // -----------------------------

    getInvestment(
        investment_id,
        (investmentError, investmentResult) => {

            if (investmentError) {
                console.error(
                    "Investment Error:",
                    investmentError
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Failed to get investment"
                });
            }


            if (investmentResult.length === 0) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Investment not found"
                });
            }


            const investment =
                investmentResult[0];

            const price =
                Number(investment.current_price);

            const buyQuantity =
                Number(quantity);

            const totalAmount =
                price * buyQuantity;


            // -----------------------------
            // Get User Wallet
            // -----------------------------

            getWallet(
                user_id,
                (walletError, walletResult) => {

                    if (walletError) {
                        console.error(
                            "Wallet Error:",
                            walletError
                        );

                        return res.status(500).json({
                            success: false,
                            message:
                                "Failed to get wallet"
                        });
                    }


                    if (walletResult.length === 0) {
                        return res.status(404).json({
                            success: false,
                            message:
                                "Wallet not found"
                        });
                    }


                    const wallet =
                        walletResult[0];

                    const balance =
                        Number(wallet.balance);


                    // -----------------------------
                    // Check Balance
                    // -----------------------------

                    if (balance < totalAmount) {
                        return res.status(400).json({
                            success: false,
                            message:
                                "Insufficient wallet balance",
                            required:
                                totalAmount,
                            available:
                                balance
                        });
                    }


                    const newBalance =
                        balance - totalAmount;


                    // -----------------------------
                    // Update Wallet
                    // -----------------------------

                    updateWallet(
                        user_id,
                        newBalance,
                        (updateWalletError) => {

                            if (updateWalletError) {
                                console.error(
                                    "Wallet Update Error:",
                                    updateWalletError
                                );

                                return res.status(500).json({
                                    success: false,
                                    message:
                                        "Failed to update wallet"
                                });
                            }


                            // -----------------------------
                            // Check Portfolio
                            // -----------------------------

                            getPortfolioInvestment(
                                user_id,
                                investment_id,
                                (
                                    portfolioError,
                                    portfolioResult
                                ) => {

                                    if (portfolioError) {
                                        console.error(
                                            "Portfolio Error:",
                                            portfolioError
                                        );

                                        return res.status(500).json({
                                            success: false,
                                            message:
                                                "Failed to get portfolio"
                                        });
                                    }


                                    // -----------------------------
                                    // Save BUY Transaction
                                    // -----------------------------

                                    const saveBuyTransaction =
                                        () => {

                                            createTransaction(
                                                {
                                                    user_id,
                                                    investment_id,
                                                    transaction_type:
                                                        "BUY",
                                                    amount:
                                                        totalAmount,
                                                    quantity:
                                                        buyQuantity
                                                },
                                                (
                                                    transactionError,
                                                    transactionResult
                                                ) => {

                                                    if (
                                                        transactionError
                                                    ) {
                                                        console.error(
                                                            "Transaction Error:",
                                                            transactionError
                                                        );

                                                        return res.status(500).json({
                                                            success: false,
                                                            message:
                                                                "Failed to create transaction"
                                                        });
                                                    }


                                                    return res.status(201).json({
                                                        success: true,
                                                        message:
                                                            "Investment purchased successfully",

                                                        data: {
                                                            transaction_id:
                                                                transactionResult.insertId,

                                                            investment:
                                                                investment.investment_name,

                                                            quantity:
                                                                buyQuantity,

                                                            price:
                                                                price,

                                                            amount:
                                                                totalAmount,

                                                            wallet_balance:
                                                                newBalance
                                                        }
                                                    });
                                                }
                                            );
                                        };


                                    // -----------------------------
                                    // Existing Portfolio
                                    // -----------------------------

                                    if (
                                        portfolioResult.length > 0
                                    ) {

                                        const portfolio =
                                            portfolioResult[0];

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


                                        updatePortfolio(
                                            portfolio.portfolio_id,
                                            newQuantity,
                                            newInvestedAmount,
                                            (
                                                portfolioUpdateError
                                            ) => {

                                                if (
                                                    portfolioUpdateError
                                                ) {
                                                    console.error(
                                                        "Portfolio Update Error:",
                                                        portfolioUpdateError
                                                    );

                                                    return res.status(500).json({
                                                        success: false,
                                                        message:
                                                            "Failed to update portfolio"
                                                    });
                                                }


                                                saveBuyTransaction();
                                            }
                                        );

                                    }


                                    // -----------------------------
                                    // New Portfolio
                                    // -----------------------------

                                    else {

                                        createPortfolio(
                                            {
                                                user_id,
                                                investment_id,
                                                quantity:
                                                    buyQuantity,
                                                invested_amount:
                                                    totalAmount
                                            },
                                            (
                                                portfolioCreateError
                                            ) => {

                                                if (
                                                    portfolioCreateError
                                                ) {
                                                    console.error(
                                                        "Portfolio Create Error:",
                                                        portfolioCreateError
                                                    );

                                                    return res.status(500).json({
                                                        success: false,
                                                        message:
                                                            "Failed to create portfolio"
                                                    });
                                                }


                                                saveBuyTransaction();
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
};


// =====================================================
// SELL INVESTMENT
// =====================================================

const sellInvestment = (req, res) => {

    // Get logged-in user ID from JWT
    const user_id = req.user.id;

    const {
        investment_id,
        quantity
    } = req.body;


    // -----------------------------
    // Validation
    // -----------------------------

    if (!investment_id || !quantity) {
        return res.status(400).json({
            success: false,
            message:
                "Investment ID and Quantity are required"
        });
    }


    const sellQuantity =
        Number(quantity);


    if (sellQuantity <= 0) {
        return res.status(400).json({
            success: false,
            message:
                "Quantity must be greater than 0"
        });
    }


    // -----------------------------
    // Get Investment
    // -----------------------------

    getInvestment(
        investment_id,
        (investmentError, investmentResult) => {

            if (investmentError) {
                console.error(
                    "Investment Error:",
                    investmentError
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Failed to get investment"
                });
            }


            if (investmentResult.length === 0) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Investment not found"
                });
            }


            const investment =
                investmentResult[0];

            const price =
                Number(investment.current_price);

            const totalAmount =
                price * sellQuantity;


            // -----------------------------
            // Get User Portfolio
            // -----------------------------

            getPortfolioInvestment(
                user_id,
                investment_id,
                (
                    portfolioError,
                    portfolioResult
                ) => {

                    if (portfolioError) {
                        console.error(
                            "Portfolio Error:",
                            portfolioError
                        );

                        return res.status(500).json({
                            success: false,
                            message:
                                "Failed to get portfolio"
                        });
                    }


                    if (portfolioResult.length === 0) {
                        return res.status(400).json({
                            success: false,
                            message:
                                "You don't own this investment"
                        });
                    }


                    const portfolio =
                        portfolioResult[0];

                    const currentQuantity =
                        Number(
                            portfolio.quantity
                        );


                    // -----------------------------
                    // Check Quantity
                    // -----------------------------

                    if (
                        sellQuantity >
                        currentQuantity
                    ) {
                        return res.status(400).json({
                            success: false,
                            message:
                                "Insufficient investment quantity",

                            available:
                                currentQuantity,

                            requested:
                                sellQuantity
                        });
                    }


                    const remainingQuantity =
                        currentQuantity -
                        sellQuantity;


                    // -----------------------------
                    // Calculate Remaining Amount
                    // -----------------------------

                    const averagePrice =
                        Number(
                            portfolio.invested_amount
                        ) /
                        currentQuantity;


                    const remainingInvestedAmount =
                        Math.max(
                            0,
                            Number(
                                portfolio.invested_amount
                            ) -
                            (
                                averagePrice *
                                sellQuantity
                            )
                        );


                    // -----------------------------
                    // Update Portfolio
                    // -----------------------------

                    const updatePortfolioAfterSell =
                        (callback) => {

                            if (
                                remainingQuantity === 0
                            ) {

                                deletePortfolio(
                                    portfolio.portfolio_id,
                                    callback
                                );

                            } else {

                                updatePortfolio(
                                    portfolio.portfolio_id,
                                    remainingQuantity,
                                    remainingInvestedAmount,
                                    callback
                                );
                            }
                        };


                    updatePortfolioAfterSell(
                        (portfolioUpdateError) => {

                            if (portfolioUpdateError) {
                                console.error(
                                    "Portfolio Sell Error:",
                                    portfolioUpdateError
                                );

                                return res.status(500).json({
                                    success: false,
                                    message:
                                        "Failed to update portfolio"
                                });
                            }


                            // -----------------------------
                            // Get User Wallet
                            // -----------------------------

                            getWallet(
                                user_id,
                                (
                                    walletError,
                                    walletResult
                                ) => {

                                    if (walletError) {
                                        console.error(
                                            "Wallet Error:",
                                            walletError
                                        );

                                        return res.status(500).json({
                                            success: false,
                                            message:
                                                "Failed to get wallet"
                                        });
                                    }


                                    if (
                                        walletResult.length === 0
                                    ) {
                                        return res.status(404).json({
                                            success: false,
                                            message:
                                                "Wallet not found"
                                        });
                                    }


                                    const wallet =
                                        walletResult[0];

                                    const currentBalance =
                                        Number(
                                            wallet.balance
                                        );


                                    const newBalance =
                                        currentBalance +
                                        totalAmount;


                                    // -----------------------------
                                    // Update Wallet
                                    // -----------------------------

                                    updateWallet(
                                        user_id,
                                        newBalance,
                                        (
                                            walletUpdateError
                                        ) => {

                                            if (
                                                walletUpdateError
                                            ) {
                                                console.error(
                                                    "Wallet Update Error:",
                                                    walletUpdateError
                                                );

                                                return res.status(500).json({
                                                    success: false,
                                                    message:
                                                        "Failed to update wallet"
                                                });
                                            }


                                            // -----------------------------
                                            // Save SELL Transaction
                                            // -----------------------------

                                            createTransaction(
                                                {
                                                    user_id,
                                                    investment_id,
                                                    transaction_type:
                                                        "SELL",
                                                    amount:
                                                        totalAmount,
                                                    quantity:
                                                        sellQuantity
                                                },
                                                (
                                                    transactionError,
                                                    transactionResult
                                                ) => {

                                                    if (
                                                        transactionError
                                                    ) {
                                                        console.error(
                                                            "Transaction Error:",
                                                            transactionError
                                                        );

                                                        return res.status(500).json({
                                                            success: false,
                                                            message:
                                                                "Failed to create transaction"
                                                        });
                                                    }


                                                    return res.status(200).json({
                                                        success: true,
                                                        message:
                                                            "Investment sold successfully",

                                                        data: {
                                                            transaction_id:
                                                                transactionResult.insertId,

                                                            investment:
                                                                investment.investment_name,

                                                            quantity:
                                                                sellQuantity,

                                                            price:
                                                                price,

                                                            amount:
                                                                totalAmount,

                                                            wallet_balance:
                                                                newBalance,

                                                            remaining_quantity:
                                                                remainingQuantity
                                                        }
                                                    });
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
        }
    );
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {
    buyInvestment,
    sellInvestment
};