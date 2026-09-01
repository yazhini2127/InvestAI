const express = require("express");

const router = express.Router();

const {
    askAdvisor,
    getChatHistory,
} = require("../controllers/AIAdvisorController");

// Ask AI Advisor
router.post("/ask", askAdvisor);

// Chat History
router.get("/history/:user_id", getChatHistory);

module.exports = router;