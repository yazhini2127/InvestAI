import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
} from "recharts";

import "./Dashboard.css";

const API_URL = "https://investai-tww5.onrender.com/api";
function Dashboard() {

    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const [wallet, setWallet] = useState(null);
    const [portfolio, setPortfolio] = useState([]);
    const [sipPlans, setSipPlans] = useState([]);
    const [transactions, setTransactions] = useState([]);

    // =====================================================
    // USER ID
    // =====================================================

    const getUserId = useCallback(() => {

        const storedUser =
            localStorage.getItem("user") ||
            localStorage.getItem("userData");

        if (storedUser) {

            try {

                const user = JSON.parse(storedUser);

                return (
                    user.user_id ||
                    user.userId ||
                    user.id ||
                    1
                );

            } catch {

                return 1;

            }

        }

        return (
            localStorage.getItem("userId") ||
            localStorage.getItem("user_id") ||
            1
        );

    }, []);

    // =====================================================
    // LOAD DASHBOARD
    // =====================================================

    const loadDashboard = useCallback(async () => {

        try {

            setError("");

            const userId = getUserId();

            const results = await Promise.allSettled([

                fetch(`${API_URL}/wallet/${userId}`),

                fetch(`${API_URL}/portfolio/${userId}`),

                fetch(`${API_URL}/sip-plans/${userId}`),

                fetch(`${API_URL}/transactions/user/${userId}`),

            ]);

            // =================================================
            // WALLET
            // =================================================

            if (
                results[0].status === "fulfilled" &&
                results[0].value.ok
            ) {

                const data =
                    await results[0].value.json();

                if (data.success) {

                    setWallet(
                        data.wallet ||
                        data.data ||
                        null
                    );

                }

            }

            // =================================================
            // PORTFOLIO
            // =================================================

            if (
                results[1].status === "fulfilled" &&
                results[1].value.ok
            ) {

                const data =
                    await results[1].value.json();

                if (data.success) {

                    setPortfolio(
                        data.portfolio ||
                        data.data ||
                        []
                    );

                }

            }

            // =================================================
            // SIP
            // =================================================

            if (
                results[2].status === "fulfilled" &&
                results[2].value.ok
            ) {

                const data =
                    await results[2].value.json();

                if (data.success) {

                    setSipPlans(
                        data.sipPlans ||
                        data.sip_plans ||
                        data.plans ||
                        data.data ||
                        []
                    );

                }

            }

            // =================================================
            // TRANSACTIONS
            // =================================================

            if (
                results[3].status === "fulfilled" &&
                results[3].value.ok
            ) {

                const data =
                    await results[3].value.json();

                if (data.success) {

                    setTransactions(
                        data.transactions ||
                        data.data ||
                        []
                    );

                }

            }

        } catch (err) {

            console.error(
                "Dashboard Error:",
                err
            );

            setError(
                "Unable to connect to InvestAI backend."
            );

        } finally {

            setLoading(false);
            setRefreshing(false);

        }

    }, [getUserId]);

    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        let mounted = true;

        const startLoading = async () => {

            if (!mounted) return;

            await loadDashboard();

        };

        startLoading();

        return () => {

            mounted = false;

        };

    }, [loadDashboard]);

    // =====================================================
    // REFRESH
    // =====================================================

    const handleRefresh = async () => {

        setRefreshing(true);

        await loadDashboard();

    };

    // =====================================================
    // TOTAL INVESTED
    // =====================================================

    const totalInvested = useMemo(() => {

        return portfolio.reduce(
            (total, item) =>
                total +
                Number(
                    item.invested_amount || 0
                ),
            0
        );

    }, [portfolio]);

    // =====================================================
    // CURRENT VALUE
    // =====================================================

    const currentPortfolioValue = useMemo(() => {

        return portfolio.reduce(
            (total, item) => {

                const quantity =
                    Number(
                        item.quantity || 0
                    );

                const price =
                    Number(
                        item.current_price || 0
                    );

                return (
                    total +
                    quantity * price
                );

            },
            0
        );

    }, [portfolio]);

    // =====================================================
    // PROFIT
    // =====================================================

    const profit =
        currentPortfolioValue -
        totalInvested;

    const profitPercentage =
        totalInvested > 0
            ? (profit / totalInvested) * 100
            : 0;

    // =====================================================
    // INVESTMENT DISTRIBUTION
    // =====================================================

    const investmentData = useMemo(() => {

        const grouped = {};

        portfolio.forEach((item) => {

            const type =
                item.investment_type ||
                "Other";

            const amount =
                Number(
                    item.invested_amount || 0
                );

            grouped[type] =
                (grouped[type] || 0) +
                amount;

        });

        return Object.entries(grouped).map(
            ([name, amount]) => ({
                name,
                amount:
                    Number(
                        amount.toFixed(2)
                    ),
            })
        );

    }, [portfolio]);

    // =====================================================
    // ALLOCATION
    // =====================================================

    const allocationData = useMemo(() => {

        const grouped = {};

        portfolio.forEach((item) => {

            const type =
                item.investment_type ||
                "Other";

            const amount =
                Number(
                    item.invested_amount || 0
                );

            grouped[type] =
                (grouped[type] || 0) +
                amount;

        });

        const total =
            Object.values(grouped).reduce(
                (sum, value) =>
                    sum + value,
                0
            );

        return Object.entries(grouped).map(
            ([name, value]) => ({
                name,
                value:
                    total > 0
                        ? Number(
                            (
                                (value / total) *
                                100
                            ).toFixed(1)
                        )
                        : 0,
            })
        );

    }, [portfolio]);

    // =====================================================
    // HISTORY
    // =====================================================

    const growthData = useMemo(() => {

        const grouped = {};

        portfolio.forEach((item) => {

            const date =
                item.purchase_date
                    ? new Date(
                        item.purchase_date
                    )
                    : new Date();

            const key =
                date.toLocaleString(
                    "en-IN",
                    {
                        month: "short",
                    }
                );

            const amount =
                Number(
                    item.invested_amount || 0
                );

            grouped[key] =
                (grouped[key] || 0) +
                amount;

        });

        return Object.entries(grouped).map(
            ([month, value]) => ({
                month,
                value:
                    Number(
                        value.toFixed(2)
                    ),
            })
        );

    }, [portfolio]);

    // =====================================================
    // FORMAT
    // =====================================================

    const formatCurrency = (value) => {

        return Number(
            value || 0
        ).toLocaleString(
            "en-IN",
            {
                maximumFractionDigits: 2,
            }
        );

    };

    const formatDate = (value) => {

        if (!value) return "-";

        const date =
            new Date(value);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "-";
        }

        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );

    };

    // =====================================================
    // PLATFORM
    // =====================================================

    const platformData = [

        {
            name: "Groww",
            score: 92,
        },

        {
            name: "Zerodha",
            score: 89,
        },

        {
            name: "Upstox",
            score: 84,
        },

        {
            name: "Angel One",
            score: 81,
        },

        {
            name: "Paytm Money",
            score: 76,
        },

    ];

    const COLORS = [
        "#2563eb",
        "#7c3aed",
        "#10b981",
        "#f59e0b",
        "#ef4444",
    ];

    // =====================================================
    // RECENT TRANSACTIONS
    // =====================================================

    const recentTransactions =
        useMemo(() => {

            return [...transactions]
                .sort(
                    (a, b) =>
                        new Date(
                            b.transaction_date
                        ) -
                        new Date(
                            a.transaction_date
                        )
                )
                .slice(0, 5);

        }, [transactions]);

    // =====================================================
    // MENU
    // =====================================================

    const menuItems = [

        ["🏠", "Dashboard", "/dashboard"],

        ["📈", "Investments", "/investments"],

        ["💼", "Portfolio", "/portfolio"],

        ["💰", "Wallet", "/wallet"],

        ["↗", "Buy & Sell", "/buy-sell"],

        ["🔄", "Transactions", "/transactions"],

        ["📅", "SIP Plans", "/sip-plans"],

        ["🤖", "AI Advisor", "/ai-advisor"],

        ["📰", "Market News", "/market-news"],

        ["👤", "Profile", "/profile"],

        ["⚙️", "Settings", "/settings"],

    ];

    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="dashboard-loading">

                <div className="loading-logo">
                    📈
                </div>

                <h2>
                    InvestAI
                </h2>

                <p>
                    Preparing your smart dashboard...
                </p>

                <div className="loading-bar">
                    <div />
                </div>

            </div>

        );

    }

    // =====================================================
    // UI
    // =====================================================

    return (

        <div className="dashboard-page">

            {/* ============================================
                SIDEBAR
            ============================================ */}

            <aside className="dashboard-sidebar">

                <div className="sidebar-logo">

                    <div className="logo-icon">
                        📈
                    </div>

                    <div>

                        <h1>
                            <span>
                                Invest
                            </span>
                            AI
                        </h1>

                        <p>
                            Smart Investment Platform
                        </p>

                    </div>

                </div>

                <div className="sidebar-section">
                    MAIN MENU
                </div>

                <nav className="sidebar-menu">

                    {menuItems.map(
                        ([icon, name, path]) => (

                            <button
                                key={path}
                                onClick={() =>
                                    navigate(path)
                                }
                                className={
                                    path === "/dashboard"
                                        ? "sidebar-item active"
                                        : "sidebar-item"
                                }
                            >

                                <span className="menu-icon">
                                    {icon}
                                </span>

                                <span>
                                    {name}
                                </span>

                            </button>

                        )
                    )}

                </nav>

                <div className="sidebar-bottom">

                    <button
                        className="sidebar-item logout"
                        onClick={() => {

                            const confirmLogout =
                                window.confirm(
                                    "Are you sure you want to logout?"
                                );

                            if (
                                confirmLogout
                            ) {

                                localStorage.removeItem(
                                    "user"
                                );

                                localStorage.removeItem(
                                    "userData"
                                );

                                localStorage.removeItem(
                                    "userId"
                                );

                                navigate("/");

                            }

                        }}
                    >

                        <span className="menu-icon">
                            🚪
                        </span>

                        Logout

                    </button>

                </div>

            </aside>

            {/* ============================================
                MAIN CONTENT
            ============================================ */}

            <main className="dashboard-main">

                {/* HEADER */}

                <header className="dashboard-header">

                    <div>

                        <span className="dashboard-label">
                            INVESTAI DASHBOARD
                        </span>

                        <h2>
                            Welcome back! 👋
                        </h2>

                        <p>
                            Track, manage and grow your
                            investments smarter.
                        </p>

                    </div>

                    <div className="header-actions">

                        <button
                            className="refresh-button"
                            onClick={
                                handleRefresh
                            }
                            disabled={
                                refreshing
                            }
                        >
                            🔄{" "}
                            {refreshing
                                ? "Refreshing..."
                                : "Refresh"}
                        </button>

                        <button
                            className="ai-header-button"
                            onClick={() =>
                                navigate(
                                    "/ai-advisor"
                                )
                            }
                        >
                            🤖 Ask AI
                        </button>

                    </div>

                </header>

                {/* ERROR */}

                {error && (

                    <div className="dashboard-error">

                        ⚠️ {error}

                        <button
                            onClick={
                                handleRefresh
                            }
                        >
                            Try Again
                        </button>

                    </div>

                )}

                {/* ==========================================
                    HERO
                ========================================== */}

                <section className="dashboard-hero">

                    <div className="hero-content">

                        <span>
                            YOUR INVESTMENT JOURNEY
                        </span>

                        <h1>
                            Build wealth.
                            <br />
                            Invest smarter. 🚀
                        </h1>

                        <p>
                            InvestAI helps you monitor your
                            portfolio, discover opportunities
                            and make smarter investment decisions.
                        </p>

                        <div className="hero-buttons">

                            <button
                                onClick={() =>
                                    navigate(
                                        "/buy-sell"
                                    )
                                }
                                className="hero-primary"
                            >
                                📈 Start Investing
                            </button>

                            <button
                                onClick={() =>
                                    navigate(
                                        "/portfolio"
                                    )
                                }
                                className="hero-secondary"
                            >
                                💼 View Portfolio
                            </button>

                        </div>

                    </div>

                    <div className="hero-visual">

                        <div className="hero-circle">

                            <span>
                                ₹
                            </span>

                            <strong>
                                {formatCurrency(
                                    currentPortfolioValue
                                )}
                            </strong>

                            <small>
                                Portfolio Value
                            </small>

                        </div>

                    </div>

                </section>

                {/* ==========================================
                    SUMMARY
                ========================================== */}

                <section className="summary-grid">

                    {/* WALLET */}

                    <div className="summary-card wallet-card">

                        <div className="summary-top">

                            <div>

                                <span>
                                    Wallet Balance
                                </span>

                                <h3>
                                    ₹
                                    {formatCurrency(
                                        wallet?.balance
                                    )}
                                </h3>

                            </div>

                            <div className="summary-icon green">
                                💰
                            </div>

                        </div>

                        <button
                            onClick={() =>
                                navigate(
                                    "/wallet"
                                )
                            }
                        >
                            Manage Wallet →
                        </button>

                    </div>

                    {/* PORTFOLIO */}

                    <div className="summary-card portfolio-card">

                        <div className="summary-top">

                            <div>

                                <span>
                                    Portfolio Value
                                </span>

                                <h3>
                                    ₹
                                    {formatCurrency(
                                        currentPortfolioValue
                                    )}
                                </h3>

                            </div>

                            <div className="summary-icon blue">
                                📊
                            </div>

                        </div>

                        <p
                            className={
                                profit >= 0
                                    ? "positive"
                                    : "negative"
                            }
                        >
                            {profit >= 0
                                ? "↑"
                                : "↓"}{" "}
                            {Math.abs(
                                profitPercentage
                            ).toFixed(2)}
                            % overall
                        </p>

                    </div>

                    {/* SIP */}

                    <div className="summary-card sip-card">

                        <div className="summary-top">

                            <div>

                                <span>
                                    Active SIPs
                                </span>

                                <h3>
                                    {sipPlans.length}
                                </h3>

                            </div>

                            <div className="summary-icon purple">
                                🔄
                            </div>

                        </div>

                        <button
                            onClick={() =>
                                navigate(
                                    "/sip-plans"
                                )
                            }
                        >
                            Manage SIP →
                        </button>

                    </div>

                    {/* AI */}

                    <div className="summary-card ai-score-card">

                        <div className="summary-top">

                            <div>

                                <span>
                                    AI Investment Score
                                </span>

                                <h3>
                                    92%
                                </h3>

                            </div>

                            <div className="summary-icon yellow">
                                ⭐
                            </div>

                        </div>

                        <p className="positive">
                            Excellent health
                        </p>

                    </div>

                </section>

                {/* ==========================================
                    QUICK ACTIONS
                ========================================== */}

                <section className="quick-section">

                    <div className="section-heading">

                        <div>

                            <span>
                                QUICK ACTIONS
                            </span>

                            <h2>
                                What would you like to do?
                            </h2>

                        </div>

                    </div>

                    <div className="quick-grid">

                        <button
                            className="quick-card buy"
                            onClick={() =>
                                navigate(
                                    "/buy-sell"
                                )
                            }
                        >

                            <span className="quick-icon">
                                ↗
                            </span>

                            <div>

                                <h3>
                                    Buy Investment
                                </h3>

                                <p>
                                    Purchase stocks and
                                    investments
                                </p>

                            </div>

                            <strong>
                                →
                            </strong>

                        </button>

                        <button
                            className="quick-card sell"
                            onClick={() =>
                                navigate(
                                    "/buy-sell"
                                )
                            }
                        >

                            <span className="quick-icon">
                                ↘
                            </span>

                            <div>

                                <h3>
                                    Sell Investment
                                </h3>

                                <p>
                                    Sell your holdings
                                </p>

                            </div>

                            <strong>
                                →
                            </strong>

                        </button>

                        <button
                            className="quick-card sip"
                            onClick={() =>
                                navigate(
                                    "/sip-plans"
                                )
                            }
                        >

                            <span className="quick-icon">
                                🔄
                            </span>

                            <div>

                                <h3>
                                    Start SIP
                                </h3>

                                <p>
                                    Build wealth regularly
                                </p>

                            </div>

                            <strong>
                                →
                            </strong>

                        </button>

                        <button
                            className="quick-card ai"
                            onClick={() =>
                                navigate(
                                    "/ai-advisor"
                                )
                            }
                        >

                            <span className="quick-icon">
                                🤖
                            </span>

                            <div>

                                <h3>
                                    Ask AI Advisor
                                </h3>

                                <p>
                                    Get personalized insights
                                </p>

                            </div>

                            <strong>
                                →
                            </strong>

                        </button>

                    </div>

                </section>

                {/* ==========================================
                    CHARTS
                ========================================== */}

                <section className="chart-grid">

                    {/* DISTRIBUTION */}

                    <div className="dashboard-panel">

                        <div className="panel-heading">

                            <div>

                                <span>
                                    PORTFOLIO
                                </span>

                                <h2>
                                    Investment Distribution
                                </h2>

                            </div>

                            <button
                                onClick={() =>
                                    navigate(
                                        "/portfolio"
                                    )
                                }
                            >
                                View All →
                            </button>

                        </div>

                        {investmentData.length > 0 ? (

                            <ResponsiveContainer
                                width="100%"
                                height={300}
                            >

                                <BarChart
                                    data={
                                        investmentData
                                    }
                                >

                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                    />

                                    <XAxis
                                        dataKey="name"
                                    />

                                    <YAxis />

                                    <Tooltip />

                                    <Legend />

                                    <Bar
                                        dataKey="amount"
                                        name="Invested"
                                        fill="#6366f1"
                                        radius={[
                                            8,
                                            8,
                                            0,
                                            0,
                                        ]}
                                    />

                                </BarChart>

                            </ResponsiveContainer>

                        ) : (

                            <div className="chart-empty">
                                📊
                                <p>
                                    No investment data yet
                                </p>
                            </div>

                        )}

                    </div>

                    {/* HISTORY */}

                    <div className="dashboard-panel">

                        <div className="panel-heading">

                            <div>

                                <span>
                                    PERFORMANCE
                                </span>

                                <h2>
                                    Investment History
                                </h2>

                            </div>

                        </div>

                        {growthData.length > 0 ? (

                            <ResponsiveContainer
                                width="100%"
                                height={300}
                            >

                                <LineChart
                                    data={
                                        growthData
                                    }
                                >

                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                    />

                                    <XAxis
                                        dataKey="month"
                                    />

                                    <YAxis />

                                    <Tooltip />

                                    <Legend />

                                    <Line
                                        type="monotone"
                                        dataKey="value"
                                        name="Invested Amount"
                                        stroke="#8b5cf6"
                                        strokeWidth={4}
                                        dot={{
                                            r: 5,
                                        }}
                                    />

                                </LineChart>

                            </ResponsiveContainer>

                        ) : (

                            <div className="chart-empty">
                                📈
                                <p>
                                    Start investing to see growth
                                </p>
                            </div>

                        )}

                    </div>

                </section>

                {/* ==========================================
                    ALLOCATION + HEALTH
                ========================================== */}

                <section className="lower-grid">

                    {/* ALLOCATION */}

                    <div className="dashboard-panel allocation-panel">

                        <div className="panel-heading">

                            <div>

                                <span>
                                    DIVERSIFICATION
                                </span>

                                <h2>
                                    Asset Allocation
                                </h2>

                            </div>

                        </div>

                        {allocationData.length > 0 ? (

                            <ResponsiveContainer
                                width="100%"
                                height={280}
                            >

                                <PieChart>

                                    <Pie
                                        data={
                                            allocationData
                                        }
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={
                                            65
                                        }
                                        outerRadius={
                                            100
                                        }
                                        paddingAngle={
                                            4
                                        }
                                        dataKey="value"
                                        label
                                    >

                                        {allocationData.map(
                                            (
                                                entry,
                                                index
                                            ) => (

                                                <Cell
                                                    key={
                                                        `cell-${index}`
                                                    }
                                                    fill={
                                                        COLORS[
                                                            index %
                                                                COLORS.length
                                                        ]
                                                    }
                                                />

                                            )
                                        )}

                                    </Pie>

                                    <Tooltip />

                                </PieChart>

                            </ResponsiveContainer>

                        ) : (

                            <div className="chart-empty">
                                🥧
                                <p>
                                    No allocation data
                                </p>
                            </div>

                        )}

                    </div>

                    {/* INVESTMENT HEALTH */}

                    <div className="dashboard-panel health-panel">

                        <div className="panel-heading">

                            <div>

                                <span>
                                    AI ANALYSIS
                                </span>

                                <h2>
                                    Investment Health
                                </h2>

                            </div>

                            <div className="health-score">
                                92
                            </div>

                        </div>

                        <div className="health-progress">

                            <div
                                style={{
                                    width: "92%",
                                }}
                            />

                        </div>

                        <div className="health-status">

                            <strong>
                                Excellent Portfolio Health
                            </strong>

                            <span>
                                92 / 100
                            </span>

                        </div>

                        <div className="health-list">

                            <div>
                                <span>
                                    🟢 Diversification
                                </span>

                                <strong>
                                    Good
                                </strong>
                            </div>

                            <div>
                                <span>
                                    🟢 Risk Level
                                </span>

                                <strong>
                                    Balanced
                                </strong>
                            </div>

                            <div>
                                <span>
                                    🟢 SIP Discipline
                                </span>

                                <strong>
                                    Excellent
                                </strong>
                            </div>

                            <div>
                                <span>
                                    🟡 Portfolio Growth
                                </span>

                                <strong>
                                    Moderate
                                </strong>
                            </div>

                        </div>

                        <button
                            onClick={() =>
                                navigate(
                                    "/ai-advisor"
                                )
                            }
                            className="health-button"
                        >
                            🤖 Get AI Recommendations
                        </button>

                    </div>

                </section>

                {/* ==========================================
                    HOLDINGS + TRANSACTIONS
                ========================================== */}

                <section className="lower-grid">

                    {/* HOLDINGS */}

                    <div className="dashboard-panel">

                        <div className="panel-heading">

                            <div>

                                <span>
                                    YOUR PORTFOLIO
                                </span>

                                <h2>
                                    Top Holdings
                                </h2>

                            </div>

                            <button
                                onClick={() =>
                                    navigate(
                                        "/portfolio"
                                    )
                                }
                            >
                                View Portfolio →
                            </button>

                        </div>

                        {portfolio.length > 0 ? (

                            <div className="holdings-list">

                                {portfolio
                                    .slice(0, 5)
                                    .map(
                                        (
                                            item
                                        ) => {

                                            const quantity =
                                                Number(
                                                    item.quantity ||
                                                        0
                                                );

                                            const price =
                                                Number(
                                                    item.current_price ||
                                                        0
                                                );

                                            const value =
                                                quantity *
                                                price;

                                            const invested =
                                                Number(
                                                    item.invested_amount ||
                                                        0
                                                );

                                            const itemProfit =
                                                value -
                                                invested;

                                            return (

                                                <div
                                                    className="holding-row"
                                                    key={
                                                        item.portfolio_id
                                                    }
                                                >

                                                    <div className="holding-icon">
                                                        📊
                                                    </div>

                                                    <div className="holding-info">

                                                        <strong>
                                                            {
                                                                item.investment_name ||
                                                                "Investment"
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                item.investment_type ||
                                                                "Asset"
                                                            }
                                                            {" • "}
                                                            Qty:{" "}
                                                            {quantity}
                                                        </span>

                                                    </div>

                                                    <div className="holding-value">

                                                        <strong>
                                                            ₹
                                                            {formatCurrency(
                                                                value
                                                            )}
                                                        </strong>

                                                        <span
                                                            className={
                                                                itemProfit >=
                                                                0
                                                                    ? "positive"
                                                                    : "negative"
                                                            }
                                                        >
                                                            {itemProfit >=
                                                            0
                                                                ? "+"
                                                                : "-"}
                                                            ₹
                                                            {formatCurrency(
                                                                Math.abs(
                                                                    itemProfit
                                                                )
                                                            )}
                                                        </span>

                                                    </div>

                                                </div>

                                            );

                                        }
                                    )}

                            </div>

                        ) : (

                            <div className="empty-box">
                                💼
                                <p>
                                    Your holdings will appear here.
                                </p>

                                <button
                                    onClick={() =>
                                        navigate(
                                            "/buy-sell"
                                        )
                                    }
                                >
                                    Start Investing
                                </button>

                            </div>

                        )}

                    </div>

                    {/* TRANSACTIONS */}

                    <div className="dashboard-panel">

                        <div className="panel-heading">

                            <div>

                                <span>
                                    ACTIVITY
                                </span>

                                <h2>
                                    Recent Transactions
                                </h2>

                            </div>

                            <button
                                onClick={() =>
                                    navigate(
                                        "/transactions"
                                    )
                                }
                            >
                                View All →
                            </button>

                        </div>

                        {recentTransactions.length >
                        0 ? (

                            <div className="transactions-list">

                                {recentTransactions.map(
                                    (
                                        transaction
                                    ) => {

                                        const type =
                                            String(
                                                transaction.transaction_type ||
                                                ""
                                            ).toUpperCase();

                                        return (

                                            <div
                                                className="transaction-row"
                                                key={
                                                    transaction.transaction_id
                                                }
                                            >

                                                <div
                                                    className={`transaction-type ${type.toLowerCase()}`}
                                                >
                                                    {type ===
                                                    "BUY"
                                                        ? "↗"
                                                        : type ===
                                                          "SELL"
                                                        ? "↘"
                                                        : "🔄"}
                                                </div>

                                                <div className="transaction-info">

                                                    <strong>
                                                        {
                                                            transaction.investment_name ||
                                                            "Investment"
                                                        }
                                                    </strong>

                                                    <span>
                                                        {type}
                                                        {" • "}
                                                        {formatDate(
                                                            transaction.transaction_date
                                                        )}
                                                    </span>

                                                </div>

                                                <strong>
                                                    ₹
                                                    {formatCurrency(
                                                        transaction.amount
                                                    )}
                                                </strong>

                                            </div>

                                        );

                                    }
                                )}

                            </div>

                        ) : (

                            <div className="empty-box">
                                🔄
                                <p>
                                    No transactions yet.
                                </p>
                            </div>

                        )}

                    </div>

                </section>

                {/* ==========================================
                    PLATFORM RANKING
                ========================================== */}

                <section className="dashboard-panel platform-panel">

                    <div className="panel-heading">

                        <div>

                            <span>
                                MARKETPLACE
                            </span>

                            <h2>
                                🏆 Top Investment Platforms
                            </h2>

                        </div>

                        <button
                            onClick={() =>
                                navigate(
                                    "/investments"
                                )
                            }
                        >
                            Explore →
                        </button>

                    </div>

                    <div className="platform-list">

                        {platformData.map(
                            (
                                platform,
                                index
                            ) => (

                                <div
                                    className="platform-row"
                                    key={
                                        platform.name
                                    }
                                >

                                    <div className="platform-rank">
                                        #{index + 1}
                                    </div>

                                    <div className="platform-name">
                                        <strong>
                                            {
                                                platform.name
                                            }
                                        </strong>

                                        <div className="platform-progress">

                                            <div
                                                style={{
                                                    width: `${platform.score}%`,
                                                }}
                                            />

                                        </div>

                                    </div>

                                    <strong className="platform-score">
                                        {
                                            platform.score
                                        }
                                        /100
                                    </strong>

                                </div>

                            )
                        )}

                    </div>

                </section>

                {/* ==========================================
                    AI INSIGHT
                ========================================== */}

                <section className="ai-insight">

                    <div className="ai-glow">
                        🤖
                    </div>

                    <div className="ai-content">

                        <span>
                            INVESTAI AI INSIGHT
                        </span>

                        <h2>
                            Your portfolio is being
                            monitored by InvestAI
                        </h2>

                        <p>
                            You currently have{" "}
                            <strong>
                                ₹
                                {formatCurrency(
                                    totalInvested
                                )}
                            </strong>{" "}
                            invested across{" "}
                            <strong>
                                {portfolio.length}
                            </strong>{" "}
                            investment
                            {portfolio.length !==
                            1
                                ? "s"
                                : ""}
                            .
                        </p>

                    </div>

                    <button
                        onClick={() =>
                            navigate(
                                "/ai-advisor"
                            )
                        }
                    >
                        Get Personalized Advice →
                    </button>

                </section>

                {/* FOOTER */}

                <footer className="dashboard-footer">

                    © 2026 InvestAI
                    <span>
                        •
                    </span>
                    Smart Investing with AI
                    <span>
                        •
                    </span>
                    Build wealth responsibly 🚀

                </footer>

            </main>

        </div>

    );

}

export default Dashboard;