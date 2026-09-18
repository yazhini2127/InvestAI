import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import api from "./services/api";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Wallet from "./pages/Wallet";
import Portfolio from "./pages/Portfolio";
import Transactions from "./pages/Transactions";
import SIPPlans from "./pages/SIPPlans";
import AIAdvisor from "./pages/AIAdvisor";
import MarketNews from "./pages/MarketNews";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Investments from "./pages/Investments";
import BuySell from "./pages/BuySell";

function App() {

    const userId = 2;

    // =====================================================
    // APPLY THEME
    // =====================================================

    const applyTheme = (darkMode) => {
        document.documentElement.setAttribute(
            "data-theme",
            darkMode ? "dark" : "light"
        );

        document.body.setAttribute(
            "data-theme",
            darkMode ? "dark" : "light"
        );
    };

    // =====================================================
    // LOAD USER THEME
    // =====================================================

    useEffect(() => {

        const loadTheme = async () => {
            try {
                const response = await api.get(
                    `/settings/${userId}`
                );

                if (response.data.success) {
                    const darkMode = Boolean(
                        response.data.settings.dark_mode
                    );

                    applyTheme(darkMode);

                    localStorage.setItem(
                        "investai_dark_mode",
                        darkMode ? "true" : "false"
                    );
                }

            } catch (error) {

                console.error(
                    "Theme Load Error:",
                    error
                );

                // Fallback to localStorage
                const savedTheme =
                    localStorage.getItem(
                        "investai_dark_mode"
                    );

                if (savedTheme !== null) {
                    applyTheme(
                        savedTheme === "true"
                    );
                }
            }
        };

        loadTheme();

        // Listen for Settings page theme changes
        const handleThemeChange = (event) => {

            const darkMode =
                event.detail?.darkMode;

            if (typeof darkMode === "boolean") {
                applyTheme(darkMode);
            }
        };

        window.addEventListener(
            "investai-theme-change",
            handleThemeChange
        );

        return () => {
            window.removeEventListener(
                "investai-theme-change",
                handleThemeChange
            );
        };

    }, []);

    return (
        <Routes>

            {/* Login */}
            <Route
                path="/"
                element={<Login />}
            />

            {/* Register */}
            <Route
                path="/register"
                element={<Register />}
            />

            {/* Dashboard */}
            <Route
                path="/dashboard"
                element={<Dashboard />}
            />

            {/* Wallet */}
            <Route
                path="/wallet"
                element={<Wallet />}
            />

            {/* Portfolio */}
            <Route
                path="/portfolio"
                element={<Portfolio />}
            />

            {/* Investments */}
            <Route
                path="/investments"
                element={<Investments />}
            />

            {/* Buy & Sell */}
            <Route
                path="/buy-sell"
                element={<BuySell />}
            />

            {/* SIP Plans */}
            <Route
                path="/sip-plans"
                element={<SIPPlans />}
            />

            {/* Settings */}
            <Route
                path="/settings"
                element={<Settings />}
            />

            {/* AI Advisor */}
            <Route
                path="/ai-advisor"
                element={<AIAdvisor />}
            />

            {/* Transactions */}
            <Route
                path="/transactions"
                element={<Transactions />}
            />

            {/* Market News */}
            <Route
                path="/market-news"
                element={<MarketNews />}
            />

            {/* Profile */}
            <Route
                path="/profile"
                element={<Profile />}
            />

        </Routes>
    );
}

export default App;