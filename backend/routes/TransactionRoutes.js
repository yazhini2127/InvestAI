const express = require("express");

const router = express.Router();

const {
    getTransactionsByUser,
    getTransactionById,
    createTransaction,
    deleteTransaction,
    deleteAllTransactionsByUser
} = require("../controllers/TransactionController");


// =====================================================
// GET ALL TRANSACTIONS BY USER
// IMPORTANT: This must come BEFORE /:transactionId
// =====================================================

router.get(
    "/user/:userId",
    getTransactionsByUser
);


// =====================================================
// DELETE ALL TRANSACTIONS BY USER
// IMPORTANT: This must come BEFORE /:transactionId
// =====================================================

router.delete(
    "/user/:userId",
    deleteAllTransactionsByUser
);


// =====================================================
// CREATE TRANSACTION
// POST /api/transactions
// =====================================================

router.post(
    "/",
    createTransaction
);


// =====================================================
// GET SINGLE TRANSACTION
// GET /api/transactions/:transactionId
// =====================================================

router.get(
    "/:transactionId",
    getTransactionById
);


// =====================================================
// DELETE SINGLE TRANSACTION
// DELETE /api/transactions/:transactionId
// =====================================================

router.delete(
    "/:transactionId",
    deleteTransaction
);


module.exports = router;