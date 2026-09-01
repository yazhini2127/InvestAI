const db = require("../config/db");

// ==========================
// Get Market News
// ==========================
exports.getMarketNews = (callback) => {
    const sql = `
        SELECT
            news_id,
            title,
            summary,
            source,
            published_date
        FROM market_news
        ORDER BY published_date DESC, news_id DESC
    `;

    db.query(sql, callback);
};