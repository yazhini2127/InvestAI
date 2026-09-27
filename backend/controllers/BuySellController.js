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

    // Logged-in user from JWT
    const user_id = req.user.id;

    const {
        investment_id,
        platform_id,
        quantity
    } = req.body;


    // =================================================
    // VALIDATION
    // =================================================

    if (!investment_id || !platform_id || !quantity) {
        return res.status(400).json({
            success: false,
            message:
                "Investment ID, Platform ID and Quantity are required"
        });
    }


    const buyQuantity = Number(quantity);
    const platformId = Number(platform_id);
    const investmentId = Number(investment_id);


    if (!Number.isInteger(buyQuantity) || buyQuantity <= 0) {
        return res.status(400).json({
            success: false,
            message:
                "Quantity must be a positive whole number"
        });
    }


    if (!Number.isInteger(platformId) || platformId <= 0) {
        return res.status(400).json({
            success: false,
            message:
                "Valid Platform ID is required"
        });
    }


    // =================================================
    // GET INVESTMENT
    // =================================================

    getInvestment(
        investmentId,
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


            const investment = investmentResult[0];

            const price =
                Number(investment.current_price);

            const totalAmount =
                price * buyQuantity;


            // =================================================
            // GET WALLET
            // =================================================

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


                    const wallet = walletResult[0];

                    const balance =
                        Number(wallet.balance);


                    // =================================================
                    // CHECK WALLET BALANCE
                    // =================================================

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


                    // =================================================
                    // UPDATE WALLET
                    // =================================================

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


                            // =================================================
                            // CHECK PLATFORM-WISE PORTFOLIO
                            // =================================================

                            getPortfolioInvestment(
                                user_id,
                                investmentId,
                                platformId,
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


                                    // =================================================
                                    // SAVE TRANSACTION
                                    // =================================================

                                    const saveBuyTransaction =
                                        () => {

                                            createTransaction(
                                                {
                                                    user_id,
                                                    investment_id:
                                                        investmentId,
                                                    platform_id:
                                                        platformId,
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

                                                            platform_id:
                                                                platformId,

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


                                    // =================================================
                                    // EXISTING PLATFORM PORTFOLIO
                                    // =================================================

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
                                                portfolio.invested_amount || 0
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


                                    // =================================================
                                    // CREATE NEW PLATFORM PORTFOLIO
                                    // =================================================

                                    else {

                                        createPortfolio(
                                            {
                                                user_id,

                                                investment_id:
                                                    investmentId,

                                                platform_id:
                                                    platformId,

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

    // Logged-in user from JWT
    const user_id = req.user.id;

    const {
        investment_id,
        platform_id,
        quantity
    } = req.body;


    // =================================================
    // VALIDATION
    // =================================================

    if (!investment_id || !platform_id || !quantity) {
        return res.status(400).json({
            success: false,
            message:
                "Investment ID, Platform ID and Quantity are required"
        });
    }


    const investmentId =
        Number(investment_id);

    const platformId =
        Number(platform_id);

    const sellQuantity =
        Number(quantity);


    if (
        !Number.isInteger(sellQuantity) ||
        sellQuantity <= 0
    ) {
        return res.status(400).json({
            success: false,
            message:
                "Quantity must be a positive whole number"
        });
    }


    if (
        !Number.isInteger(platformId) ||
        platformId <= 0
    ) {
        return res.status(400).json({
            success: false,
            message:
                "Valid Platform ID is required"
        });
    }


    // =================================================
    // GET INVESTMENT
    // =================================================

    getInvestment(
        investmentId,
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


            // =================================================
            // GET PLATFORM-WISE PORTFOLIO
            // =================================================

            getPortfolioInvestment(
                user_id,
                investmentId,
                platformId,
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
                                "You don't own this investment on the selected platform"
                        });
                    }


                    const portfolio =
                        portfolioResult[0];


                    const currentQuantity =
                        Number(
                            portfolio.quantity
                        );


                    // =================================================
                    // CHECK QUANTITY
                    // =================================================

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


                    // =================================================
                    // CALCULATE REMAINING INVESTED AMOUNT
                    // =================================================

                    const investedAmount =
                        Number(
                            portfolio.invested_amount || 0
                        );


                    const averagePrice =
                        currentQuantity > 0
                            ? investedAmount /
                              currentQuantity
                            : 0;


                    const remainingInvestedAmount =
                        Math.max(
                            0,
                            investedAmount -
                            (
                                averagePrice *
                                sellQuantity
                            )
                        );


                    // =================================================
                    // UPDATE PORTFOLIO
                    // =================================================

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


                            // =================================================
                            // GET WALLET
                            // =================================================

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


                                    // =================================================
                                    // UPDATE WALLET
                                    // =================================================

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


                                            // =================================================
                                            // SAVE SELL TRANSACTION
                                            // =================================================

                                            createTransaction(
                                                {
                                                    user_id,

                                                    investment_id:
                                                        investmentId,

                                                    platform_id:
                                                        platformId,

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

                                                            platform_id:
                                                                platformId,

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