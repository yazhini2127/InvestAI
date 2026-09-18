const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ========================================
// GET PORTFOLIO BY USER
// ========================================
router.get("/:userId", (req, res) => {
    const userId = req.params.userId;

    const sql = `
        SELECT
            p.portfolio_id,
            p.user_id,
            p.investment_id,
            p.quantity,
            p.invested_amount,
            p.purchase_date,

            i.investment_name,
            i.investment_type,
            i.current_price,
            i.risk_level

        FROM portfolio p

        INNER JOIN investments i
            ON p.investment_id = i.investment_id

        WHERE p.user_id = ?

        ORDER BY p.purchase_date DESC
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("Portfolio GET Error:", err);

            return res.status(500).json({
                success: false,
                message: "Failed to load portfolio",
            });
        }

        res.json({
            success: true,
            portfolio: results,
        });
    });
});


// ========================================
// DELETE PORTFOLIO
// ========================================
router.delete("/:id", (req, res) => {
    const portfolioId = req.params.id;

    const sql = `
        DELETE FROM portfolio
        WHERE portfolio_id = ?
    `;

    db.query(sql, [portfolioId], (err, result) => {
        if (err) {
            console.error("Portfolio DELETE Error:", err);

            return res.status(500).json({
                success: false,
                message: "Failed to delete investment",
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Portfolio investment not found",
            });
        }

        res.json({
            success: true,
            message: "Investment deleted successfully",
        });
    });
});


module.exports = router;