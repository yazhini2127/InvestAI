const express = require("express");

const router = express.Router();

const {
    getTransactions,
} = require("../controllers/TransactionController");

// Get Transactions
router.get("/:user_id", getTransactions);

module.exports = router;