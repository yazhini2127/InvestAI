import { useCallback, useMemo, useState } from "react";
import api from "../services/api";
import "./MarketNews.css";

const defaultNews = [
    {
        id: 1,
        title: "Market Update",
        description:
            "Markets continue to show mixed movement across major sectors.",
        category: "Stocks",
        date: "11/08/2026",
        source: "InvestAI News",
    },
    {
        id: 2,
        title: "Technology Sector Update",
        description:
            "Technology stocks remain an important area for investors to monitor.",
        category: "Technology",
        date: "10/08/2026",
        source: "InvestAI News",
    },
    {
        id: 3,
        title: "Investment Insights",
        description:
            "Diversification can help investors manage portfolio risk.",
        category: "Investment",
        date: "09/08/2026",
        source: "InvestAI News",
    },
];

function MarketNews() {
    const [news, setNews] = useState(defaultNews);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [selectedNews, setSelectedNews] = useState(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [speakingId, setSpeakingId] = useState(null);

    const formatDate = useCallback((date) => {
        if (!date) return "";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return date;
        }

        return parsedDate.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    }, []);

    const normalizeNews = useCallback(
        (item, index) => {
            return {
                id:
                    item.news_id ??
                    item.id ??
                    index + 1,

                title:
                    item.title ||
                    "Market Update",

                description:
                    item.summary ||
                    item.description ||
                    "Latest market information and investment insights.",

                category:
                    item.category ||
                    item.news_category ||
                    "Stocks",

                date: formatDate(
                    item.published_date ||
                        item.date
                ),

                source:
                    item.source ||
                    "InvestAI News",
            };
        },
        [formatDate]
    );

    const loadNews = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const result = await api.get(
                "/market-news"
            );

            if (result.data?.success) {
                const apiNews =
                    result.data.news || [];

                if (apiNews.length > 0) {
                    setNews(
                        apiNews.map(
                            (item, index) =>
                                normalizeNews(
                                    item,
                                    index
                                )
                        )
                    );
                } else {
                    setNews(defaultNews);
                }
            } else {
                setError(
                    result.data?.message ||
                        "Failed to load market news"
                );

                setNews(defaultNews);
            }
        } catch (err) {
            console.error(
                "Market News Error:",
                err
            );

            setError(
                err.response?.data?.message ||
                    "Unable to load market news"
            );

            setNews(defaultNews);
        } finally {
            setLoading(false);
        }
    }, [normalizeNews]);

    const refreshNews = async () => {
        await loadNews();
    };

    const filteredNews = useMemo(() => {
        return news.filter((item) => {
            const searchText = search
                .toLowerCase()
                .trim();

            const title = String(
                item.title || ""
            ).toLowerCase();

            const description = String(
                item.description || ""
            ).toLowerCase();

            const itemCategory = String(
                item.category || ""
            ).toLowerCase();

            const matchesSearch =
                !searchText ||
                title.includes(searchText) ||
                description.includes(searchText) ||
                itemCategory.includes(searchText);

            const matchesCategory =
                category === "All" ||
                item.category === category;

            return (
                matchesSearch &&
                matchesCategory
            );
        });
    }, [news, search, category]);

    // =====================================================
    // TAMIL VOICE
    // =====================================================

    const speakTamil = (item) => {
        if (
            !("speechSynthesis" in window)
        ) {
            alert(
                "Your browser does not support voice reading."
            );
            return;
        }

        window.speechSynthesis.cancel();

        const text = `
${item.title}.
${item.description}.
Category ${item.category}.
Source ${item.source}.
        `;

        const speech =
            new SpeechSynthesisUtterance(text);

        speech.lang = "ta-IN";
        speech.rate = 0.85;
        speech.pitch = 1;
        speech.volume = 1;

        speech.onstart = () => {
            setSpeakingId(item.id);
        };

        speech.onend = () => {
            setSpeakingId(null);
        };

        speech.onerror = () => {
            setSpeakingId(null);
        };

        window.speechSynthesis.speak(
            speech
        );
    };

    const stopVoice = () => {
        if (
            "speechSynthesis" in window
        ) {
            window.speechSynthesis.cancel();
        }

        setSpeakingId(null);
    };

    const speakAIInsight = () => {
        if (
            !("speechSynthesis" in window)
        ) {
            alert(
                "Your browser does not support voice reading."
            );
            return;
        }

        window.speechSynthesis.cancel();

        const text =
            "முதலீடு செய்யும் போது பல்வேறு முதலீட்டு வகைகளில் பணத்தைப் பிரித்து முதலீடு செய்யுங்கள். சந்தை நிலவரங்களை கவனித்து, நீண்ட கால நோக்கத்துடன் முதலீடு செய்வது உதவியாக இருக்கும்.";

        const speech =
            new SpeechSynthesisUtterance(text);

        speech.lang = "ta-IN";
        speech.rate = 0.85;
        speech.pitch = 1;
        speech.volume = 1;

        window.speechSynthesis.speak(
            speech
        );
    };

    return (
        <div className="market-news-page">

            {/* HEADER */}

            <div className="market-news-header">

                <div>
                    <h1>
                        📰 Market News
                    </h1>

                    <p>
                        Stay updated with the latest
                        market insights
                    </p>
                </div>

                <button
                    className="news-refresh-btn"
                    onClick={refreshNews}
                    disabled={loading}
                >
                    {loading
                        ? "⏳ Loading..."
                        : "🔄 Refresh"}
                </button>

            </div>


            {/* ERROR */}

            {error && (
                <div className="market-news-error">
                    ⚠️ {error}
                </div>
            )}


            {/* MARKET SUMMARY */}

            <div className="market-summary">

                <div className="market-summary-card">
                    <span>
                        📊 NIFTY 50
                    </span>

                    <strong>
                        24,175.65
                    </strong>

                    <small className="positive">
                        ↑ 0.35%
                    </small>
                </div>


                <div className="market-summary-card">
                    <span>
                        📈 SENSEX
                    </span>

                    <strong>
                        77,264.51
                    </strong>

                    <small className="positive">
                        ↑ 0.43%
                    </small>
                </div>


                <div className="market-summary-card">
                    <span>
                        💻 IT Sector
                    </span>

                    <strong>
                        —
                    </strong>

                    <small>
                        Market sector
                    </small>
                </div>


                <div className="market-summary-card">
                    <span>
                        🕐 Market Status
                    </span>

                    <strong className="market-open">
                        Closed
                    </strong>

                    <small>
                        NSE / BSE
                    </small>
                </div>

            </div>


            {/* SEARCH */}

            <div className="news-controls">

                <input
                    type="text"
                    placeholder="🔍 Search market news..."
                    value={search}
                    onChange={(e) =>
                        setSearch(
                            e.target.value
                        )
                    }
                />

                <select
                    value={category}
                    onChange={(e) =>
                        setCategory(
                            e.target.value
                        )
                    }
                >
                    <option value="All">
                        All Categories
                    </option>

                    <option value="Stocks">
                        Stocks
                    </option>

                    <option value="Economy">
                        Economy
                    </option>

                    <option value="Technology">
                        Technology
                    </option>

                    <option value="Investment">
                        Investment
                    </option>
                </select>

            </div>


            {/* SECTION TITLE */}

            <div className="news-section-title">

                <div>
                    <h2>
                        Latest Market Updates
                    </h2>

                    <p>
                        {filteredNews.length}{" "}
                        news articles
                    </p>
                </div>

                <span className="live-badge">
                    🔴 MARKET NEWS
                </span>

            </div>


            {/* NEWS LIST */}

            <div className="news-list">

                {loading ? (

                    <div className="no-news">

                        <div>
                            ⏳
                        </div>

                        <h2>
                            Loading Market News...
                        </h2>

                        <p>
                            Please wait while we fetch
                            the latest updates.
                        </p>

                    </div>

                ) : filteredNews.length === 0 ? (

                    <div className="no-news">

                        <div>
                            🔍
                        </div>

                        <h2>
                            No News Found
                        </h2>

                        <p>
                            Try another search or category.
                        </p>

                    </div>

                ) : (

                    filteredNews.map(
                        (item) => (

                            <div
                                className="news-card"
                                key={item.id}
                            >

                                <div className="news-icon">
                                    📰
                                </div>


                                <div className="news-content">

                                    <div className="news-meta">

                                        <span className="news-source">
                                            {item.source}
                                        </span>

                                        <span>
                                            {item.date}
                                        </span>

                                    </div>


                                    <h2>
                                        {item.title}
                                    </h2>


                                    <span className="category-badge">
                                        {item.category}
                                    </span>


                                    <p>
                                        {item.description}
                                    </p>


                                    <div className="news-actions">

                                        <button
                                            className="read-more-btn"
                                            onClick={() =>
                                                setSelectedNews(
                                                    item
                                                )
                                            }
                                        >
                                            Read More →
                                        </button>


                                        <button
                                            className="voice-btn"
                                            onClick={() => {
                                                if (
                                                    speakingId ===
                                                    item.id
                                                ) {
                                                    stopVoice();
                                                } else {
                                                    speakTamil(
                                                        item
                                                    );
                                                }
                                            }}
                                        >
                                            {speakingId ===
                                            item.id
                                                ? "⏹️ Stop"
                                                : "🔊 தமிழ் கேட்க"}
                                        </button>

                                    </div>

                                </div>

                            </div>

                        )
                    )

                )}

            </div>


            {/* AI INSIGHT */}

            <div className="ai-news-insight">

                <div className="ai-news-icon">
                    🤖
                </div>

                <div>

                    <h2>
                        InvestAI AI Insight
                    </h2>

                    <p>
                        Stay diversified and monitor
                        market trends before making
                        investment decisions.
                        Long-term investing can help
                        reduce the impact of short-term
                        market volatility.
                    </p>

                    <button
                        className="voice-insight-btn"
                        onClick={
                            speakAIInsight
                        }
                    >
                        🔊 தமிழ் AI Insight கேட்க
                    </button>

                </div>

            </div>


            {/* MODAL */}

            {selectedNews && (

                <div
                    className="news-modal-overlay"
                    onClick={() =>
                        setSelectedNews(null)
                    }
                >

                    <div
                        className="news-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <button
                            className="modal-close"
                            onClick={() =>
                                setSelectedNews(null)
                            }
                        >
                            ✕
                        </button>


                        <span className="category-badge">
                            {selectedNews.category}
                        </span>


                        <h2>
                            {selectedNews.title}
                        </h2>


                        <div className="modal-source">
                            📰{" "}
                            {selectedNews.source}
                            {" • "}
                            {selectedNews.date}
                        </div>


                        <p>
                            {selectedNews.description}
                        </p>


                        <button
                            className="voice-btn modal-voice-btn"
                            onClick={() =>
                                speakTamil(
                                    selectedNews
                                )
                            }
                        >
                            🔊 தமிழ் கேட்க
                        </button>


                        <p>
                            This market update is
                            provided for informational
                            purposes. Always do your own
                            research before making
                            investment decisions.
                        </p>

                    </div>

                </div>

            )}


            {/* FOOTER */}

            <footer className="market-news-footer">
                © 2026 InvestAI • Smart Investing with AI
            </footer>

        </div>
    );
}

export default MarketNews;