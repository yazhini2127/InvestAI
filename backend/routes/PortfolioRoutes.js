const express = require("express");
const router = express.Router();

const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

// ========================================
// GET LOGGED-IN USER PORTFOLIO
// GET /api/portfolio
// ========================================
router.get("/", authMiddleware, (req, res) => {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }

    const sql = `
        SELECT
            p.portfolio_id,
            p.user_id,
            p.investment_id,

            i.investment_name,
            i.investment_type,
            i.current_price,
            i.risk_level,

            p.platform_id,
            pl.platform_name,

            p.quantity,
            p.invested_amount,
            p.purchase_date

        FROM portfolio p

        INNER JOIN investments i
            ON p.investment_id = i.investment_id

        LEFT JOIN platforms pl
            ON p.platform_id = pl.platform_id

        WHERE p.user_id = ?

        ORDER BY p.purchase_date DESC, p.portfolio_id DESC
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("❌ Portfolio GET Error:", err);

            return res.status(500).json({
                success: false,
                message: "Failed to load portfolio",
                error: err.message,
            });
        }

        console.log("📦 Portfolio for user:", userId);
        console.log(results);

        return res.json({
            success: true,
            data: results,
            portfolio: results,
        });
    });
});


// ========================================
// DELETE PORTFOLIO
// DELETE /api/portfolio/:id
// ========================================
router.delete("/:id", authMiddleware, (req, res) => {
    const portfolioId = req.params.id;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }

    const sql = `
        DELETE FROM portfolio
        WHERE portfolio_id = ?
        AND user_id = ?
    `;

    db.query(
        sql,
        [portfolioId, userId],
        (err, result) => {
            if (err) {
                console.error("❌ Portfolio DELETE Error:", err);

                return res.status(500).json({
                    success: false,
                    message: "Failed to delete investment",
                    error: err.message,
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Portfolio investment not found",
                });
            }

            return res.json({
                success: true,
                message: "Investment deleted successfully",
            });
        }
    );
});


module.exports = router;