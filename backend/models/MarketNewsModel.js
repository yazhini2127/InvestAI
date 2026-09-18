const db = require("../config/db");

// =====================================================
// GET MARKET NEWS
// GET /api/market-news
// =====================================================

exports.getMarketNews = (callback) => {
    const sql = `
        SELECT
            news_id,
            title,
            summary,
            source,
            published_date
        FROM market_news
        ORDER BY
            published_date DESC,
            news_id DESC
        LIMIT 20
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error(
                "Market News Model Error:",
                err
            );

            return callback(err, null);
        }

        return callback(null, results || []);
    });
};