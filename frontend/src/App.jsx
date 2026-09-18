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

    // Get logged-in user's ID
    const getUserId = () => {
        try {
            const user = JSON.parse(
                localStorage.getItem("user") || "{}"
            );

            return (
                user.user_id ||
                user.userId ||
                user.id ||
                null
            );

        } catch (error) {
            console.error("User Data Error:", error);
            return null;
        }
    };

    const userId = getUserId();

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

            if (!userId) {
                return;
            }

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

    }, [userId]);

    return (
        <Routes>

            <Route
                path="/"
                element={<Login />}
            />

            <Route
                path="/register"
                element={<Register />}
            />

            <Route
                path="/dashboard"
                element={<Dashboard />}
            />

            <Route
                path="/wallet"
                element={<Wallet />}
            />

            <Route
                path="/portfolio"
                element={<Portfolio />}
            />

            <Route
                path="/investments"
                element={<Investments />}
            />

            <Route
                path="/buy-sell"
                element={<BuySell />}
            />

            <Route
                path="/sip-plans"
                element={<SIPPlans />}
            />

            <Route
                path="/settings"
                element={<Settings />}
            />

            <Route
                path="/ai-advisor"
                element={<AIAdvisor />}
            />

            <Route
                path="/transactions"
                element={<Transactions />}
            />

            <Route
                path="/market-news"
                element={<MarketNews />}
            />

            <Route
                path="/profile"
                element={<Profile />}
            />

        </Routes>
    );
}

export default App;