const express = require("express");

const router = express.Router();

// =====================================================
// CONTROLLER
// =====================================================

const {
    getMarketNews,
    getMarketData,
} = require("../controllers/MarketNewsController");

// =====================================================
// TEST
// =====================================================

router.get("/test", (req, res) => {
    res.status(200).json({
        success: true,
        message: "📰 Market News Route is working",
    });
});

// =====================================================
// MARKET DATA
// =====================================================

// GET /api/market-news/market-data

router.get(
    "/market-data",
    getMarketData
);

// =====================================================
// MARKET NEWS
// =====================================================

// GET /api/market-news

router.get(
    "/",
    getMarketNews
);

// =====================================================
// EXPORT
// =====================================================

module.exports = router;