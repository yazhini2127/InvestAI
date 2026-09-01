import { useEffect, useState } from "react";
import api from "../services/api";

function Settings() {
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

    const userId = 2;

    useEffect(() => {
        let ignore = false;

        const loadSettings = async () => {
            try {
                const response = await api.get(
                    `/settings/${userId}`
                );

                if (!ignore && response.data.success) {
                    const data = response.data.settings;

                    setSettings({
                        notifications: Boolean(
                            data.notifications
                        ),
                        dark_mode: Boolean(
                            data.dark_mode
                        ),
                        email_alerts: Boolean(
                            data.email_alerts
                        ),
                        risk_level:
                            data.risk_level || "Medium",
                    });
                }
            } catch (err) {
                console.error("Settings Error:", err);

                if (!ignore) {
                    setError(
                        err.response?.data?.message ||
                        "Failed to load settings"
                    );
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        };

        loadSettings();

        return () => {
            ignore = true;
        };
    }, []);

    const handleSave = async () => {
        try {
            setSaving(true);
            setMessage("");
            setError("");

            const response = await api.put(
                `/settings/${userId}`,
                settings
            );

            if (response.data.success) {
                setMessage(
                    "Settings saved successfully!"
                );
            }
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to save settings"
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div style={styles.message}>
                Loading settings...
            </div>
        );
    }

    return (
        <div style={styles.container}>

            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>
                        ⚙️ Settings
                    </h1>

                    <p style={styles.subtitle}>
                        Customize your InvestAI preferences
                    </p>
                </div>
            </div>

            <div style={styles.card}>

                {/* Notifications */}
                <div style={styles.settingRow}>
                    <div>
                        <h3 style={styles.settingTitle}>
                            🔔 Notifications
                        </h3>

                        <p style={styles.description}>
                            Receive investment notifications
                        </p>
                    </div>

                    <input
                        type="checkbox"
                        checked={settings.notifications}
                        onChange={(e) =>
                            setSettings({
                                ...settings,
                                notifications:
                                    e.target.checked,
                            })
                        }
                    />
                </div>

                {/* Dark Mode */}
                <div style={styles.settingRow}>
                    <div>
                        <h3 style={styles.settingTitle}>
                            🌙 Dark Mode
                        </h3>

                        <p style={styles.description}>
                            Enable dark mode preference
                        </p>
                    </div>

                    <input
                        type="checkbox"
                        checked={settings.dark_mode}
                        onChange={(e) =>
                            setSettings({
                                ...settings,
                                dark_mode:
                                    e.target.checked,
                            })
                        }
                    />
                </div>

                {/* Email Alerts */}
                <div style={styles.settingRow}>
                    <div>
                        <h3 style={styles.settingTitle}>
                            📧 Email Alerts
                        </h3>

                        <p style={styles.description}>
                            Receive important updates by email
                        </p>
                    </div>

                    <input
                        type="checkbox"
                        checked={settings.email_alerts}
                        onChange={(e) =>
                            setSettings({
                                ...settings,
                                email_alerts:
                                    e.target.checked,
                            })
                        }
                    />
                </div>

                {/* Risk Level */}
                <div style={styles.settingRow}>
                    <div>
                        <h3 style={styles.settingTitle}>
                            🛡️ Risk Level
                        </h3>

                        <p style={styles.description}>
                            Select your preferred investment risk level
                        </p>
                    </div>

                    <select
                        value={settings.risk_level}
                        onChange={(e) =>
                            setSettings({
                                ...settings,
                                risk_level:
                                    e.target.value,
                            })
                        }
                        style={styles.select}
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
                    <div style={styles.error}>
                        {error}
                    </div>
                )}

                {/* Success */}
                {message && (
                    <div style={styles.success}>
                        {message}
                    </div>
                )}

                {/* Save */}
                <button
                    style={styles.saveButton}
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

const styles = {
    container: {
        minHeight: "100vh",
        padding: "40px",
        background: "#f5f7fb",
        fontFamily: "Arial, sans-serif",
    },

    header: {
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

    card: {
        maxWidth: "800px",
        margin: "0 auto",
        background: "white",
        borderRadius: "16px",
        padding: "30px",
        boxShadow:
            "0 4px 15px rgba(0,0,0,0.08)",
    },

    settingRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px 0",
        borderBottom: "1px solid #e5e7eb",
    },

    settingTitle: {
        margin: 0,
        color: "#111827",
    },

    description: {
        margin: "6px 0 0",
        color: "#6b7280",
        fontSize: "14px",
    },

    select: {
        padding: "9px 15px",
        borderRadius: "8px",
        border: "1px solid #d1d5db",
        fontSize: "14px",
    },

    saveButton: {
        marginTop: "25px",
        padding: "12px 24px",
        border: "none",
        borderRadius: "8px",
        background: "#2563eb",
        color: "white",
        cursor: "pointer",
        fontSize: "16px",
    },

    success: {
        marginTop: "20px",
        padding: "12px",
        borderRadius: "8px",
        background: "#dcfce7",
        color: "#166534",
    },

    error: {
        marginTop: "20px",
        padding: "12px",
        borderRadius: "8px",
        background: "#fee2e2",
        color: "#991b1b",
    },

    message: {
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "#6b7280",
        fontFamily: "Arial, sans-serif",
    },
};

export default Settings;