const db = require("../config/db");

// Save Chat
exports.saveChat = (userId, question, response, callback) => {
    const sql = `
        INSERT INTO ai_chat_history
        (user_id, user_question, ai_response)
        VALUES (?, ?, ?)
    `;

    db.query(
        sql,
        [userId, question, response],
        callback
    );
};

// Get Chat History
exports.getChatHistory = (userId, callback) => {
    const sql = `
        SELECT
            chat_id,
            user_id,
            user_question,
            ai_response,
            created_at
        FROM ai_chat_history
        WHERE user_id = ?
        ORDER BY chat_id DESC
    `;

    db.query(sql, [userId], callback);
};