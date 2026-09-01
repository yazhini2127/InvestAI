const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/db");

// ==========================
// Routes
// ==========================
const authRoutes = require("./routes/authRoutes");
const portfolioRoutes = require("./routes/PortfolioRoutes");
const transactionRoutes = require("./routes/TransactionRoutes");
const sipRoutes = require("./routes/SIPRoutes");
const aiAdvisorRoutes = require("./routes/AIAdvisorRoutes");
const marketNewsRoutes = require("./routes/MarketNewsRoutes");
const profileRoutes = require("./routes/ProfileRoutes");
const settingsRoutes = require("./routes/SettingsRoutes");

// ==========================
// App
// ==========================
const app = express();

// ==========================
// Middleware
// ==========================
app.use(cors());
app.use(express.json());

// ==========================
// Routes
// ==========================
app.use("/api/auth", authRoutes);

app.use("/api/portfolio", portfolioRoutes);

app.use("/api/transactions", transactionRoutes);
app.use("/api/sip-plans", sipRoutes);
app.use("/api/ai-advisor", aiAdvisorRoutes);
app.use("/api/market-news", marketNewsRoutes);

app.use("/api/profile", profileRoutes);
app.use("/api/settings", settingsRoutes);
// ==========================
// Home Route
// ==========================
app.get("/", (req, res) => {
    res.send("🚀 InvestAI Backend Running Successfully...");
});

// ==========================
// Start Server
// ==========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});