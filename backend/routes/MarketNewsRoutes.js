const express = require("express");

const router = express.Router();

const {
    getMarketNews,
} = require("../controllers/MarketNewsController");

// Get Market News
router.get("/", getMarketNews);

module.exports = router;