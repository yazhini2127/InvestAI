import { useEffect, useState } from "react";
import api from "../services/api";

function MarketNews() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadNews = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/market-news");

            if (response.data.success) {
                setNews(response.data.news || []);
            }
        } catch (err) {
            console.error("Market News Error:", err);

            setError(
                err.response?.data?.message ||
                "Failed to load market news"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let ignore = false;

        const fetchNews = async () => {
            try {
                const response = await api.get("/market-news");

                if (!ignore) {
                    if (response.data.success) {
                        setNews(response.data.news || []);
                    } else {
                        setError("Failed to load market news");
                    }

                    setLoading(false);
                }
            } catch (err) {
                console.error(err);

                if (!ignore) {
                    setError(
                        err.response?.data?.message ||
                        "Failed to load market news"
                    );

                    setLoading(false);
                }
            }
        };

        fetchNews();

        return () => {
            ignore = true;
        };
    }, []);

    return (
        <div style={styles.container}>

            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>
                        📰 Market News
                    </h1>

                    <p style={styles.subtitle}>
                        Stay updated with the latest market insights
                    </p>
                </div>

                <button
                    style={styles.refreshButton}
                    onClick={loadNews}
                >
                    🔄 Refresh
                </button>
            </div>

            {loading && (
                <div style={styles.message}>
                    Loading market news...
                </div>
            )}

            {!loading && error && (
                <div style={styles.error}>
                    {error}
                </div>
            )}

            {!loading &&
                !error &&
                news.length === 0 && (
                    <div style={styles.empty}>
                        <h2>No Market News</h2>

                        <p>
                            There are no market news articles available.
                        </p>
                    </div>
                )}

            {!loading &&
                !error &&
                news.length > 0 && (
                    <div style={styles.grid}>

                        {news.map((item) => (
                            <div
                                key={item.news_id}
                                style={styles.card}
                            >
                                <div style={styles.cardTop}>
                                    <span style={styles.source}>
                                        {item.source}
                                    </span>

                                    <span style={styles.date}>
                                        {new Date(
                                            item.published_date
                                        ).toLocaleDateString(
                                            "en-IN"
                                        )}
                                    </span>
                                </div>

                                <h2 style={styles.newsTitle}>
                                    {item.title}
                                </h2>

                                <p style={styles.summary}>
                                    {item.summary}
                                </p>

                                <div style={styles.footer}>
                                    📰 {item.source}
                                </div>
                            </div>
                        ))}

                    </div>
                )}

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
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
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

    refreshButton: {
        padding: "10px 20px",
        border: "none",
        borderRadius: "8px",
        background: "#2563eb",
        color: "white",
        cursor: "pointer",
        fontSize: "15px",
    },

    grid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(auto-fit, minmax(320px, 1fr))",
        gap: "20px",
    },

    card: {
        background: "white",
        borderRadius: "14px",
        padding: "24px",
        boxShadow:
            "0 4px 15px rgba(0,0,0,0.08)",
    },

    cardTop: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "15px",
    },

    source: {
        padding: "5px 10px",
        borderRadius: "20px",
        background: "#eef2ff",
        color: "#4f46e5",
        fontSize: "12px",
        fontWeight: "bold",
    },

    date: {
        color: "#6b7280",
        fontSize: "13px",
    },

    newsTitle: {
        margin: "15px 0 10px",
        fontSize: "20px",
        color: "#111827",
    },

    summary: {
        color: "#4b5563",
        lineHeight: "1.6",
    },

    footer: {
        marginTop: "20px",
        paddingTop: "15px",
        borderTop: "1px solid #e5e7eb",
        color: "#6b7280",
        fontSize: "13px",
    },

    message: {
        textAlign: "center",
        padding: "50px",
        color: "#6b7280",
    },

    error: {
        padding: "20px",
        background: "#fee2e2",
        color: "#b91c1c",
        borderRadius: "10px",
    },

    empty: {
        textAlign: "center",
        padding: "70px",
        background: "white",
        borderRadius: "14px",
    },
};

export default MarketNews;