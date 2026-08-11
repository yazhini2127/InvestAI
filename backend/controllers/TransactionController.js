const Transaction = require("../models/TransactionModel");

// ==========================
// Get Transactions
// ==========================
exports.getTransactions = (req, res) => {
    const { user_id } = req.params;

    Transaction.getTransactions(user_id, (err, result) => {
        if (err) {
            console.error("Transaction Error:", err);

            return res.status(500).json({
                success: false,
                message: err.message,
            });
        }

        res.status(200).json({
            success: true,
            transactions: result,
        });
    });
};