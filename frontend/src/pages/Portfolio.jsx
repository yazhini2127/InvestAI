import { useEffect, useState } from "react";
import api from "../services/api";

function Portfolio() {
    const [portfolio, setPortfolio] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const userId = 2;

    // ==========================
    // Initial Load
    // ==========================
    useEffect(() => {
        let ignore = false;

        const loadPortfolio = async () => {
            try {
                const response = await api.get(`/portfolio/${userId}`);

                console.log("Portfolio API Response:", response.data);

                if (!ignore) {
                    if (response.data.success) {
                        setPortfolio(response.data.portfolio || []);
                    } else {
                        setError("Failed to load portfolio");
                    }

                    setLoading(false);
                }
            } catch (err) {
                console.error("Portfolio Error:", err);

                if (!ignore) {
                    setError(
                        err.response?.data?.message ||
                        "Failed to load portfolio"
                    );

                    setLoading(false);
                }
            }
        };

        loadPortfolio();

        return () => {
            ignore = true;
        };
    }, []);

    // ==========================
    // Refresh Portfolio
    // ==========================
    const fetchPortfolio = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(`/portfolio/${userId}`);

            console.log("Refresh Response:", response.data);

            if (response.data.success) {
                setPortfolio(response.data.portfolio || []);
            } else {
                setError("Failed to load portfolio");
            }
        } catch (err) {
            console.error("Portfolio Error:", err);

            setError(
                err.response?.data?.message ||
                "Failed to load portfolio"
            );
        } finally {
            setLoading(false);
        }
    };

    // ==========================
    // Delete Portfolio
    // ==========================
    const handleDelete = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this investment?"
        );

        if (!confirmDelete) {
            return;
        }

        try {
            const response = await api.delete(`/portfolio/${id}`);

            alert(response.data.message);

            fetchPortfolio();
        } catch (err) {
            console.error(err);

            alert(
                err.response?.data?.message ||
                "Failed to delete investment"
            );
        }
    };

    return (
        <div style={styles.container}>

            {/* Header */}
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>
                        💼 My Portfolio
                    </h1>

                    <p style={styles.subtitle}>
                        Track your investments in one place
                    </p>
                </div>

                <button
                    style={styles.refreshButton}
                    onClick={fetchPortfolio}
                >
                    🔄 Refresh
                </button>
            </div>

            {/* Loading */}
            {loading && (
                <div style={styles.message}>
                    Loading portfolio...
                </div>
            )}

            {/* Error */}
            {!loading && error && (
                <div style={styles.error}>
                    {error}
                </div>
            )}

            {/* Empty */}
            {!loading &&
                !error &&
                portfolio.length === 0 && (
                    <div style={styles.empty}>
                        <h2>No Investments Yet</h2>

                        <p>
                            Your portfolio is currently empty.
                        </p>
                    </div>
                )}

            {/* Portfolio */}
            {!loading &&
                !error &&
                portfolio.length > 0 && (
                    <div style={styles.grid}>

                        {portfolio.map((item) => (
                            <div
                                key={item.portfolio_id}
                                style={styles.card}
                            >

                                {/* Card Header */}
                                <div style={styles.cardHeader}>

                                    <div>
                                        <h2 style={styles.investmentName}>
                                            Investment #{item.investment_id}
                                        </h2>

                                        <span style={styles.badge}>
                                            Portfolio #{item.portfolio_id}
                                        </span>
                                    </div>

                                    <button
                                        style={styles.deleteButton}
                                        onClick={() =>
                                            handleDelete(
                                                item.portfolio_id
                                            )
                                        }
                                    >
                                        Delete
                                    </button>

                                </div>

                                {/* Details */}
                                <div style={styles.details}>

                                    <div style={styles.detailBox}>
                                        <span style={styles.label}>
                                            Quantity
                                        </span>

                                        <strong style={styles.value}>
                                            {item.quantity}
                                        </strong>
                                    </div>

                                    <div style={styles.detailBox}>
                                        <span style={styles.label}>
                                            Invested Amount
                                        </span>

                                        <strong style={styles.value}>
                                            ₹
                                            {Number(
                                                item.invested_amount
                                            ).toLocaleString("en-IN")}
                                        </strong>
                                    </div>

                                    <div style={styles.detailBox}>
                                        <span style={styles.label}>
                                            Purchase Date
                                        </span>

                                        <strong style={styles.value}>
                                            {new Date(
                                                item.purchase_date
                                            ).toLocaleDateString(
                                                "en-IN"
                                            )}
                                        </strong>
                                    </div>

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
            "repeat(auto-fit, minmax(350px, 1fr))",
        gap: "20px",
    },

    card: {
        background: "white",
        borderRadius: "14px",
        padding: "24px",
        boxShadow:
            "0 4px 15px rgba(0,0,0,0.08)",
    },

    cardHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "25px",
    },

    investmentName: {
        margin: 0,
        fontSize: "21px",
        color: "#111827",
    },

    badge: {
        display: "inline-block",
        marginTop: "8px",
        padding: "5px 10px",
        borderRadius: "20px",
        background: "#eef2ff",
        color: "#4f46e5",
        fontSize: "12px",
    },

    deleteButton: {
        padding: "8px 14px",
        border: "none",
        borderRadius: "7px",
        background: "#dc2626",
        color: "white",
        cursor: "pointer",
    },

    details: {
        display: "grid",
        gridTemplateColumns:
            "repeat(3, 1fr)",
        gap: "12px",
    },

    detailBox: {
        padding: "14px",
        borderRadius: "10px",
        background: "#f9fafb",
    },

    label: {
        display: "block",
        fontSize: "12px",
        color: "#6b7280",
        marginBottom: "6px",
    },

    value: {
        fontSize: "16px",
        color: "#111827",
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

export default Portfolio;