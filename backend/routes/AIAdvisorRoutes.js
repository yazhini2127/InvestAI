const express = require("express");

const router = express.Router();

const {
    askAIAdvisor,
    getChatHistory,
    deleteChatHistory,
    clearChatHistory
} = require("../controllers/AIAdvisorController");

// Ask AI Advisor
router.post("/advisor", askAIAdvisor);

// Get user's chat history
router.get("/chat-history/:userId", getChatHistory);

// Delete one conversation
router.delete("/chat-history/:id", deleteChatHistory);

// Clear all conversations for user
router.delete("/chat-history/user/:userId", clearChatHistory);

module.exports = router;