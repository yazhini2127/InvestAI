const express = require("express");

const router = express.Router();

const {
    buyInvestment,
    sellInvestment
} = require("../controllers/BuySellController");

// =====================================================
// BUY INVESTMENT
// POST /api/buy-sell/buy
// =====================================================

router.post("/buy", buyInvestment);

// =====================================================
// SELL INVESTMENT
// POST /api/buy-sell/sell
// =====================================================

router.post("/sell", sellInvestment);

// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;