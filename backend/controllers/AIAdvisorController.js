const AIAdvisor = require("../models/AIAdvisorModel");

// ==========================
// Generate Educational Response
// ==========================
exports.askAdvisor = (req, res) => {
    const { user_id, question, risk_level } = req.body;

    if (!user_id || !question) {
        return res.status(400).json({
            success: false,
            message: "User ID and question are required",
        });
    }

    let response = "";

    const risk = risk_level || "Medium";

    if (risk === "Low") {
        response =
            "For a low-risk approach, you can learn about diversified options such as broad-market funds, fixed-income products, and maintaining an emergency reserve. Consider your goals, time horizon, fees, and risk before making any decision.";
    } else if (risk === "High") {
        response =
            "For a higher-risk approach, you can study equity and other market-linked investments. Higher potential returns can also mean higher losses. Diversification and understanding volatility are important.";
    } else {
        response =
            "For a medium-risk approach, you can learn about a diversified mix of investments. Consider balancing growth-oriented and relatively stable assets according to your goals and time horizon.";
    }

    response +=
        " This is educational information, not personalized financial advice.";

    AIAdvisor.saveChat(
        user_id,
        question,
        response,
        (err) => {
            if (err) {
                console.error(
                    "AI Chat Save Error:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: err.message,
                });
            }

            res.status(200).json({
                success: true,
                question,
                response,
            });
        }
    );
};

// ==========================
// Get Chat History
// ==========================
exports.getChatHistory = (req, res) => {
    const { user_id } = req.params;

    AIAdvisor.getChatHistory(
        user_id,
        (err, result) => {
            if (err) {
                console.error(
                    "AI History Error:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: err.message,
                });
            }

            res.status(200).json({
                success: true,
                history: result,
            });
        }
    );
};