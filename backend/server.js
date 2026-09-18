const express = require("express");
const cors = require("cors");
require("dotenv").config();

// =====================================================
// DATABASE
// =====================================================

const db = require("./config/db");

// =====================================================
// ROUTES
// =====================================================

const authRoutes = require("./routes/authRoutes");
const portfolioRoutes = require("./routes/PortfolioRoutes");
const transactionRoutes = require("./routes/TransactionRoutes");
const sipRoutes = require("./routes/SIPRoutes");
const aiAdvisorRoutes = require("./routes/AIAdvisorRoutes");
const marketNewsRoutes = require("./routes/MarketNewsRoutes");
const profileRoutes = require("./routes/ProfileRoutes");
const settingsRoutes = require("./routes/SettingsRoutes");
const walletRoutes = require("./routes/WalletRoutes");
const investmentRoutes = require("./routes/InvestmentRoutes");
const buySellRoutes = require("./routes/BuySellRoutes");

// =====================================================
// APP
// =====================================================

const app = express();

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);

// =====================================================
// API ROUTES
// =====================================================

// Authentication
app.use(
    "/api/auth",
    authRoutes
);

// Investments
app.use(
    "/api/investments",
    investmentRoutes
);

// Portfolio
app.use(
    "/api/portfolio",
    portfolioRoutes
);

// Transactions
app.use(
    "/api/transactions",
    transactionRoutes
);

// SIP Plans
app.use(
    "/api/sip-plans",
    sipRoutes
);

// AI Advisor
app.use(
    "/api/ai-advisor",
    aiAdvisorRoutes
);

// Buy / Sell
app.use(
    "/api/buy-sell",
    buySellRoutes
);

// Market News
app.use(
    "/api/market-news",
    marketNewsRoutes
);

// Wallet
app.use(
    "/api/wallet",
    walletRoutes
);

// Profile
app.use(
    "/api/profile",
    profileRoutes
);

// Settings
app.use(
    "/api/settings",
    settingsRoutes
);

// =====================================================
// HOME ROUTE
// =====================================================

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message:
            "🚀 InvestAI Backend Running Successfully..."
    });
});

// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "✅ InvestAI API is working",
        server: "Online",
        port: PORT
    });
});

// =====================================================
// BUY / SELL TEST ROUTE
// =====================================================

app.get("/api/buy-sell", (req, res) => {
    res.status(200).json({
        success: true,
        message: "💰 Buy/Sell API is working",
        endpoints: {
            buy: "POST /api/buy-sell/buy",
            sell: "POST /api/buy-sell/sell"
        }
    });
});

// =====================================================
// 404 ROUTE
// =====================================================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "❌ API route not found",
        path: req.originalUrl
    });
});

// =====================================================
// ERROR HANDLER
// =====================================================

app.use((err, req, res, next) => {
    console.error(
        "❌ Server Error:",
        err
    );

    res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: err.message
    });
});

// =====================================================
// PORT
// =====================================================

const PORT =
    process.env.PORT || 5000;

// =====================================================
// START SERVER
// =====================================================

app.listen(PORT, () => {

    console.log("");
    console.log(
        "=========================================="
    );

    console.log(
        "🚀 InvestAI Backend Started"
    );

    console.log(
        "=========================================="
    );

    console.log(
        `🌐 Server: http://localhost:${PORT}`
    );

    console.log(
        `❤️ Health: http://localhost:${PORT}/api/health`
    );

    console.log(
        `💰 Investments: http://localhost:${PORT}/api/investments`
    );

    console.log(
        `📊 Portfolio: http://localhost:${PORT}/api/portfolio`
    );

    console.log(
        `🔄 Transactions: http://localhost:${PORT}/api/transactions`
    );

    console.log(
        `💵 SIP Plans: http://localhost:${PORT}/api/sip-plans`
    );

    console.log(
        `🤖 AI Advisor: http://localhost:${PORT}/api/ai-advisor`
    );

    console.log(
        `💸 Buy/Sell: http://localhost:${PORT}/api/buy-sell`
    );

    console.log(
        `📰 Market News: http://localhost:${PORT}/api/market-news`
    );

    console.log(
        `👛 Wallet: http://localhost:${PORT}/api/wallet`
    );

    console.log(
        `👤 Profile: http://localhost:${PORT}/api/profile`
    );

    console.log(
        `⚙️ Settings: http://localhost:${PORT}/api/settings`
    );

    console.log(
        "=========================================="
    );

    console.log("");
});