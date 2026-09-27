const WalletModel = require("../models/WalletModel");

// Get current user's wallet
const getWallet = (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        WalletModel.getWalletByUserId(userId, (error, results) => {
            if (error) {
                console.error("❌ Wallet Controller Error:", error);

                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch wallet",
                    error: error.message,
                });
            }

            if (!results || results.length === 0) {
                return res.status(200).json({
                    success: true,
                    data: {
                        wallet_id: null,
                        user_id: userId,
                        balance: 0,
                    },
                });
            }

            return res.status(200).json({
                success: true,
                data: results[0],
            });
        });
    } catch (error) {
        console.error("❌ Wallet Controller Exception:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

module.exports = {
    getWallet,
};