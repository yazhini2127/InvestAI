const { GoogleGenAI } = require("@google/genai");
const db = require("../config/db");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-3.6-flash";

let ai = null;

if (GEMINI_API_KEY) {
    ai = new GoogleGenAI({
        apiKey: GEMINI_API_KEY
    });
    console.log("✅ Gemini AI initialized");
} else {
    console.log("❌ GEMINI_API_KEY missing");
}

// =====================================================
// ASK AI ADVISOR
// POST /api/ai-advisor/advisor
// =====================================================

const askAIAdvisor = async (req, res) => {
    try {
        const {
            userId,
            question,
            language,
            riskLevel
        } = req.body;

        if (!question || !question.trim()) {
            return res.status(400).json({
                success: false,
                message:
                    language === "ta"
                        ? "தயவுசெய்து உங்கள் கேள்வியை உள்ளிடுங்கள்."
                        : "Please enter your question."
            });
        }

        if (!ai) {
            return res.status(500).json({
                success: false,
                message: "Gemini AI is not configured."
            });
        }

        const answerLanguage =
            language === "ta"
                ? "Tamil"
                : "English";

        const selectedRisk =
            riskLevel || "Medium";

        const systemInstruction = `
You are InvestAI, an AI Investment Advisor.

Help users understand:
- Investments
- SIP
- Stocks
- Mutual Funds
- Portfolio
- Investment Risk
- Personal Finance
- Long-term investing

Rules:
1. Answer the exact question.
2. Keep answers simple and beginner-friendly.
3. Answer completely in ${answerLanguage}.
4. Consider risk level: ${selectedRisk}.
5. Never guarantee profits.
6. Never promise fixed returns.
7. Never claim an investment is completely safe.
8. Never invent stock prices.
9. Never invent current market data.
10. Never invent financial news.
11. If current market data is requested but unavailable, clearly say live data is unavailable.
12. Use simple examples when useful.
13. Keep answers reasonably concise.
14. This is educational information only.

Always end with:

Disclaimer: This information is for educational purposes only.
Investments are subject to market risks.
`;

        const userPrompt = `
User Question:
${question.trim()}

Answer Language:
${answerLanguage}

Risk Level:
${selectedRisk}

Answer the question clearly and helpfully.
`;

        console.log("🔄 Sending request to Gemini...");

        const interaction = await ai.interactions.create({
            model: GEMINI_MODEL,
            input: userPrompt,
            system_instruction: systemInstruction
        });

        const answer =
            interaction?.output_text?.trim() || "";

        if (!answer) {
            return res.status(500).json({
                success: false,
                message: "Gemini returned an empty response."
            });
        }

        console.log("✅ Gemini response received");

        // =================================================
        // SAVE HISTORY
        // =================================================

        const finalUserId = userId || 2;

        const sql = `
            INSERT INTO ai_chat_history
            (
                user_id,
                user_question,
                ai_response
            )
            VALUES (?, ?, ?)
        `;

        db.query(
            sql,
            [
                finalUserId,
                question.trim(),
                answer
            ],
            (err, result) => {

                if (err) {
                    console.error(
                        "⚠️ History save error:",
                        err.message
                    );

                    return res.status(200).json({
                        success: true,
                        answer: answer,
                        response: answer,
                        historySaved: false
                    });
                }

                return res.status(200).json({
                    success: true,
                    message:
                        "AI response generated successfully.",
                    answer: answer,
                    response: answer,
                    historySaved: true,
                    chatId: result.insertId
                });
            }
        );

    } catch (error) {

        console.error(
            "❌ Gemini Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Gemini AI request failed.",
            error:
                error?.message ||
                "Unknown error"
        });
    }
};

// =====================================================
// GET CHAT HISTORY
// GET /api/ai-advisor/chat-history/:userId
// =====================================================

const getChatHistory = (req, res) => {

    const { userId } = req.params;

    const sql = `
        SELECT
            chat_id,
            user_id,
            user_question,
            ai_response,
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
                return res.status(500).json({
                    success: false,
                    message:
                        "Failed to get chat history.",
                    error: err.message
                });
            }

            return res.status(200).json({
                success: true,
                data: results || [],
                history: results || [],
                count:
                    results
                        ? results.length
                        : 0
            });
        }
    );
};

// =====================================================
// DELETE SINGLE CHAT
// DELETE /api/ai-advisor/chat-history/:id
// =====================================================

const deleteChatHistory = (req, res) => {

    const { id } = req.params;

    const sql = `
        DELETE FROM ai_chat_history
        WHERE chat_id = ?
    `;

    db.query(
        sql,
        [id],
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message:
                        "Failed to delete chat.",
                    error: err.message
                });
            }

            return res.status(200).json({
                success: true,
                message:
                    "Chat deleted successfully.",
                affectedRows:
                    result.affectedRows
            });
        }
    );
};

// =====================================================
// CLEAR CHAT HISTORY
// DELETE /api/ai-advisor/chat-history/user/:userId
// =====================================================

const clearChatHistory = (req, res) => {

    const { userId } = req.params;

    const sql = `
        DELETE FROM ai_chat_history
        WHERE user_id = ?
    `;

    db.query(
        sql,
        [userId],
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message:
                        "Failed to clear chat history.",
                    error: err.message
                });
            }

            return res.status(200).json({
                success: true,
                message:
                    "Chat history cleared successfully.",
                affectedRows:
                    result.affectedRows
            });
        }
    );
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
    askAIAdvisor,
    getChatHistory,
    deleteChatHistory,
    clearChatHistory
};