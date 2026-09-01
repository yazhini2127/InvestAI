const MarketNews = require("../models/MarketNewsModel");

// ==========================
// Get Market News
// ==========================
exports.getMarketNews = (req, res) => {
    MarketNews.getMarketNews((err, result) => {
        if (err) {
            console.error("Market News Error:", err);

            return res.status(500).json({
                success: false,
                message: err.message,
            });
        }

        res.status(200).json({
            success: true,
            news: result,
        });
    });
};