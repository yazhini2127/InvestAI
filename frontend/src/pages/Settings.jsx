import { useEffect, useState } from "react";
import api from "../services/api";

function Settings() {
    const storedUser = localStorage.getItem("user");
const user = storedUser ? JSON.parse(storedUser) : null;
const userId = user?.id;

    const [settings, setSettings] = useState({
        notifications: true,
        dark_mode: false,
        email_alerts: true,
        risk_level: "Medium",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // =====================================================
    // APPLY THEME
    // =====================================================

    const applyTheme = (darkMode) => {
        document.documentElement.setAttribute(
            "data-theme",
            darkMode ? "dark" : "light"
        );

        localStorage.setItem(
            "investai_dark_mode",
            darkMode ? "true" : "false"
        );
    };

    // =====================================================
    // LOAD SETTINGS
    // =====================================================

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const response = await api.get(`/settings/${userId}`);

                if (response.data.success) {
                    const data = response.data.settings;

                    const loadedSettings = {
                        notifications: Boolean(data.notifications),
                        dark_mode: Boolean(data.dark_mode),
                        email_alerts: Boolean(data.email_alerts),
                        risk_level: data.risk_level || "Medium",
                    };

                    setSettings(loadedSettings);

                    applyTheme(loadedSettings.dark_mode);
                }
            } catch (err) {
                console.error("Settings Error:", err);

                setError(
                    err.response?.data?.message ||
                    "Failed to load settings"
                );

                // Try saved local theme
                const savedTheme =
                    localStorage.getItem("investai_dark_mode");

                if (savedTheme !== null) {
                    applyTheme(savedTheme === "true");
                }
            } finally {
                setLoading(false);
            }
        };

        loadSettings();
    }, [userId]);

    // =====================================================
    // HANDLE CHANGE
    // =====================================================

    const handleChange = (field, value) => {
        setSettings((prev) => ({
            ...prev,
            [field]: value,
        }));

        if (field === "dark_mode") {
            applyTheme(value);
        }
    };

    // =====================================================
    // SAVE SETTINGS
    // =====================================================

    const handleSave = async () => {
        try {
            setSaving(true);
            setMessage("");
            setError("");

            const response = await api.put(
                `/settings/${userId}`,
                {
                    notifications: settings.notifications ? 1 : 0,
                    dark_mode: settings.dark_mode ? 1 : 0,
                    email_alerts: settings.email_alerts ? 1 : 0,
                    risk_level: settings.risk_level,
                }
            );

            if (response.data.success) {
                applyTheme(settings.dark_mode);

                setMessage("Settings saved successfully!");
            }
        } catch (err) {
            console.error("Save Settings Error:", err);

            setError(
                err.response?.data?.message ||
                "Failed to save settings"
            );
        } finally {
            setSaving(false);
        }
    };

    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {
        return (
            <div className="settings-loading">
                Loading settings...
            </div>
        );
    }

    // =====================================================
    // UI
    // =====================================================

    return (
        <div className="settings-page">

            <div className="settings-header">
                <h1>⚙️ Settings</h1>

                <p>
                    Customize your InvestAI preferences
                </p>
            </div>

            <div className="settings-card">

                {/* Notifications */}
                <div className="settings-row">

                    <div className="settings-info">
                        <h3>🔔 Notifications</h3>

                        <p>
                            Receive investment notifications
                        </p>
                    </div>

                    <label className="switch">
                        <input
                            type="checkbox"
                            checked={settings.notifications}
                            onChange={(e) =>
                                handleChange(
                                    "notifications",
                                    e.target.checked
                                )
                            }
                        />

                        <span className="slider"></span>
                    </label>

                </div>

                {/* Dark Mode */}
                <div className="settings-row">

                    <div className="settings-info">
                        <h3>🌙 Dark Mode</h3>

                        <p>
                            Enable dark mode preference
                        </p>
                    </div>

                    <label className="switch">
                        <input
                            type="checkbox"
                            checked={settings.dark_mode}
                            onChange={(e) =>
                                handleChange(
                                    "dark_mode",
                                    e.target.checked
                                )
                            }
                        />

                        <span className="slider"></span>
                    </label>

                </div>

                {/* Email Alerts */}
                <div className="settings-row">

                    <div className="settings-info">
                        <h3>📧 Email Alerts</h3>

                        <p>
                            Receive important updates by email
                        </p>
                    </div>

                    <label className="switch">
                        <input
                            type="checkbox"
                            checked={settings.email_alerts}
                            onChange={(e) =>
                                handleChange(
                                    "email_alerts",
                                    e.target.checked
                                )
                            }
                        />

                        <span className="slider"></span>
                    </label>

                </div>

                {/* Risk Level */}
                <div className="settings-row">

                    <div className="settings-info">
                        <h3>🛡️ Risk Level</h3>

                        <p>
                            Select your preferred investment risk level
                        </p>
                    </div>

                    <select
                        value={settings.risk_level}
                        onChange={(e) =>
                            handleChange(
                                "risk_level",
                                e.target.value
                            )
                        }
                        className="risk-select"
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

                </div>

                {/* Error */}
                {error && (
                    <div className="settings-error">
                        {error}
                    </div>
                )}

                {/* Success */}
                {message && (
                    <div className="settings-success">
                        {message}
                    </div>
                )}

                {/* Save */}
                <button
                    className="save-settings-btn"
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving
                        ? "Saving..."
                        : "💾 Save Settings"}
                </button>

            </div>

        </div>
    );
}

export default Settings;
