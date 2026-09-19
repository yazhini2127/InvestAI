import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../services/api";
import "./Transactions.css";

function Transactions() {
    const storedUser = localStorage.getItem("user");
const user = storedUser ? JSON.parse(storedUser) : null;
const userId = user?.id;
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("ALL");
    const [dateFilter, setDateFilter] = useState("");

    // ========================================
    // LOAD TRANSACTIONS
    // ========================================
    const loadTransactions = useCallback(async () => {
        try {
            setError("");

            const response = await api.get(
                `/transactions/user/${userId}`
            );

            console.log("Transactions API:", response.data);

            if (response.data.success) {
                setTransactions(
                    response.data.transactions ||
                    response.data.data ||
                    []
                );
            } else {
                setError(
                    response.data.message ||
                    "Failed to load transactions"
                );
            }
        } catch (err) {
            console.error("Transactions Error:", err);

            setError(
                err.response?.data?.message ||
                "Failed to load transactions"
            );
        }
    }, [userId]);

    // ========================================
    // INITIAL LOAD
    // ========================================
    useEffect(() => {
        const fetchTransactions = async () => {
            setLoading(true);
            await loadTransactions();
            setLoading(false);
        };

        fetchTransactions();
    }, [loadTransactions]);

    // ========================================
    // REFRESH
    // ========================================
    const handleRefresh = async () => {
        try {
            setRefreshing(true);
            await loadTransactions();
        } finally {
            setRefreshing(false);
        }
    };

    // ========================================
    // HELPERS
    // ========================================
    const getType = (transaction) => {
        return String(
            transaction.transaction_type ||
            transaction.type ||
            ""
        ).toUpperCase();
    };

    const getAmount = (transaction) => {
        return Number(transaction.amount || 0);
    };

    const getQuantity = (transaction) => {
        return Number(transaction.quantity || 0);
    };

    const getInvestmentName = (transaction) => {
        return (
            transaction.investment_name ||
            transaction.name ||
            transaction.symbol ||
            "Unknown Investment"
        );
    };

    const getInvestmentType = (transaction) => {
        return (
            transaction.investment_type ||
            transaction.type_name ||
            transaction.symbol ||
            "Investment"
        );
    };

    const formatCurrency = (amount) => {
        return Number(amount || 0).toLocaleString("en-IN", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        });
    };

    const formatDate = (dateValue) => {
        if (!dateValue) return "-";

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "-";
        }

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const formatTime = (dateValue) => {
        if (!dateValue) return "";

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "";
        }

        return date.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // ========================================
    // SUMMARY
    // ========================================
    const totalTransactions = transactions.length;

    const totalBought = transactions
        .filter(
            (transaction) =>
                getType(transaction) === "BUY"
        )
        .reduce(
            (total, transaction) =>
                total + getAmount(transaction),
            0
        );

    const totalSold = transactions
        .filter(
            (transaction) =>
                getType(transaction) === "SELL"
        )
        .reduce(
            (total, transaction) =>
                total + getAmount(transaction),
            0
        );

    const totalSIP = transactions
        .filter(
            (transaction) =>
                getType(transaction) === "SIP"
        )
        .reduce(
            (total, transaction) =>
                total + getAmount(transaction),
            0
        );

    const netInvestment =
        totalBought + totalSIP - totalSold;

    // ========================================
    // FILTER TRANSACTIONS
    // ========================================
    const filteredTransactions = useMemo(() => {
        const searchValue = search
            .toLowerCase()
            .trim();

        return transactions.filter((transaction) => {
            const investmentName =
                getInvestmentName(transaction)
                    .toLowerCase();

            const investmentType =
                getInvestmentType(transaction)
                    .toLowerCase();

            const symbol = String(
                transaction.symbol || ""
            ).toLowerCase();

            const matchesSearch =
                !searchValue ||
                investmentName.includes(searchValue) ||
                investmentType.includes(searchValue) ||
                symbol.includes(searchValue);

            const type = getType(transaction);

            const matchesType =
                filter === "ALL" ||
                type === filter;

            let matchesDate = true;

            if (dateFilter) {
                const transactionDate = new Date(
                    transaction.transaction_date
                );

                if (
                    !Number.isNaN(
                        transactionDate.getTime()
                    )
                ) {
                    const year =
                        transactionDate.getFullYear();

                    const month = String(
                        transactionDate.getMonth() + 1
                    ).padStart(2, "0");

                    const day = String(
                        transactionDate.getDate()
                    ).padStart(2, "0");

                    matchesDate =
                        `${year}-${month}-${day}` ===
                        dateFilter;
                } else {
                    matchesDate = false;
                }
            }

            return (
                matchesSearch &&
                matchesType &&
                matchesDate
            );
        });
    }, [
        transactions,
        search,
        filter,
        dateFilter,
    ]);

    // ========================================
    // DELETE SINGLE TRANSACTION
    // ========================================
    const deleteTransaction = async (
        transactionId
    ) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this transaction?"
        );

        if (!confirmDelete) return;

        try {
            const response = await api.delete(
                `/transactions/${transactionId}`
            );

            if (response.data.success) {
                setTransactions((previous) =>
                    previous.filter(
                        (transaction) =>
                            transaction.transaction_id !==
                            transactionId
                    )
                );

                alert(
                    "✅ Transaction deleted successfully"
                );
            } else {
                alert(
                    response.data.message ||
                    "Failed to delete transaction"
                );
            }
        } catch (err) {
            console.error(
                "Delete Transaction Error:",
                err
            );

            alert(
                err.response?.data?.message ||
                "Failed to delete transaction"
            );
        }
    };

    // ========================================
    // CLEAR ALL
    // ========================================
    const clearAll = async () => {
        if (transactions.length === 0) {
            return;
        }

        const confirmClear = window.confirm(
            "Are you sure you want to clear ALL transactions?"
        );

        if (!confirmClear) return;

        try {
            const response = await api.delete(
                `/transactions/user/${userId}`
            );

            if (response.data.success) {
                setTransactions([]);

                alert(
                    "✅ All transactions cleared successfully"
                );
            } else {
                alert(
                    response.data.message ||
                    "Failed to clear transactions"
                );
            }
        } catch (err) {
            console.error(
                "Clear Transactions Error:",
                err
            );

            alert(
                err.response?.data?.message ||
                "Failed to clear transactions"
            );
        }
    };

    // ========================================
    // EXPORT CSV
    // ========================================
    const exportCSV = () => {
        if (transactions.length === 0) {
            alert("No transactions available.");
            return;
        }

        const headers = [
            "Transaction ID",
            "Investment",
            "Symbol",
            "Type",
            "Quantity",
            "Price",
            "Amount",
            "Date",
            "Time",
            "Status",
        ];

        const rows = transactions.map(
            (transaction) => {
                const type = getType(transaction);
                const quantity =
                    getQuantity(transaction);
                const amount =
                    getAmount(transaction);

                const price =
                    quantity > 0
                        ? amount / quantity
                        : Number(
                              transaction.current_price ||
                              transaction.price ||
                              0
                          );

                return [
                    transaction.transaction_id,
                    getInvestmentName(transaction),
                    transaction.symbol || "-",
                    type,
                    quantity,
                    price.toFixed(2),
                    amount.toFixed(2),
                    formatDate(
                        transaction.transaction_date
                    ),
                    formatTime(
                        transaction.transaction_date
                    ),
                    "Completed",
                ];
            }
        );

        const csvContent = [
            headers,
            ...rows,
        ]
            .map((row) =>
                row
                    .map(
                        (value) =>
                            `"${String(value).replace(
                                /"/g,
                                '""'
                            )}"`
                    )
                    .join(",")
            )
            .join("\n");

        const blob = new Blob(
            [csvContent],
            {
                type: "text/csv;charset=utf-8;",
            }
        );

        const url =
            URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href = url;

        link.download =
            "InvestAI_Transactions.csv";

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    };

    // ========================================
    // TYPE CLASS
    // ========================================
    const getTypeClass = (type) => {
        if (type === "BUY") return "buy";
        if (type === "SELL") return "sell";
        return "sip";
    };

    // ========================================
    // TYPE ICON
    // ========================================
    const getTypeIcon = (type) => {
        if (type === "BUY") return "↗";
        if (type === "SELL") return "↘";
        return "🔄";
    };

    // ========================================
    // RESET FILTERS
    // ========================================
    const resetFilters = () => {
        setSearch("");
        setDateFilter("");
        setFilter("ALL");
    };

    // ========================================
    // LOADING
    // ========================================
    if (loading) {
        return (
            <div className="transactions-page">
                <div className="empty-state">
                    <div className="empty-icon">
                        🔄
                    </div>

                    <h3>
                        Loading Transactions...
                    </h3>

                    <p>
                        Please wait while we load
                        your transaction history.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="transactions-page">

            {/* ========================================
                HEADER
            ======================================== */}
            <div className="transactions-header">

                <div>
                    <h1>
                        🔄 Transactions
                    </h1>

                    <p>
                        View and manage your
                        investment transactions
                    </p>
                </div>

                <div className="header-actions">

                    <button
                        className="export-btn"
                        onClick={exportCSV}
                        disabled={
                            transactions.length === 0
                        }
                    >
                        📥 Export CSV
                    </button>

                    <button
                        className="refresh-btn"
                        onClick={handleRefresh}
                        disabled={refreshing}
                    >
                        🔄{" "}
                        {refreshing
                            ? "Refreshing..."
                            : "Refresh"}
                    </button>

                    <button
                        className="clear-btn"
                        onClick={clearAll}
                        disabled={
                            transactions.length === 0
                        }
                    >
                        🗑️ Clear All
                    </button>

                </div>
            </div>

            {/* ========================================
                ERROR
            ======================================== */}
            {error && (
                <div className="transaction-error">

                    <span>
                        ❌ {error}
                    </span>

                    <button
                        onClick={handleRefresh}
                    >
                        Try Again
                    </button>

                </div>
            )}

            {/* ========================================
                SUMMARY CARDS
            ======================================== */}
            <div className="transaction-summary">

                <div className="summary-card">

                    <div className="summary-icon blue">
                        📊
                    </div>

                    <div>
                        <span>
                            Total Transactions
                        </span>

                        <strong>
                            {totalTransactions}
                        </strong>
                    </div>

                </div>

                <div className="summary-card">

                    <div className="summary-icon green">
                        ↗
                    </div>

                    <div>
                        <span>
                            Total Bought
                        </span>

                        <strong>
                            ₹{formatCurrency(totalBought)}
                        </strong>
                    </div>

                </div>

                <div className="summary-card">

                    <div className="summary-icon red">
                        ↘
                    </div>

                    <div>
                        <span>
                            Total Sold
                        </span>

                        <strong>
                            ₹{formatCurrency(totalSold)}
                        </strong>
                    </div>

                </div>

                <div className="summary-card">

                    <div className="summary-icon purple">
                        🔄
                    </div>

                    <div>
                        <span>
                            Total SIP
                        </span>

                        <strong>
                            ₹{formatCurrency(totalSIP)}
                        </strong>
                    </div>

                </div>

                <div className="summary-card">

                    <div className="summary-icon orange">
                        💰
                    </div>

                    <div>
                        <span>
                            Net Investment
                        </span>

                        <strong>
                            ₹{formatCurrency(netInvestment)}
                        </strong>
                    </div>

                </div>

            </div>

            {/* ========================================
                SEARCH + FILTER
            ======================================== */}
            <div className="transaction-controls">

                <div className="search-box">

                    <span>🔍</span>

                    <input
                        type="text"
                        placeholder="Search investment, symbol..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />

                </div>

                <div className="filter-buttons">

                    <button
                        className={
                            filter === "ALL"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setFilter("ALL")
                        }
                    >
                        All Transactions
                    </button>

                    <button
                        className={
                            filter === "BUY"
                                ? "active buy-filter"
                                : ""
                        }
                        onClick={() =>
                            setFilter("BUY")
                        }
                    >
                        ↗ Buy
                    </button>

                    <button
                        className={
                            filter === "SELL"
                                ? "active sell-filter"
                                : ""
                        }
                        onClick={() =>
                            setFilter("SELL")
                        }
                    >
                        ↘ Sell
                    </button>

                    <button
                        className={
                            filter === "SIP"
                                ? "active sip-filter"
                                : ""
                        }
                        onClick={() =>
                            setFilter("SIP")
                        }
                    >
                        🔄 SIP
                    </button>

                    <input
                        type="date"
                        value={dateFilter}
                        onChange={(e) =>
                            setDateFilter(
                                e.target.value
                            )
                        }
                    />

                    {(search ||
                        dateFilter ||
                        filter !== "ALL") && (
                        <button
                            className="reset-btn"
                            onClick={resetFilters}
                        >
                            Reset
                        </button>
                    )}

                </div>

            </div>

            {/* ========================================
                TRANSACTION CONTAINER
            ======================================== */}
            <div className="transaction-container">

                <div className="transaction-title">

                    <div>
                        <h2>
                            Transaction History
                        </h2>

                        <p>
                            {filteredTransactions.length}{" "}
                            transaction
                            {filteredTransactions.length !==
                            1
                                ? "s"
                                : ""}
                        </p>
                    </div>

                </div>

                {/* ========================================
                    EMPTY
                ======================================== */}
                {filteredTransactions.length === 0 ? (

                    <div className="empty-state">

                        <div className="empty-icon">
                            📭
                        </div>

                        <h3>
                            No Transactions Found
                        </h3>

                        <p>
                            {transactions.length === 0
                                ? "Your investment transactions will appear here."
                                : "Try changing your search or filter."}
                        </p>

                        {transactions.length > 0 && (
                            <button
                                className="reset-btn"
                                onClick={
                                    resetFilters
                                }
                            >
                                Reset Filters
                            </button>
                        )}

                    </div>

                ) : (

                    <div className="transaction-list">

                        {filteredTransactions.map(
                            (transaction) => {

                                const type =
                                    getType(
                                        transaction
                                    );

                                const quantity =
                                    getQuantity(
                                        transaction
                                    );

                                const amount =
                                    getAmount(
                                        transaction
                                    );

                                const price =
                                    quantity > 0
                                        ? amount /
                                          quantity
                                        : Number(
                                              transaction.current_price ||
                                              transaction.price ||
                                              0
                                          );

                                return (
                                    <div
                                        className="transaction-card"
                                        key={
                                            transaction.transaction_id
                                        }
                                    >

                                        {/* LEFT */}
                                        <div className="transaction-left">

                                            <div
                                                className={`transaction-icon ${getTypeClass(
                                                    type
                                                )}`}
                                            >
                                                {getTypeIcon(
                                                    type
                                                )}
                                            </div>

                                            <div className="transaction-info">

                                                <div className="transaction-title-row">

                                                    <h2>
                                                        {
                                                            getInvestmentName(
                                                                transaction
                                                            )
                                                        }
                                                    </h2>

                                                    <span
                                                        className={`type-badge ${getTypeClass(
                                                            type
                                                        )}`}
                                                    >
                                                        {type}
                                                    </span>

                                                </div>

                                                <span className="investment-type">
                                                    {
                                                        getInvestmentType(
                                                            transaction
                                                        )
                                                    }
                                                </span>

                                                <p>
                                                    {quantity}{" "}
                                                    shares × ₹
                                                    {formatCurrency(
                                                        price
                                                    )}
                                                </p>

                                                <small>
                                                    📅{" "}
                                                    {formatDate(
                                                        transaction.transaction_date
                                                    )}

                                                    {" • "}

                                                    {formatTime(
                                                        transaction.transaction_date
                                                    )}
                                                </small>

                                            </div>

                                        </div>

                                        {/* RIGHT */}
                                        <div className="transaction-right">

                                            <div>

                                                <strong>
                                                    ₹
                                                    {formatCurrency(
                                                        amount
                                                    )}
                                                </strong>

                                                <span className="completed">
                                                    ✓ Completed
                                                </span>

                                            </div>

                                            <button
                                                className="transaction-delete"
                                                onClick={() =>
                                                    deleteTransaction(
                                                        transaction.transaction_id
                                                    )
                                                }
                                                title="Delete transaction"
                                            >
                                                🗑️
                                            </button>

                                        </div>

                                    </div>
                                );
                            }
                        )}

                    </div>
                )}

            </div>

            {/* ========================================
                FOOTER
            ======================================== */}
            <footer className="transactions-footer">
                © 2026 InvestAI • Smart Investing with AI
            </footer>

        </div>
    );
}

export default Transactions;