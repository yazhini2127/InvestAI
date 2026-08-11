import { useEffect, useState } from "react";
import api from "../services/api";

function AIAdvisor() {
    const userId = 2;

    const [question, setQuestion] = useState("");
    const [riskLevel, setRiskLevel] = useState("Medium");
    const [response, setResponse] = useState("");
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const loadHistory = async () => {
        try {
            const result = await api.get(
                `/ai-advisor/history/${userId}`
            );

            if (result.data.success) {
                setHistory(result.data.history || []);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        let ignore = false;

        const fetchHistory = async () => {
            try {
                const result = await api.get(
                    `/ai-advisor/history/${userId}`
                );

                if (!ignore && result.data.success) {
                    setHistory(result.data.history || []);
                }
            } catch (err) {
                console.error(err);
            }
        };

        fetchHistory();

        return () => {
            ignore = true;
        };
    }, []);

    const askAdvisor = async () => {
        if (!question.trim()) {
            setError("Please enter your question.");
            return;
        }

        try {
            setLoading(true);
            setError("");
            setResponse("");

            const result = await api.post(
                "/ai-advisor/ask",
                {
                    user_id: userId,
                    question: question,
                    risk_level: riskLevel,
                }
            );

            if (result.data.success) {
                setResponse(result.data.response);
                setQuestion("");
                loadHistory();
            }
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to get AI response"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>

            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>
                        🤖 AI Investment Advisor
                    </h1>

                    <p style={styles.subtitle}>
                        Ask questions and learn about investing
                    </p>
                </div>
            </div>

            <div style={styles.card}>

                <label style={styles.label}>
                    Your Question
                </label>

                <textarea
                    value={question}
                    onChange={(e) =>
                        setQuestion(e.target.value)
                    }
                    placeholder="Example: How can I learn about diversified investing?"
                    style={styles.textarea}
                    rows="5"
                />

                <label style={styles.label}>
                    Risk Level
                </label>

                <select
                    value={riskLevel}
                    onChange={(e) =>
                        setRiskLevel(e.target.value)
                    }
                    style={styles.select}
                >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                </select>

                {error && (
                    <div style={styles.error}>
                        {error}
                    </div>
                )}

                <button
                    onClick={askAdvisor}
                    disabled={loading}
                    style={styles.button}
                >
                    {loading
                        ? "🤔 Thinking..."
                        : "🤖 Ask AI Advisor"}
                </button>

                {response && (
                    <div style={styles.response}>
                        <h2 style={styles.responseTitle}>
                            🤖 AI Advisor Response
                        </h2>

                        <p style={styles.responseText}>
                            {response}
                        </p>
                    </div>
                )}

            </div>

            <div style={styles.historyCard}>
                <h2 style={styles.historyTitle}>
                    💬 Previous Questions
                </h2>

                {history.length === 0 ? (
                    <p style={styles.empty}>
                        No previous questions yet.
                    </p>
                ) : (
                    history.map((item) => (
                        <div
                            key={item.chat_id}
                            style={styles.historyItem}
                        >
                            <h3>
                                ❓ {item.user_question}
                            </h3>

                            <p style={styles.historyResponse}>
                                🤖 {item.ai_response}
                            </p>

                            <small style={styles.date}>
                                {new Date(
                                    item.created_at
                                ).toLocaleString("en-IN")}
                            </small>
                        </div>
                    ))
                )}
            </div>

        </div>
    );
}

const styles = {
    container: {
        minHeight: "100vh",
        padding: "40px",
        background: "#f5f7fb",
        fontFamily: "Arial, sans-serif",
    },

    header: {
        marginBottom: "30px",
    },

    title: {
        margin: 0,
        fontSize: "32px",
        color: "#1f2937",
    },

    subtitle: {
        marginTop: "8px",
        color: "#6b7280",
    },

    card: {
        maxWidth: "850px",
        margin: "0 auto 30px",
        background: "white",
        padding: "30px",
        borderRadius: "16px",
        boxShadow:
            "0 4px 15px rgba(0,0,0,0.08)",
    },

    label: {
        display: "block",
        marginBottom: "8px",
        marginTop: "18px",
        fontWeight: "bold",
        color: "#374151",
    },

    textarea: {
        width: "100%",
        padding: "14px",
        border: "1px solid #d1d5db",
        borderRadius: "10px",
        fontSize: "15px",
        resize: "vertical",
        boxSizing: "border-box",
    },

    select: {
        width: "100%",
        padding: "12px",
        border: "1px solid #d1d5db",
        borderRadius: "10px",
        fontSize: "15px",
    },

    button: {
        marginTop: "20px",
        padding: "12px 24px",
        border: "none",
        borderRadius: "8px",
        background: "#2563eb",
        color: "white",
        cursor: "pointer",
        fontSize: "16px",
    },

    response: {
        marginTop: "25px",
        padding: "20px",
        background: "#eef2ff",
        borderRadius: "12px",
    },

    responseTitle: {
        marginTop: 0,
        color: "#3730a3",
    },

    responseText: {
        color: "#374151",
        lineHeight: "1.7",
    },

    error: {
        marginTop: "15px",
        padding: "12px",
        background: "#fee2e2",
        color: "#991b1b",
        borderRadius: "8px",
    },

    historyCard: {
        maxWidth: "850px",
        margin: "0 auto",
        background: "white",
        padding: "30px",
        borderRadius: "16px",
        boxShadow:
            "0 4px 15px rgba(0,0,0,0.08)",
    },

    historyTitle: {
        marginTop: 0,
        color: "#111827",
    },

    historyItem: {
        padding: "18px",
        marginTop: "15px",
        background: "#f9fafb",
        borderRadius: "10px",
    },

    historyResponse: {
        color: "#4b5563",
        lineHeight: "1.6",
    },

    date: {
        color: "#9ca3af",
    },

    empty: {
        color: "#6b7280",
    },
};

export default AIAdvisor;