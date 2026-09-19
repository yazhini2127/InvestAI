const express = require("express");
const router = express.Router();

const {
  buyInvestment,
  sellInvestment
} = require("../controllers/BuySellController");

const authMiddleware = require("../middleware/authMiddleware");

// =====================================================
// BUY INVESTMENT
// POST /api/buy-sell/buy
// =====================================================
router.post("/buy", authMiddleware, buyInvestment);

// =====================================================
// SELL INVESTMENT
// POST /api/buy-sell/sell
// =====================================================
router.post("/sell", authMiddleware, sellInvestment);

// =====================================================
// EXPORT ROUTER
// =====================================================
module.exports = router;