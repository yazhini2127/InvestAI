import { useEffect, useState } from "react";
import api from "../services/api";

function SIPPlans() {
    const [sipPlans, setSipPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const userId = 2;

    useEffect(() => {
        let ignore = false;

        const loadSIPPlans = async () => {
            try {
                const response = await api.get(
                    `/sip-plans/${userId}`
                );

                console.log("SIP API Response:", response.data);

                if (!ignore) {
                    if (response.data.success) {
                        setSipPlans(
                            response.data.sipPlans || []
                        );
                    } else {
                        setError("Failed to load SIP plans");
                    }

                    setLoading(false);
                }
            } catch (err) {
                console.error("SIP Error:", err);

                if (!ignore) {
                    setError(
                        err.response?.data?.message ||
                        "Failed to load SIP plans"
                    );

                    setLoading(false);
                }
            }
        };

        loadSIPPlans();

        return () => {
            ignore = true;
        };
    }, []);

    const refreshSIPPlans = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                `/sip-plans/${userId}`
            );

            if (response.data.success) {
                setSipPlans(
                    response.data.sipPlans || []
                );
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load SIP plans"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>

            {/* Header */}
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>
                        📅 SIP Plans
                    </h1>

                    <p style={styles.subtitle}>
                        Manage your systematic investment plans
                    </p>
                </div>

                <button
                    style={styles.refreshButton}
                    onClick={refreshSIPPlans}
                >
                    🔄 Refresh
                </button>
            </div>

            {/* Loading */}
            {loading && (
                <div style={styles.message}>
                    Loading SIP plans...
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
                sipPlans.length === 0 && (
                    <div style={styles.empty}>
                        <h2>No SIP Plans Yet</h2>

                        <p>
                            You don't have any SIP plans.
                        </p>
                    </div>
                )}

            {/* SIP Plans */}
            {!loading &&
                !error &&
                sipPlans.length > 0 && (
                    <div style={styles.grid}>

                        {sipPlans.map((sip) => (
                            <div
                                key={sip.sip_id}
                                style={styles.card}
                            >

                                <div style={styles.cardHeader}>
                                    <div>
                                        <h2 style={styles.planTitle}>
                                            SIP Plan #{sip.sip_id}
                                        </h2>

                                        <span
                                            style={{
                                                ...styles.badge,
                                                ...(sip.status === "Active"
                                                    ? styles.active
                                                    : sip.status === "Paused"
                                                    ? styles.paused
                                                    : styles.cancelled),
                                            }}
                                        >
                                            {sip.status}
                                        </span>
                                    </div>
                                </div>

                                <div style={styles.details}>

                                    <div style={styles.detailBox}>
                                        <span style={styles.label}>
                                            Investment
                                        </span>

                                        <strong style={styles.value}>
                                            Investment #{sip.investment_id}
                                        </strong>
                                    </div>

                                    <div style={styles.detailBox}>
                                        <span style={styles.label}>
                                            Monthly Amount
                                        </span>

                                        <strong style={styles.value}>
                                            ₹
                                            {Number(
                                                sip.monthly_amount
                                            ).toLocaleString("en-IN")}
                                        </strong>
                                    </div>

                                    <div style={styles.detailBox}>
                                        <span style={styles.label}>
                                            SIP Date
                                        </span>

                                        <strong style={styles.value}>
                                            {sip.sip_date}
                                            {sip.sip_date === 1
                                                ? "st"
                                                : sip.sip_date === 2
                                                ? "nd"
                                                : sip.sip_date === 3
                                                ? "rd"
                                                : "th"}{" "}
                                            of every month
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

    planTitle: {
        margin: 0,
        fontSize: "21px",
        color: "#111827",
    },

    badge: {
        display: "inline-block",
        marginTop: "8px",
        padding: "5px 12px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: "bold",
    },

    active: {
        background: "#dcfce7",
        color: "#166534",
    },

    paused: {
        background: "#fef3c7",
        color: "#92400e",
    },

    cancelled: {
        background: "#fee2e2",
        color: "#991b1b",
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
        fontSize: "15px",
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

export default SIPPlans;