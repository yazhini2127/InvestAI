const db = require("../config/db");

// =====================================================
// SAVE AI CHAT
// =====================================================

const saveChat = (userId, question, response) => {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO ai_chat_history
            (
                user_id,
                question,
                response
            )
            VALUES (?, ?, ?)
        `;

        db.query(
            sql,
            [userId, question, response],
            (err, result) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(result);
            }
        );
    });
};

// =====================================================
// GET USER CHAT HISTORY
// =====================================================

const getChatHistory = (userId) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT
                id,
                user_id,
                question,
                response,
                created_at
            FROM ai_chat_history
            WHERE user_id = ?
            ORDER BY created_at DESC
        `;

        db.query(
            sql,
            [userId],
            (err, results) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(results);
            }
        );
    });
};

// =====================================================
// DELETE CHAT
// =====================================================

const deleteChat = (id) => {
    return new Promise((resolve, reject) => {
        const sql = `
            DELETE FROM ai_chat_history
            WHERE id = ?
        `;

        db.query(
            sql,
            [id],
            (err, result) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(result);
            }
        );
    });
};

// =====================================================
// CLEAR USER CHAT HISTORY
// =====================================================

const clearChatHistory = (userId) => {
    return new Promise((resolve, reject) => {
        const sql = `
            DELETE FROM ai_chat_history
            WHERE user_id = ?
        `;

        db.query(
            sql,
            [userId],
            (err, result) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(result);
            }
        );
    });
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
    saveChat,
    getChatHistory,
    deleteChat,
    clearChatHistory
};