import { useCallback, useEffect, useState } from "react";
import api from "../services/api";

function Investments() {
    const [investments, setInvestments] = useState([]);
    const [portfolio, setPortfolio] = useState([]);
    const [walletBalance, setWalletBalance] = useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [editingInvestment, setEditingInvestment] = useState(null);
    const [saving, setSaving] = useState(false);

    const [tradeModal, setTradeModal] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [trading, setTrading] = useState(false);

    // ========================================
    // LOGGED-IN USER
    // ========================================

    const getLoggedUser = () => {
        try {
            const storedUser = localStorage.getItem("user");

            if (!storedUser) {
                return null;
            }

            return JSON.parse(storedUser);
        } catch (error) {
            console.error("User Session Error:", error);
            return null;
        }
    };

    const user = getLoggedUser();
    const userId = user?.id ?? user?.user_id;

    // ========================================
    // LOAD INVESTMENTS
    // ========================================

    const loadInvestments = useCallback(async () => {
        try {
            const response = await api.get("/investments");

            console.log(
                "Investment API Response:",
                response.data
            );

            if (response.data.success) {
                setInvestments(
                    Array.isArray(response.data.investments)
                        ? response.data.investments
                        : []
                );
            } else {
                setInvestments([]);
                setError(
                    response.data.message ||
                    "Failed to load investments"
                );
            }
        } catch (err) {
            console.error("Investment Error:", err);

            if (err.response?.status === 401) {
                setError(
                    "Your session has expired. Please login again."
                );
            } else {
                setError(
                    err.response?.data?.message ||
                    "Failed to load investments"
                );
            }

            setInvestments([]);
        }
    }, []);

    // ========================================
    // LOAD WALLET
    // ========================================

    const loadWallet = useCallback(async () => {
        try {
            const response = await api.get("/wallet");

            console.log(
                "Wallet API Response:",
                response.data
            );

            if (response.data.success) {
                setWalletBalance(
                    Number(
                        response.data.wallet?.balance || 0
                    )
                );
            } else {
                setWalletBalance(0);
            }
        } catch (err) {
            console.error("Wallet Error:", err);
            setWalletBalance(0);
        }
    }, []);

    // ========================================
    // LOAD PORTFOLIO
    // ========================================

    const loadPortfolio = useCallback(async () => {
        try {
            const response = await api.get("/portfolio");

            console.log(
                "Portfolio API Response:",
                response.data
            );

            if (response.data.success) {
                setPortfolio(
                    Array.isArray(response.data.portfolio)
                        ? response.data.portfolio
                        : []
                );
            } else {
                setPortfolio([]);
            }
        } catch (err) {
            console.error("Portfolio Error:", err);
            setPortfolio([]);
        }
    }, []);

    // ========================================
    // INITIAL LOAD
    // ========================================

    useEffect(() => {
        let mounted = true;

        const loadPage = async () => {
            const token = localStorage.getItem("token");

            if (!token || !userId) {
                if (mounted) {
                    setError(
                        "User session not found. Please login again."
                    );

                    setLoading(false);
                }

                return;
            }

            try {
                setLoading(true);
                setError("");

                await Promise.all([
                    loadInvestments(),
                    loadWallet(),
                    loadPortfolio(),
                ]);
            } catch (err) {
                console.error(
                    "Investments Page Load Error:",
                    err
                );
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        loadPage();

        return () => {
            mounted = false;
        };
    }, [
        userId,
        loadInvestments,
        loadWallet,
        loadPortfolio,
    ]);

    // ========================================
    // REFRESH
    // ========================================

    const refreshAll = async () => {
        const token = localStorage.getItem("token");

        if (!token || !userId) {
            setError(
                "User session not found. Please login again."
            );

            return;
        }

        try {
            setLoading(true);
            setError("");

            await Promise.all([
                loadInvestments(),
                loadWallet(),
                loadPortfolio(),
            ]);
        } catch (err) {
            console.error("Refresh Error:", err);
        } finally {
            setLoading(false);
        }
    };

    // ========================================
    // GET OWNED QUANTITY
    // ========================================

    const getOwnedQuantity = (investmentId) => {
        const item = portfolio.find(
            (p) =>
                Number(p.investment_id) ===
                Number(investmentId)
        );

        return Number(item?.quantity || 0);
    };

    // ========================================
    // OPEN BUY
    // ========================================

    const openBuy = (investment) => {
        setQuantity(1);

        setTradeModal({
            type: "BUY",
            investment,
        });
    };

    // ========================================
    // OPEN SELL
    // ========================================

    const openSell = (investment) => {
        const owned = getOwnedQuantity(
            investment.investment_id
        );

        if (owned <= 0) {
            alert(
                "❌ You don't own any shares of this investment."
            );

            return;
        }

        setQuantity(1);

        setTradeModal({
            type: "SELL",
            investment,
            ownedQuantity: owned,
        });
    };

    // ========================================
    // CLOSE TRADE MODAL
    // ========================================

    const closeTradeModal = () => {
        if (trading) return;

        setTradeModal(null);
        setQuantity(1);
    };

    // ========================================
    // INCREASE QUANTITY
    // ========================================

    const increaseQuantity = () => {
        if (!tradeModal) return;

        if (
            tradeModal.type === "SELL" &&
            quantity >= tradeModal.ownedQuantity
        ) {
            return;
        }

        setQuantity((prev) => prev + 1);
    };

    // ========================================
    // DECREASE QUANTITY
    // ========================================

    const decreaseQuantity = () => {
        if (quantity <= 1) return;

        setQuantity((prev) => prev - 1);
    };

    // ========================================
    // QUANTITY CHANGE
    // ========================================

    const handleQuantityChange = (e) => {
        let value = Number(e.target.value);

        if (!Number.isFinite(value)) {
            value = 1;
        }

        value = Math.floor(value);

        if (value < 1) {
            value = 1;
        }

        if (
            tradeModal?.type === "SELL" &&
            value > tradeModal.ownedQuantity
        ) {
            value = tradeModal.ownedQuantity;
        }

        setQuantity(value);
    };

    // ========================================
    // BUY / SELL
    // ========================================

    const handleTrade = async () => {
        if (!tradeModal) return;

        const token = localStorage.getItem("token");

        if (!token || !userId) {
            alert(
                "❌ User session not found. Please login again."
            );

            return;
        }

        const investment = tradeModal.investment;

        const price = Number(
            investment.current_price
        );

        const totalAmount = price * quantity;

        if (
            !Number.isFinite(price) ||
            price <= 0
        ) {
            alert("❌ Invalid investment price.");
            return;
        }

        // BUY BALANCE CHECK
        if (
            tradeModal.type === "BUY" &&
            totalAmount > walletBalance
        ) {
            alert(
                `❌ Insufficient wallet balance.\n\n` +
                `Required: ₹${totalAmount.toLocaleString(
                    "en-IN"
                )}\n` +
                `Available: ₹${walletBalance.toLocaleString(
                    "en-IN"
                )}`
            );

            return;
        }

        // SELL SHARE CHECK
        if (
            tradeModal.type === "SELL" &&
            quantity > tradeModal.ownedQuantity
        ) {
            alert("❌ Insufficient shares.");
            return;
        }

        const action =
            tradeModal.type === "BUY"
                ? "buy"
                : "sell";

        try {
            setTrading(true);

            const response = await api.post(
                `/buy-sell/${action}`,
                {
                    investment_id:
                        investment.investment_id,
                    quantity: Number(quantity),
                }
            );

            console.log(
                "Trade Response:",
                response.data
            );

            if (response.data.success) {
                const tradeData =
                    response.data.data || {};

                alert(
                    `✅ ${tradeModal.type} completed successfully!\n\n` +
                    `Investment: ${
                        tradeData.investment ||
                        investment.investment_name
                    }\n` +
                    `Quantity: ${
                        tradeData.quantity ||
                        quantity
                    }\n` +
                    `Amount: ₹${Number(
                        tradeData.amount ||
                        totalAmount
                    ).toLocaleString("en-IN")}\n` +
                    `Wallet Balance: ₹${Number(
                        tradeData.wallet_balance ?? 0
                    ).toLocaleString("en-IN")}`
                );

                setTradeModal(null);
                setQuantity(1);

                await Promise.all([
                    loadInvestments(),
                    loadWallet(),
                    loadPortfolio(),
                ]);
            } else {
                alert(
                    response.data.message ||
                    `${tradeModal.type} failed`
                );
            }
        } catch (err) {
            console.error(
                `${tradeModal.type} Error:`,
                err
            );

            if (
                err.response?.status === 401
            ) {
                alert(
                    "❌ Your session has expired. Please login again."
                );
            } else {
                alert(
                    err.response?.data?.message ||
                    `Failed to ${action} investment`
                );
            }
        } finally {
            setTrading(false);
        }
    };

    // ========================================
    // OPEN EDIT
    // ========================================

    const handleEdit = (investment) => {
        setEditingInvestment({
            investment_id:
                investment.investment_id,

            investment_name:
                investment.investment_name,

            investment_type:
                investment.investment_type,

            current_price:
                investment.current_price,

            risk_level:
                investment.risk_level,
        });
    };

    // ========================================
    // EDIT CHANGE
    // ========================================

    const handleEditChange = (e) => {
        const {
            name,
            value,
        } = e.target;

        setEditingInvestment((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // ========================================
    // SAVE EDIT
    // ========================================

    const handleSave = async () => {
        if (!editingInvestment) return;

        const token = localStorage.getItem("token");

        if (!token || !userId) {
            alert(
                "❌ User session not found. Please login again."
            );

            return;
        }

        if (
            !editingInvestment.investment_name ||
            !editingInvestment.investment_type ||
            !editingInvestment.current_price ||
            !editingInvestment.risk_level
        ) {
            alert("Please fill all details");
            return;
        }

        if (
            Number(
                editingInvestment.current_price
            ) <= 0
        ) {
            alert(
                "Price must be greater than 0"
            );

            return;
        }

        try {
            setSaving(true);

            const response =
                await api.put(
                    `/investments/${editingInvestment.investment_id}`,
                    {
                        investment_name:
                            editingInvestment.investment_name,

                        investment_type:
                            editingInvestment.investment_type,

                        current_price:
                            Number(
                                editingInvestment.current_price
                            ),

                        risk_level:
                            editingInvestment.risk_level,
                    }
                );

            if (response.data.success) {
                alert(
                    "✅ Investment updated successfully"
                );

                setEditingInvestment(null);

                await loadInvestments();
            } else {
                alert(
                    response.data.message ||
                    "Failed to update investment"
                );
            }
        } catch (err) {
            console.error(
                "Update Error:",
                err
            );

            if (
                err.response?.status === 401
            ) {
                alert(
                    "❌ Your session has expired. Please login again."
                );
            } else {
                alert(
                    err.response?.data?.message ||
                    "Failed to update investment"
                );
            }
        } finally {
            setSaving(false);
        }
    };

    // ========================================
    // LOADING SCREEN
    // ========================================

    if (loading) {
        return (
            <div style={styles.loadingPage}>
                <div style={styles.loadingIcon}>
                    📈
                </div>

                <h2>
                    Loading Investments...
                </h2>

                <p>
                    Please wait...
                </p>
            </div>
        );
    }

    // ========================================
    // MAIN UI
    // ========================================

    return (
        <div style={styles.page}>

            {/* HEADER */}

            <div style={styles.header}>

                <div>
                    <h1 style={styles.title}>
                        📈 Investments
                    </h1>

                    <p style={styles.subtitle}>
                        Explore and manage
                        available investments
                    </p>
                </div>

                <button
                    style={styles.refreshButton}
                    onClick={refreshAll}
                    disabled={loading}
                >
                    🔄 Refresh
                </button>

            </div>

            {/* WALLET CARD */}

            <div style={styles.walletCard}>

                <div>
                    <p style={styles.walletLabel}>
                        💰 Available Wallet Balance
                    </p>

                    <h2 style={styles.walletAmount}>
                        ₹
                        {walletBalance.toLocaleString(
                            "en-IN"
                        )}
                    </h2>
                </div>

                <div style={styles.walletIcon}>
                    💳
                </div>

            </div>

            {/* ERROR */}

            {error && (
                <div style={styles.error}>
                    ❌ {error}
                </div>
            )}

            {/* EMPTY */}

            {!error &&
                investments.length === 0 && (
                    <div style={styles.empty}>

                        <div style={styles.emptyIcon}>
                            📊
                        </div>

                        <h2>
                            No Investments Available
                        </h2>

                        <p>
                            No investment options
                            available right now.
                        </p>

                    </div>
                )}

            {/* INVESTMENT CARDS */}

            {!error &&
                investments.length > 0 && (
                    <div style={styles.grid}>

                        {investments.map(
                            (investment) => {

                                const owned =
                                    getOwnedQuantity(
                                        investment.investment_id
                                    );

                                return (
                                    <div
                                        key={
                                            investment.investment_id
                                        }
                                        style={styles.card}
                                    >

                                        <div
                                            style={
                                                styles.cardHeader
                                            }
                                        >

                                            <div>

                                                <h2
                                                    style={
                                                        styles.name
                                                    }
                                                >
                                                    {
                                                        investment.investment_name
                                                    }
                                                </h2>

                                                <p
                                                    style={
                                                        styles.type
                                                    }
                                                >
                                                    {
                                                        investment.investment_type
                                                    }
                                                </p>

                                            </div>

                                            <span
                                                style={
                                                    styles.risk
                                                }
                                            >
                                                Risk:{" "}
                                                {
                                                    investment.risk_level
                                                }
                                            </span>

                                        </div>

                                        <div
                                            style={
                                                styles.priceBox
                                            }
                                        >

                                            <span
                                                style={
                                                    styles.priceLabel
                                                }
                                            >
                                                Current Price
                                            </span>

                                            <strong
                                                style={
                                                    styles.price
                                                }
                                            >
                                                ₹
                                                {Number(
                                                    investment.current_price
                                                ).toLocaleString(
                                                    "en-IN"
                                                )}
                                            </strong>

                                        </div>

                                        {owned > 0 && (
                                            <div
                                                style={
                                                    styles.owned
                                                }
                                            >
                                                📦 You own{" "}
                                                <strong>
                                                    {owned}
                                                </strong>{" "}
                                                shares
                                            </div>
                                        )}

                                        <div
                                            style={
                                                styles.buttonRow
                                            }
                                        >

                                            <button
                                                style={
                                                    styles.editButton
                                                }
                                                onClick={() =>
                                                    handleEdit(
                                                        investment
                                                    )
                                                }
                                            >
                                                ✏️ Edit
                                            </button>

                                            <button
                                                style={
                                                    styles.buyButton
                                                }
                                                onClick={() =>
                                                    openBuy(
                                                        investment
                                                    )
                                                }
                                            >
                                                🛒 Buy
                                            </button>

                                            <button
                                                style={{
                                                    ...styles.sellButton,
                                                    opacity:
                                                        owned > 0
                                                            ? 1
                                                            : 0.5,
                                                }}
                                                disabled={
                                                    owned <= 0
                                                }
                                                onClick={() =>
                                                    openSell(
                                                        investment
                                                    )
                                                }
                                            >
                                                📤 Sell
                                            </button>

                                        </div>

                                    </div>
                                );
                            }
                        )}

                    </div>
                )}

            {/* BUY / SELL MODAL */}

            {tradeModal && (
                <div
                    style={styles.overlay}
                    onClick={closeTradeModal}
                >

                    <div
                        style={styles.tradeModal}
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div
                            style={styles.modalHeader}
                        >

                            <div>

                                <h2
                                    style={
                                        styles.modalTitle
                                    }
                                >
                                    {tradeModal.type ===
                                    "BUY"
                                        ? "🛒 Buy "
                                        : "📤 Sell "}

                                    {
                                        tradeModal
                                            .investment
                                            .investment_name
                                    }
                                </h2>

                                <p
                                    style={
                                        styles.modalSubtitle
                                    }
                                >
                                    {
                                        tradeModal
                                            .investment
                                            .investment_type
                                    }
                                </p>

                            </div>

                            <button
                                style={
                                    styles.closeButton
                                }
                                onClick={
                                    closeTradeModal
                                }
                            >
                                ✕
                            </button>

                        </div>

                        <div
                            style={
                                styles.tradePrice
                            }
                        >

                            <span>
                                Current Price
                            </span>

                            <strong>
                                ₹
                                {Number(
                                    tradeModal
                                        .investment
                                        .current_price
                                ).toLocaleString(
                                    "en-IN"
                                )}
                            </strong>

                        </div>

                        {tradeModal.type ===
                            "SELL" && (
                            <div
                                style={
                                    styles.available
                                }
                            >
                                📦 Available Shares:{" "}
                                <strong>
                                    {
                                        tradeModal.ownedQuantity
                                    }
                                </strong>
                            </div>
                        )}

                        <label
                            style={
                                styles.quantityLabel
                            }
                        >
                            Quantity
                        </label>

                        <div
                            style={
                                styles.quantityControl
                            }
                        >

                            <button
                                style={
                                    styles.quantityButton
                                }
                                onClick={
                                    decreaseQuantity
                                }
                                disabled={
                                    trading ||
                                    quantity <= 1
                                }
                            >
                                −
                            </button>

                            <input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={
                                    handleQuantityChange
                                }
                                style={
                                    styles.quantityInput
                                }
                                disabled={trading}
                            />

                            <button
                                style={
                                    styles.quantityButton
                                }
                                onClick={
                                    increaseQuantity
                                }
                                disabled={
                                    trading ||
                                    (
                                        tradeModal.type ===
                                            "SELL" &&
                                        quantity >=
                                            tradeModal.ownedQuantity
                                    )
                                }
                            >
                                +
                            </button>

                        </div>

                        <div
                            style={
                                styles.totalBox
                            }
                        >

                            <span>
                                {tradeModal.type ===
                                "BUY"
                                    ? "Total Investment"
                                    : "You'll Receive"}
                            </span>

                            <strong>
                                ₹
                                {(
                                    Number(
                                        tradeModal
                                            .investment
                                            .current_price
                                    ) *
                                    quantity
                                ).toLocaleString(
                                    "en-IN"
                                )}
                            </strong>

                        </div>

                        {tradeModal.type ===
                            "BUY" && (
                            <div
                                style={
                                    styles.balanceRow
                                }
                            >

                                <span>
                                    Wallet Balance
                                </span>

                                <strong>
                                    ₹
                                    {walletBalance.toLocaleString(
                                        "en-IN"
                                    )}
                                </strong>

                            </div>
                        )}

                        <div
                            style={
                                styles.modalButtons
                            }
                        >

                            <button
                                style={
                                    styles.cancelButton
                                }
                                onClick={
                                    closeTradeModal
                                }
                                disabled={
                                    trading
                                }
                            >
                                Cancel
                            </button>

                            <button
                                style={
                                    tradeModal.type ===
                                    "BUY"
                                        ? styles.confirmBuy
                                        : styles.confirmSell
                                }
                                onClick={
                                    handleTrade
                                }
                                disabled={
                                    trading
                                }
                            >
                                {trading
                                    ? "Processing..."
                                    : tradeModal.type ===
                                      "BUY"
                                    ? "🛒 Confirm Buy"
                                    : "📤 Confirm Sell"}
                            </button>

                        </div>

                    </div>

                </div>
            )}

            {/* EDIT MODAL */}

            {editingInvestment && (
                <div style={styles.overlay}>

                    <div style={styles.editModal}>

                        <h2 style={styles.modalTitle}>
                            ✏️ Edit Investment
                        </h2>

                        <label style={styles.label}>
                            Investment Name
                        </label>

                        <input
                            type="text"
                            name="investment_name"
                            value={
                                editingInvestment.investment_name
                            }
                            onChange={
                                handleEditChange
                            }
                            style={styles.input}
                        />

                        <label style={styles.label}>
                            Investment Type
                        </label>

                        <select
                            name="investment_type"
                            value={
                                editingInvestment.investment_type
                            }
                            onChange={
                                handleEditChange
                            }
                            style={styles.input}
                        >
                            <option value="Stock">
                                Stock
                            </option>

                            <option value="Mutual Fund">
                                Mutual Fund
                            </option>

                            <option value="ETF">
                                ETF
                            </option>

                            <option value="Gold">
                                Gold
                            </option>

                            <option value="Crypto">
                                Crypto
                            </option>
                        </select>

                        <label style={styles.label}>
                            Current Price
                        </label>

                        <input
                            type="number"
                            name="current_price"
                            value={
                                editingInvestment.current_price
                            }
                            onChange={
                                handleEditChange
                            }
                            style={styles.input}
                        />

                        <label style={styles.label}>
                            Risk Level
                        </label>

                        <select
                            name="risk_level"
                            value={
                                editingInvestment.risk_level
                            }
                            onChange={
                                handleEditChange
                            }
                            style={styles.input}
                        >
                            <option value="Low">
                                Low
                            </option>

                            <option value="Medium">
                                Medium
                            </option>

                            <option value="High">
                                High
                            </option>
                        </select>

                        <div
                            style={
                                styles.modalButtons
                            }
                        >

                            <button
                                style={
                                    styles.cancelButton
                                }
                                onClick={() =>
                                    setEditingInvestment(
                                        null
                                    )
                                }
                                disabled={saving}
                            >
                                ❌ Cancel
                            </button>

                            <button
                                style={
                                    styles.saveButton
                                }
                                onClick={handleSave}
                                disabled={saving}
                            >
                                💾{" "}
                                {saving
                                    ? "Saving..."
                                    : "Save Changes"}
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}

// ========================================
// STYLES
// ========================================

const styles = {
    page: {
        minHeight: "100vh",
        padding: "40px",
        background: "#f5f7fb",
        fontFamily: "Arial, sans-serif",
        boxSizing: "border-box",
    },

    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "25px",
    },

    title: {
        margin: 0,
        fontSize: "32px",
        color: "#111827",
    },

    subtitle: {
        margin: "8px 0 0",
        color: "#6b7280",
    },

    refreshButton: {
        border: "none",
        background: "#2563eb",
        color: "white",
        padding: "11px 20px",
        borderRadius: "9px",
        cursor: "pointer",
        fontWeight: "bold",
    },

    walletCard: {
        background:
            "linear-gradient(135deg, #2563eb, #4f46e5)",
        color: "white",
        borderRadius: "16px",
        padding: "22px 25px",
        marginBottom: "25px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow:
            "0 8px 25px rgba(37,99,235,0.2)",
    },

    walletLabel: {
        margin: 0,
        opacity: 0.9,
        fontSize: "14px",
    },

    walletAmount: {
        margin: "7px 0 0",
        fontSize: "28px",
    },

    walletIcon: {
        fontSize: "40px",
    },

    error: {
        background: "#fee2e2",
        color: "#b91c1c",
        padding: "15px",
        borderRadius: "10px",
        marginBottom: "20px",
    },

    grid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(auto-fit, minmax(320px, 1fr))",
        gap: "20px",
    },

    card: {
        background: "white",
        borderRadius: "16px",
        padding: "24px",
        border: "1px solid #e5e7eb",
        boxShadow:
            "0 5px 18px rgba(0,0,0,0.06)",
    },

    cardHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "10px",
        marginBottom: "20px",
    },

    name: {
        margin: 0,
        fontSize: "22px",
        color: "#111827",
    },

    type: {
        margin: "6px 0 0",
        color: "#6b7280",
    },

    risk: {
        background: "#eef2ff",
        color: "#4f46e5",
        padding: "6px 10px",
        borderRadius: "20px",
        fontSize: "11px",
        fontWeight: "bold",
        whiteSpace: "nowrap",
    },

    priceBox: {
        background: "#f9fafb",
        borderRadius: "11px",
        padding: "16px",
        marginBottom: "13px",
    },

    priceLabel: {
        display: "block",
        color: "#6b7280",
        fontSize: "13px",
        marginBottom: "5px",
    },

    price: {
        fontSize: "25px",
        color: "#111827",
    },

    owned: {
        background: "#ecfdf5",
        color: "#047857",
        padding: "10px",
        borderRadius: "8px",
        fontSize: "13px",
        marginBottom: "15px",
    },

    buttonRow: {
        display: "grid",
        gridTemplateColumns:
            "1fr 1fr 1fr",
        gap: "8px",
    },

    editButton: {
        border: "none",
        borderRadius: "8px",
        padding: "11px 5px",
        background: "#f59e0b",
        color: "white",
        cursor: "pointer",
        fontWeight: "bold",
    },

    buyButton: {
        border: "none",
        borderRadius: "8px",
        padding: "11px 5px",
        background: "#16a34a",
        color: "white",
        cursor: "pointer",
        fontWeight: "bold",
    },

    sellButton: {
        border: "none",
        borderRadius: "8px",
        padding: "11px 5px",
        background: "#dc2626",
        color: "white",
        cursor: "pointer",
        fontWeight: "bold",
    },

    loadingPage: {
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        color: "#6b7280",
    },

    loadingIcon: {
        fontSize: "55px",
    },

    empty: {
        background: "white",
        borderRadius: "16px",
        padding: "70px 20px",
        textAlign: "center",
    },

    emptyIcon: {
        fontSize: "55px",
    },

    overlay: {
        position: "fixed",
        inset: 0,
        background:
            "rgba(15,23,42,0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        padding: "20px",
        boxSizing: "border-box",
    },

    tradeModal: {
        width: "440px",
        maxWidth: "100%",
        background: "white",
        borderRadius: "18px",
        padding: "28px",
        boxShadow:
            "0 20px 50px rgba(0,0,0,0.25)",
        boxSizing: "border-box",
    },

    modalHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "20px",
    },

    modalTitle: {
        margin: 0,
        color: "#111827",
        fontSize: "22px",
    },

    modalSubtitle: {
        margin: "5px 0 0",
        color: "#6b7280",
    },

    closeButton: {
        border: "none",
        background: "#f3f4f6",
        width: "35px",
        height: "35px",
        borderRadius: "50%",
        cursor: "pointer",
        fontSize: "16px",
    },

    tradePrice: {
        background: "#f9fafb",
        padding: "16px",
        borderRadius: "10px",
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "12px",
    },

    available: {
        background: "#fff7ed",
        color: "#c2410c",
        padding: "11px",
        borderRadius: "8px",
        marginBottom: "18px",
        fontSize: "14px",
    },

    quantityLabel: {
        display: "block",
        fontWeight: "bold",
        color: "#374151",
        marginBottom: "8px",
    },

    quantityControl: {
        display: "grid",
        gridTemplateColumns:
            "50px 1fr 50px",
        gap: "8px",
        marginBottom: "20px",
    },

    quantityButton: {
        border: "none",
        background: "#e5e7eb",
        borderRadius: "8px",
        fontSize: "22px",
        cursor: "pointer",
    },

    quantityInput: {
        width: "100%",
        boxSizing: "border-box",
        textAlign: "center",
        padding: "12px",
        border:
            "1px solid #d1d5db",
        borderRadius: "8px",
        fontSize: "17px",
        fontWeight: "bold",
    },

    totalBox: {
        background: "#f0fdf4",
        padding: "18px",
        borderRadius: "10px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "15px",
    },

    balanceRow: {
        display: "flex",
        justifyContent: "space-between",
        padding: "10px 0",
        color: "#6b7280",
        marginBottom: "10px",
    },

    modalButtons: {
        display: "flex",
        gap: "10px",
        marginTop: "22px",
    },

    cancelButton: {
        flex: 1,
        padding: "12px",
        border: "none",
        borderRadius: "8px",
        background: "#6b7280",
        color: "white",
        cursor: "pointer",
        fontWeight: "bold",
    },

    confirmBuy: {
        flex: 1,
        padding: "12px",
        border: "none",
        borderRadius: "8px",
        background: "#16a34a",
        color: "white",
        cursor: "pointer",
        fontWeight: "bold",
    },

    confirmSell: {
        flex: 1,
        padding: "12px",
        border: "none",
        borderRadius: "8px",
        background: "#dc2626",
        color: "white",
        cursor: "pointer",
        fontWeight: "bold",
    },

    editModal: {
        width: "450px",
        maxWidth: "100%",
        background: "white",
        borderRadius: "18px",
        padding: "30px",
        boxShadow:
            "0 20px 50px rgba(0,0,0,0.25)",
        boxSizing: "border-box",
    },

    label: {
        display: "block",
        marginTop: "14px",
        marginBottom: "6px",
        fontSize: "14px",
        fontWeight: "bold",
        color: "#374151",
    },

    input: {
        width: "100%",
        boxSizing: "border-box",
        padding: "11px",
        border:
            "1px solid #d1d5db",
        borderRadius: "8px",
        fontSize: "15px",
    },

    saveButton: {
        flex: 1,
        padding: "12px",
        border: "none",
        borderRadius: "8px",
        background: "#2563eb",
        color: "white",
        cursor: "pointer",
        fontWeight: "bold",
    },
};

export default Investments;