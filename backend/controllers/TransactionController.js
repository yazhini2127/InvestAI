const {
    getTransactionsByUserModel,
    getTransactionByIdModel,
    createTransactionModel,
    deleteTransactionModel,
    deleteAllTransactionsByUserModel
} = require("../models/TransactionModel");


// =====================================================
// GET TRANSACTIONS BY USER
// GET /api/transactions/user/:userId
// =====================================================

const getTransactionsByUser = (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({
            success: false,
            message: "User ID is required"
        });
    }

    getTransactionsByUserModel(
        userId,
        (err, results) => {
            if (err) {
                console.error(
                    "Get Transactions Error:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Failed to load transactions",
                    error: err.message
                });
            }

            return res.status(200).json({
                success: true,
                transactions: results
            });
        }
    );
};


// =====================================================
// GET SINGLE TRANSACTION
// GET /api/transactions/:transactionId
// =====================================================

const getTransactionById = (req, res) => {
    const { transactionId } = req.params;

    getTransactionByIdModel(
        transactionId,
        (err, results) => {
            if (err) {
                console.error(
                    "Get Transaction Error:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Failed to load transaction",
                    error: err.message
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Transaction not found"
                });
            }

            return res.status(200).json({
                success: true,
                transaction: results[0]
            });
        }
    );
};


// =====================================================
// CREATE TRANSACTION
// POST /api/transactions
// =====================================================

const createTransaction = (req, res) => {
    const {
        user_id,
        investment_id,
        transaction_type,
        amount,
        quantity
    } = req.body;

    // Validation

    if (!user_id) {
        return res.status(400).json({
            success: false,
            message: "User ID is required"
        });
    }

    if (!investment_id) {
        return res.status(400).json({
            success: false,
            message: "Investment ID is required"
        });
    }

    if (!transaction_type) {
        return res.status(400).json({
            success: false,
            message: "Transaction type is required"
        });
    }

    if (amount === undefined || amount === null) {
        return res.status(400).json({
            success: false,
            message: "Amount is required"
        });
    }

    if (quantity === undefined || quantity === null) {
        return res.status(400).json({
            success: false,
            message: "Quantity is required"
        });
    }

    const transactionData = {
        user_id,
        investment_id,
        transaction_type:
            String(transaction_type).toUpperCase(),
        amount,
        quantity
    };

    createTransactionModel(
        transactionData,
        (err, result) => {
            if (err) {
                console.error(
                    "Create Transaction Error:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Failed to create transaction",
                    error: err.message
                });
            }

            return res.status(201).json({
                success: true,
                message: "Transaction created successfully",
                transaction_id:
                    result.insertId
            });
        }
    );
};


// =====================================================
// DELETE SINGLE TRANSACTION
// DELETE /api/transactions/:transactionId
// =====================================================

const deleteTransaction = (req, res) => {
    const { transactionId } = req.params;

    deleteTransactionModel(
        transactionId,
        (err, result) => {
            if (err) {
                console.error(
                    "Delete Transaction Error:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Failed to delete transaction",
                    error: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Transaction not found"
                });
            }

            return res.status(200).json({
                success: true,
                message:
                    "Transaction deleted successfully"
            });
        }
    );
};


// =====================================================
// DELETE ALL USER TRANSACTIONS
// DELETE /api/transactions/user/:userId
// =====================================================

const deleteAllTransactionsByUser = (
    req,
    res
) => {
    const { userId } = req.params;

    deleteAllTransactionsByUserModel(
        userId,
        (err, result) => {
            if (err) {
                console.error(
                    "Clear Transactions Error:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Failed to clear transactions",
                    error: err.message
                });
            }

            return res.status(200).json({
                success: true,
                message:
                    "All transactions cleared successfully",
                deletedCount:
                    result.affectedRows
            });
        }
    );
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {
    getTransactionsByUser,
    getTransactionById,
    createTransaction,
    deleteTransaction,
    deleteAllTransactionsByUser
};