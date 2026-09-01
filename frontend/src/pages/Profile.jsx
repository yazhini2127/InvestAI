import { useEffect, useState } from "react";
import api from "../services/api";

function Profile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const userId = 2;

    const loadProfile = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                `/profile/${userId}`
            );

            if (response.data.success) {
                setProfile(response.data.profile);
            }
        } catch (err) {
            console.error("Profile Error:", err);

            setError(
                err.response?.data?.message ||
                "Failed to load profile"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let ignore = false;

        const fetchProfile = async () => {
            try {
                const response = await api.get(
                    `/profile/${userId}`
                );

                if (!ignore) {
                    if (response.data.success) {
                        setProfile(response.data.profile);
                    } else {
                        setError("Failed to load profile");
                    }

                    setLoading(false);
                }
            } catch (err) {
                console.error(err);

                if (!ignore) {
                    setError(
                        err.response?.data?.message ||
                        "Failed to load profile"
                    );

                    setLoading(false);
                }
            }
        };

        fetchProfile();

        return () => {
            ignore = true;
        };
    }, []);

    return (
        <div style={styles.container}>

            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>
                        👤 My Profile
                    </h1>

                    <p style={styles.subtitle}>
                        Manage and view your account information
                    </p>
                </div>

                <button
                    style={styles.refreshButton}
                    onClick={loadProfile}
                >
                    🔄 Refresh
                </button>
            </div>

            {loading && (
                <div style={styles.message}>
                    Loading profile...
                </div>
            )}

            {!loading && error && (
                <div style={styles.error}>
                    {error}
                </div>
            )}

            {!loading &&
                !error &&
                profile && (
                    <div style={styles.card}>

                        <div style={styles.avatar}>
                            {profile.full_name
                                ?.charAt(0)
                                .toUpperCase()}
                        </div>

                        <h2 style={styles.name}>
                            {profile.full_name}
                        </h2>

                        <p style={styles.email}>
                            {profile.email}
                        </p>

                        <div style={styles.details}>

                            <div style={styles.detailBox}>
                                <span style={styles.label}>
                                    User ID
                                </span>

                                <strong style={styles.value}>
                                    #{profile.user_id}
                                </strong>
                            </div>

                            <div style={styles.detailBox}>
                                <span style={styles.label}>
                                    Phone
                                </span>

                                <strong style={styles.value}>
                                    {profile.phone || "Not provided"}
                                </strong>
                            </div>

                            <div style={styles.detailBox}>
                                <span style={styles.label}>
                                    Risk Level
                                </span>

                                <strong
                                    style={{
                                        ...styles.risk,
                                        ...(profile.risk_level ===
                                        "Low"
                                            ? styles.low
                                            : profile.risk_level ===
                                              "High"
                                            ? styles.high
                                            : styles.medium),
                                    }}
                                >
                                    {profile.risk_level}
                                </strong>
                            </div>

                            <div style={styles.detailBox}>
                                <span style={styles.label}>
                                    Joined Date
                                </span>

                                <strong style={styles.value}>
                                    {new Date(
                                        profile.created_at
                                    ).toLocaleDateString(
                                        "en-IN"
                                    )}
                                </strong>
                            </div>

                        </div>

                    </div>
                )}

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
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
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

    refreshButton: {
        padding: "10px 20px",
        border: "none",
        borderRadius: "8px",
        background: "#2563eb",
        color: "white",
        cursor: "pointer",
        fontSize: "15px",
    },

    card: {
        maxWidth: "800px",
        margin: "0 auto",
        background: "white",
        borderRadius: "16px",
        padding: "35px",
        textAlign: "center",
        boxShadow:
            "0 4px 15px rgba(0,0,0,0.08)",
    },

    avatar: {
        width: "90px",
        height: "90px",
        margin: "0 auto 15px",
        borderRadius: "50%",
        background: "#2563eb",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "36px",
        fontWeight: "bold",
    },

    name: {
        margin: "10px 0 5px",
        color: "#111827",
        fontSize: "26px",
    },

    email: {
        color: "#6b7280",
        marginBottom: "30px",
    },

    details: {
        display: "grid",
        gridTemplateColumns:
            "repeat(2, 1fr)",
        gap: "15px",
        textAlign: "left",
    },

    detailBox: {
        padding: "18px",
        borderRadius: "10px",
        background: "#f9fafb",
    },

    label: {
        display: "block",
        fontSize: "12px",
        color: "#6b7280",
        marginBottom: "7px",
    },

    value: {
        fontSize: "16px",
        color: "#111827",
    },

    risk: {
        display: "inline-block",
        padding: "5px 12px",
        borderRadius: "20px",
        fontSize: "13px",
    },

    low: {
        background: "#dcfce7",
        color: "#166534",
    },

    medium: {
        background: "#fef3c7",
        color: "#92400e",
    },

    high: {
        background: "#fee2e2",
        color: "#991b1b",
    },

    message: {
        textAlign: "center",
        padding: "50px",
        color: "#6b7280",
    },

    error: {
        padding: "20px",
        background: "#fee2e2",
        color: "#b91c1c",
        borderRadius: "10px",
    },
};

export default Profile;