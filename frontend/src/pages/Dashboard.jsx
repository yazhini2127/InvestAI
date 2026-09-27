import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

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

import api from "../services/api";
import "./Dashboard.css";

// =====================================================
// DASHBOARD
// =====================================================

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
    // GET LOGGED-IN USER ID
    // =====================================================

    const getUserId = useCallback(() => {

        try {

            const directUserId =
                localStorage.getItem("userId");

            if (directUserId) {
                return Number(directUserId);
            }

            const savedUser =
                localStorage.getItem("user");

            if (savedUser) {

                const user =
                    JSON.parse(savedUser);

                return Number(
                    user?.id ||
                    user?.user_id ||
                    user?.userId ||
                    0
                );

            }

            const savedUserData =
                localStorage.getItem("userData");

            if (savedUserData) {

                const user =
                    JSON.parse(savedUserData);

                return Number(
                    user?.id ||
                    user?.user_id ||
                    user?.userId ||
                    0
                );

            }

        } catch (err) {

            console.error(
                "User ID error:",
                err
            );

        }

        return 0;

    }, []);


    // =====================================================
    // LOAD SIP PLANS FROM LOCAL STORAGE
    // =====================================================

    const loadLocalSips = useCallback(() => {

        try {

            const saved =
                localStorage.getItem(
                    "investai_sip_plans"
                );

            if (!saved) {

                setSipPlans([]);

                return;

            }

            const parsed =
                JSON.parse(saved);

            if (Array.isArray(parsed)) {

                setSipPlans(parsed);

            } else {

                setSipPlans([]);

            }

        } catch (err) {

            console.error(
                "SIP localStorage error:",
                err
            );

            setSipPlans([]);

        }

    }, []);


    // =====================================================
    // NORMALIZE API ARRAY
    // =====================================================

    const extractArray = useCallback(
        (data, keys = []) => {

            if (Array.isArray(data)) {
                return data;
            }

            for (const key of keys) {

                if (Array.isArray(data?.[key])) {
                    return data[key];
                }

            }

            if (Array.isArray(data?.data)) {
                return data.data;
            }

            return [];

        },
        []
    );


    // =====================================================
    // LOAD DASHBOARD
    // =====================================================

    const loadDashboard =
        useCallback(async () => {

            try {

                setError("");

                const userId =
                    getUserId();


                // =================================================
                // API REQUESTS
                // =================================================

                const walletRequest =
                    api.get("/wallet");

                const portfolioRequest =
                    api.get("/portfolio");

                let transactionRequest;

                /*
                 * Your transactions backend is user-specific.
                 * Therefore use:
                 *
                 * /transactions/user/:userId
                 */

                if (userId > 0) {

                    transactionRequest =
                        api.get(
                            `/transactions/user/${userId}`
                        );

                } else {

                    transactionRequest =
                        Promise.reject(
                            new Error(
                                "User ID not found"
                            )
                        );

                }


                const results =
                    await Promise.allSettled([
                        walletRequest,
                        portfolioRequest,
                        transactionRequest,
                    ]);


                // =================================================
                // WALLET
                // =================================================

                if (
                    results[0].status ===
                    "fulfilled"
                ) {

                    const data =
                        results[0].value?.data;

                    console.log(
                        "💰 Dashboard Wallet:",
                        data
                    );

                    if (data?.success !== false) {

                        const walletData =
                            data?.wallet ||
                            data?.data ||
                            data ||
                            null;

                        setWallet(
                            walletData
                        );

                    }

                } else {

                    console.error(
                        "❌ Wallet API Error:",
                        results[0].reason
                    );

                }


                // =================================================
                // PORTFOLIO
                // =================================================

                if (
                    results[1].status ===
                    "fulfilled"
                ) {

                    const data =
                        results[1].value?.data;

                    console.log(
                        "💼 Dashboard Portfolio:",
                        data
                    );

                    const portfolioData =
                        extractArray(
                            data,
                            [
                                "portfolio",
                                "data",
                                "result",
                            ]
                        );

                    setPortfolio(
                        portfolioData
                    );

                } else {

                    console.error(
                        "❌ Portfolio API Error:",
                        results[1].reason
                    );

                    setPortfolio([]);

                }


                // =================================================
                // TRANSACTIONS
                // =================================================

                if (
                    results[2].status ===
                    "fulfilled"
                ) {

                    const data =
                        results[2].value?.data;

                    console.log(
                        "🔄 Dashboard Transactions:",
                        data
                    );

                    const transactionData =
                        extractArray(
                            data,
                            [
                                "transactions",
                                "data",
                                "result",
                            ]
                        );

                    setTransactions(
                        transactionData
                    );

                } else {

                    console.error(
                        "❌ Transactions API Error:",
                        results[2].reason
                    );

                    setTransactions([]);

                }


                // =================================================
                // SIP
                // =================================================

                loadLocalSips();

            } catch (err) {

                console.error(
                    "❌ Dashboard Error:",
                    err
                );

                setError(
                    "Unable to load dashboard data."
                );

            } finally {

                setLoading(false);
                setRefreshing(false);

            }

        }, [
            getUserId,
            loadLocalSips,
            extractArray,
        ]);


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        const timer =
            setTimeout(() => {

                loadDashboard();

            }, 0);

        return () => {
            clearTimeout(timer);
        };

    }, [loadDashboard]);


    // =====================================================
    // REFRESH
    // =====================================================

    const handleRefresh =
        async () => {

            if (refreshing) {
                return;
            }

            setRefreshing(true);

            loadLocalSips();

            await loadDashboard();

        };


    // =====================================================
    // ACTIVE SIP PLANS
    // =====================================================

    const activeSipPlans =
        useMemo(() => {

            return sipPlans.filter(
                (plan) =>
                    String(
                        plan?.status || ""
                    ).toLowerCase() ===
                    "active"
            );

        }, [sipPlans]);


    // =====================================================
    // MONTHLY SIP AMOUNT
    // =====================================================

    const monthlySipAmount =
        useMemo(() => {

            return activeSipPlans.reduce(
                (total, plan) => {

                    return (
                        total +
                        Number(
                            plan?.amount ||
                            plan?.monthlyAmount ||
                            0
                        )
                    );

                },
                0
            );

        }, [activeSipPlans]);


    // =====================================================
    // COMBINE DUPLICATE INVESTMENTS
    //
    // Same investment is shown as ONE holding.
    //
    // Example:
    //
    // Ethereum Qty 1
    // Ethereum Qty 1
    //
    // becomes:
    //
    // Ethereum Qty 2
    //
    // =====================================================

    const groupedPortfolio =
        useMemo(() => {

            const grouped = {};

            portfolio.forEach(
                (item) => {

                    const investmentId =
                        Number(
                            item?.investment_id ??
                            item?.investmentId ??
                            0
                        );

                    /*
                     * Primary grouping is investment ID.
                     *
                     * This prevents duplicate Ethereum,
                     * duplicate ITC, etc.
                     */

                    const key =
                        investmentId > 0
                            ? `investment_${investmentId}`
                            : `name_${String(
                                  item?.investment_name ||
                                  item?.investmentName ||
                                  "unknown"
                              ).toLowerCase()}`;


                    if (!grouped[key]) {

                        grouped[key] = {

                            ...item,

                            quantity: 0,

                            invested_amount: 0,

                            current_value: 0,

                            platforms: [],

                        };

                    }


                    // -----------------------------------------
                    // QUANTITY
                    // -----------------------------------------

                    grouped[key].quantity +=
                        Number(
                            item?.quantity ||
                            0
                        );


                    // -----------------------------------------
                    // INVESTED AMOUNT
                    // -----------------------------------------

                    grouped[key].invested_amount +=
                        Number(
                            item?.invested_amount ||
                            item?.investedAmount ||
                            item?.amount ||
                            0
                        );


                    // -----------------------------------------
                    // CURRENT VALUE
                    // -----------------------------------------

                    const quantity =
                        Number(
                            item?.quantity ||
                            0
                        );

                    const price =
                        Number(
                            item?.current_price ||
                            item?.currentPrice ||
                            0
                        );

                    grouped[key].current_value +=
                        quantity * price;


                    // -----------------------------------------
                    // PLATFORM
                    // -----------------------------------------

                    const platformName =
                        item?.platform_name ||
                        item?.platformName ||
                        item?.platform ||
                        "";

                    if (
                        platformName &&
                        !grouped[key].platforms.includes(
                            platformName
                        )
                    ) {

                        grouped[key].platforms.push(
                            platformName
                        );

                    }

                }
            );


            return Object.values(
                grouped
            );

        }, [portfolio]);


    // =====================================================
    // TOTAL INVESTED
    // =====================================================

    const totalInvested =
        useMemo(() => {

            return groupedPortfolio.reduce(
                (total, item) => {

                    return (
                        total +
                        Number(
                            item?.invested_amount ||
                            0
                        )
                    );

                },
                0
            );

        }, [groupedPortfolio]);


    // =====================================================
    // CURRENT PORTFOLIO VALUE
    // =====================================================

    const currentPortfolioValue =
        useMemo(() => {

            return groupedPortfolio.reduce(
                (total, item) => {

                    /*
                     * current_value was already calculated
                     * while grouping the portfolio.
                     */

                    return (
                        total +
                        Number(
                            item?.current_value ||
                            0
                        )
                    );

                },
                0
            );

        }, [groupedPortfolio]);


    // =====================================================
    // PROFIT
    // =====================================================

    const profit =
        currentPortfolioValue -
        totalInvested;


    const profitPercentage =
        totalInvested > 0
            ? (
                profit /
                totalInvested
            ) * 100
            : 0;


    // =====================================================
    // INVESTMENT DISTRIBUTION
    // =====================================================

    const investmentData =
        useMemo(() => {

            const grouped = {};

            groupedPortfolio.forEach(
                (item) => {

                    const type =
                        item?.investment_type ||
                        item?.investmentType ||
                        "Other";

                    const amount =
                        Number(
                            item?.invested_amount ||
                            0
                        );

                    grouped[type] =
                        (
                            grouped[type] ||
                            0
                        ) +
                        amount;

                }
            );


            return Object.entries(
                grouped
            ).map(
                ([name, amount]) => ({

                    name,

                    amount:
                        Number(
                            amount.toFixed(2)
                        ),

                })
            );

        }, [groupedPortfolio]);


    // =====================================================
    // ASSET ALLOCATION
    // =====================================================

    const allocationData =
        useMemo(() => {

            const grouped = {};


            groupedPortfolio.forEach(
                (item) => {

                    const type =
                        item?.investment_type ||
                        item?.investmentType ||
                        "Other";

                    const amount =
                        Number(
                            item?.invested_amount ||
                            0
                        );

                    grouped[type] =
                        (
                            grouped[type] ||
                            0
                        ) +
                        amount;

                }
            );


            const total =
                Object.values(
                    grouped
                ).reduce(
                    (
                        sum,
                        value
                    ) =>
                        sum + value,
                    0
                );


            return Object.entries(
                grouped
            ).map(
                ([name, value]) => ({

                    name,

                    value:
                        total > 0
                            ? Number(
                                (
                                    (
                                        value /
                                        total
                                    ) *
                                    100
                                ).toFixed(1)
                            )
                            : 0,

                })
            );

        }, [groupedPortfolio]);


    // =====================================================
    // INVESTMENT HISTORY
    // =====================================================

    const growthData =
        useMemo(() => {

            const grouped = {};


            groupedPortfolio.forEach(
                (item) => {

                    const date =
                        item?.purchase_date
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
                            item?.invested_amount ||
                            0
                        );


                    grouped[key] =
                        (
                            grouped[key] ||
                            0
                        ) +
                        amount;

                }
            );


            return Object.entries(
                grouped
            ).map(
                ([month, value]) => ({

                    month,

                    value:
                        Number(
                            value.toFixed(2)
                        ),

                })
            );

        }, [groupedPortfolio]);


    // =====================================================
    // FORMAT CURRENCY
    // =====================================================

    const formatCurrency =
        (value) => {

            return Number(
                value || 0
            ).toLocaleString(
                "en-IN",
                {
                    maximumFractionDigits: 2,
                }
            );

        };


    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate =
        (value) => {

            if (!value) {
                return "-";
            }


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
    // PLATFORM DATA
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
                    (a, b) => {

                        const dateA =
                            new Date(
                                a?.transaction_date ||
                                a?.transactionDate ||
                                a?.created_at ||
                                0
                            ).getTime();

                        const dateB =
                            new Date(
                                b?.transaction_date ||
                                b?.transactionDate ||
                                b?.created_at ||
                                0
                            ).getTime();

                        return dateB - dateA;

                    }
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
    // LOGOUT
    // =====================================================

    const handleLogout =
        () => {

            const confirmLogout =
                window.confirm(
                    "Are you sure you want to logout?"
                );


            if (!confirmLogout) {
                return;
            }


            localStorage.removeItem(
                "token"
            );

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

        };


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


            {/* =================================================
                SIDEBAR
            ================================================= */}

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
                                    path ===
                                    "/dashboard"
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
                        onClick={
                            handleLogout
                        }
                    >

                        <span className="menu-icon">
                            🚪
                        </span>

                        Logout

                    </button>

                </div>

            </aside>


            {/* =================================================
                MAIN
            ================================================= */}

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


                {/* =================================================
                    HERO
                ================================================= */}

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


                {/* =================================================
                    SUMMARY
                ================================================= */}

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
                                    {
                                        activeSipPlans.length
                                    }
                                </h3>

                            </div>


                            <div className="summary-icon purple">
                                🔄
                            </div>

                        </div>


                        <p>

                            ₹
                            {formatCurrency(
                                monthlySipAmount
                            )}

                            / month

                        </p>


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


                {/* =================================================
                    QUICK ACTIONS
                ================================================= */}

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


                {/* =================================================
                    CHARTS
                ================================================= */}

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


                {/* =================================================
                    ALLOCATION + HEALTH
                ================================================= */}

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


                    {/* HEALTH */}

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
                                    {activeSipPlans.length > 0
                                        ? "Excellent"
                                        : "Not Active"}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    🟡 Portfolio Growth
                                </span>

                                <strong>
                                    {profit > 0
                                        ? "Positive"
                                        : "Moderate"}
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


                {/* =================================================
                    HOLDINGS + TRANSACTIONS
                ================================================= */}

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


                        {groupedPortfolio.length > 0 ? (

                            <div className="holdings-list">

                                {groupedPortfolio
                                    .slice(0, 5)
                                    .map(
                                        (
                                            item
                                        ) => {

                                            const quantity =
                                                Number(
                                                    item?.quantity ||
                                                    0
                                                );

                                            const value =
                                                Number(
                                                    item?.current_value ||
                                                    0
                                                );

                                            const invested =
                                                Number(
                                                    item?.invested_amount ||
                                                    0
                                                );

                                            const itemProfit =
                                                value -
                                                invested;


                                            return (

                                                <div
                                                    className="holding-row"
                                                    key={
                                                        `holding_${item?.investment_id || item?.investment_name}`
                                                    }
                                                >

                                                    <div className="holding-icon">
                                                        📊
                                                    </div>


                                                    <div className="holding-info">

                                                        <strong>
                                                            {
                                                                item?.investment_name ||
                                                                item?.investmentName ||
                                                                "Investment"
                                                            }
                                                        </strong>

                                                        <span>

                                                            {
                                                                item?.investment_type ||
                                                                item?.investmentType ||
                                                                "Asset"
                                                            }

                                                            {" • "}

                                                            Qty:{" "}

                                                            {
                                                                quantity
                                                            }

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
                                                                itemProfit >= 0
                                                                    ? "positive"
                                                                    : "negative"
                                                            }
                                                        >

                                                            {itemProfit >= 0
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


                        {recentTransactions.length > 0 ? (

                            <div className="transactions-list">

                                {recentTransactions.map(
                                    (
                                        transaction,
                                        index
                                    ) => {

                                        const type =
                                            String(
                                                transaction?.transaction_type ||
                                                transaction?.transactionType ||
                                                ""
                                            ).toUpperCase();


                                        const transactionKey =
                                            transaction?.transaction_id ||
                                            transaction?.id ||
                                            `${type}_${transaction?.transaction_date}_${index}`;


                                        return (

                                            <div
                                                className="transaction-row"
                                                key={
                                                    transactionKey
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
                                                            transaction?.investment_name ||
                                                            transaction?.investmentName ||
                                                            "Investment"
                                                        }
                                                    </strong>


                                                    <span>

                                                        {type ||
                                                            "TRANSACTION"}

                                                        {" • "}

                                                        {
                                                            formatDate(
                                                                transaction?.transaction_date ||
                                                                transaction?.transactionDate ||
                                                                transaction?.created_at
                                                            )
                                                        }

                                                    </span>

                                                </div>


                                                <strong>

                                                    ₹
                                                    {formatCurrency(
                                                        transaction?.amount ||
                                                        0
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


                {/* =================================================
                    PLATFORM RANKING
                ================================================= */}

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
                                                    width:
                                                        `${platform.score}%`,
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


                {/* =================================================
                    AI INSIGHT
                ================================================= */}

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
                                {
                                    groupedPortfolio.length
                                }
                            </strong>{" "}

                            investment
                            {
                                groupedPortfolio.length !==
                                1
                                    ? "s"
                                    : ""
                            }
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