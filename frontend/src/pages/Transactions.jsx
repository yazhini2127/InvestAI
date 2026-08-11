import { useEffect, useState } from "react";
import api from "../services/api";

function Transactions() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const userId = 2;

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                `/transactions/${userId}`
            );

            console.log(
                "Transactions API Response:",
                response.data
            );

            if (response.data.success) {
                setTransactions(
                    response.data.transactions || []
                );
            } else {
                setError("Failed to load transactions");
            }
        } catch (err) {
            console.error("Transaction Error:", err);

            setError(
                err.response?.data?.message ||
                "Failed to load transactions"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let ignore = false;

        const loadTransactions = async () => {
            try {
                const response = await api.get(
                    `/transactions/${userId}`
                );

                if (!ignore) {
                    if (response.data.success) {
                        setTransactions(
                            response.data.transactions || []
                        );
                    } else {
                        setError("Failed to load transactions");
                    }

                    setLoading(false);
                }
            } catch (err) {
                console.error(err);

                if (!ignore) {
                    setError(
                        err.response?.data?.message ||
                        "Failed to load transactions"
                    );

                    setLoading(false);
                }
            }
        };

        loadTransactions();

        return () => {
            ignore = true;
        };
    }, []);

    return (
        <div style={styles.container}>

            {/* Header */}
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>
                        🔄 Transactions
                    </h1>

                    <p style={styles.subtitle}>
                        View your investment transaction history
                    </p>
                </div>

                <button
                    style={styles.refreshButton}
                    onClick={fetchTransactions}
                >
                    🔄 Refresh
                </button>
            </div>

            {/* Loading */}
            {loading && (
                <div style={styles.message}>
                    Loading transactions...
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
                transactions.length === 0 && (
                    <div style={styles.empty}>
                        <h2>No Transactions Yet</h2>

                        <p>
                            Your transaction history is currently empty.
                        </p>
                    </div>
                )}

            {/* Transactions */}
            {!loading &&
                !error &&
                transactions.length > 0 && (
                    <div style={styles.tableContainer}>

                        <table style={styles.table}>

                            <thead>
                                <tr>
                                    <th style={styles.th}>
                                        ID
                                    </th>

                                    <th style={styles.th}>
                                        Type
                                    </th>

                                    <th style={styles.th}>
                                        Investment
                                    </th>

                                    <th style={styles.th}>
                                        Amount
                                    </th>

                                    <th style={styles.th}>
                                        Quantity
                                    </th>

                                    <th style={styles.th}>
                                        Date
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {transactions.map((item) => (
                                    <tr key={item.transaction_id}>

                                        <td style={styles.td}>
                                            #{item.transaction_id}
                                        </td>

                                        <td style={styles.td}>
                                            <span
                                                style={{
                                                    ...styles.typeBadge,
                                                    ...(item.transaction_type ===
                                                        "BUY"
                                                        ? styles.buy
                                                        : item.transaction_type ===
                                                          "SELL"
                                                        ? styles.sell
                                                        : styles.sip),
                                                }}
                                            >
                                                {item.transaction_type}
                                            </span>
                                        </td>

                                        <td style={styles.td}>
                                            Investment #
                                            {item.investment_id}
                                        </td>

                                        <td style={styles.td}>
                                            ₹
                                            {Number(
                                                item.amount
                                            ).toLocaleString(
                                                "en-IN"
                                            )}
                                        </td>

                                        <td style={styles.td}>
                                            {item.quantity}
                                        </td>

                                        <td style={styles.td}>
                                            {new Date(
                                                item.transaction_date
                                            ).toLocaleDateString(
                                                "en-IN"
                                            )}
                                        </td>

                                    </tr>
                                ))}
                            </tbody>

                        </table>

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

    tableContainer: {
        background: "white",
        borderRadius: "14px",
        padding: "20px",
        overflowX: "auto",
        boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
    },

    table: {
        width: "100%",
        borderCollapse: "collapse",
    },

    th: {
        textAlign: "left",
        padding: "15px",
        background: "#f9fafb",
        color: "#374151",
        fontSize: "14px",
        borderBottom: "1px solid #e5e7eb",
    },

    td: {
        padding: "15px",
        color: "#374151",
        borderBottom: "1px solid #e5e7eb",
    },

    typeBadge: {
        display: "inline-block",
        padding: "5px 12px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: "bold",
    },

    buy: {
        background: "#dcfce7",
        color: "#166534",
    },

    sell: {
        background: "#fee2e2",
        color: "#991b1b",
    },

    sip: {
        background: "#dbeafe",
        color: "#1e40af",
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

export default Transactions;