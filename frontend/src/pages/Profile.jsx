import { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import "./Profile.css";

function Profile() {
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const userId = user?.id ?? user?.user_id;

    // =====================================================
    // DEFAULT PROFILE
    // =====================================================

    const defaultProfile = {
        id: userId ?? "",
        username:
            user?.username ??
            user?.full_name ??
            user?.name ??
            "",
        email: user?.email ?? "",
        phone: user?.phone ?? "",
        riskLevel:
            user?.riskLevel ??
            user?.risk_level ??
            "Medium",
        joinedDate:
            user?.joinedDate ??
            user?.joined_date ??
            user?.created_at ??
            "",
    };

    const [profile, setProfile] =
        useState(defaultProfile);

    const [formData, setFormData] = useState({
        username: defaultProfile.username,
        email: defaultProfile.email,
        phone: defaultProfile.phone,
        riskLevel: defaultProfile.riskLevel,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [editing, setEditing] = useState(false);

    // =====================================================
    // PASSWORD
    // =====================================================

    const [showPasswordModal, setShowPasswordModal] =
        useState(false);

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [passwordLoading, setPasswordLoading] =
        useState(false);

    const [passwordError, setPasswordError] =
        useState("");

    const [passwordSuccess, setPasswordSuccess] =
        useState("");

    // =====================================================
    // CONVERT DATABASE USER
    // =====================================================

    const convertUser = useCallback(
        (data) => {
            return {
                id:
                    data.user_id ??
                    data.id ??
                    userId ??
                    "",

                username:
                    data.full_name ??
                    data.username ??
                    data.name ??
                    user?.username ??
                    user?.full_name ??
                    user?.name ??
                    "",

                email:
                    data.email ??
                    user?.email ??
                    "",

                phone:
                    data.phone ??
                    user?.phone ??
                    "",

                riskLevel:
                    data.risk_level ??
                    data.riskLevel ??
                    user?.risk_level ??
                    user?.riskLevel ??
                    "Medium",

                joinedDate:
                    data.created_at ??
                    data.joined_date ??
                    data.joinedDate ??
                    user?.created_at ??
                    user?.joinedDate ??
                    "",
            };
        },
        [
            userId,
            user?.username,
            user?.full_name,
            user?.name,
            user?.email,
            user?.phone,
            user?.risk_level,
            user?.riskLevel,
            user?.created_at,
            user?.joinedDate,
        ]
    );

    // =====================================================
    // LOAD PROFILE
    // =====================================================

    useEffect(() => {
        let mounted = true;

        const loadProfile = async () => {
            if (!userId) {
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

                const response = await api.get(
                    `/users/profile/${userId}`
                );

                if (!mounted) return;

                const data =
                    response.data?.user ??
                    response.data?.data ??
                    response.data;

                if (
                    data &&
                    typeof data === "object"
                ) {
                    const updatedProfile =
                        convertUser(data);

                    setProfile(updatedProfile);

                    setFormData({
                        username:
                            updatedProfile.username,
                        email:
                            updatedProfile.email,
                        phone:
                            updatedProfile.phone,
                        riskLevel:
                            updatedProfile.riskLevel,
                    });
                }
            } catch (err) {
                console.error(
                    "PROFILE LOAD ERROR:",
                    err
                );

                if (!mounted) return;

                if (
                    err?.response?.status === 401
                ) {
                    setError(
                        "Your session has expired. Please login again."
                    );
                } else if (
                    err?.response?.status === 404
                ) {
                    setError(
                        "Profile not found."
                    );
                } else {
                    setError(
                        "Unable to load profile from server."
                    );
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        loadProfile();

        return () => {
            mounted = false;
        };
    }, [userId, convertUser]);

    // =====================================================
    // REFRESH
    // =====================================================

    const handleRefresh = async () => {
        if (!userId) {
            setError(
                "User session not found. Please login again."
            );
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                `/users/profile/${userId}`
            );

            const data =
                response.data?.user ??
                response.data?.data ??
                response.data;

            if (
                data &&
                typeof data === "object"
            ) {
                const updatedProfile =
                    convertUser(data);

                setProfile(updatedProfile);

                if (!editing) {
                    setFormData({
                        username:
                            updatedProfile.username,
                        email:
                            updatedProfile.email,
                        phone:
                            updatedProfile.phone,
                        riskLevel:
                            updatedProfile.riskLevel,
                    });
                }
            }
        } catch (err) {
            console.error(
                "REFRESH PROFILE ERROR:",
                err
            );

            if (
                err?.response?.status === 401
            ) {
                setError(
                    "Your session has expired. Please login again."
                );
            } else if (
                err?.response?.status === 404
            ) {
                setError(
                    "Profile not found."
                );
            } else {
                setError(
                    "Unable to refresh profile."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // EDIT
    // =====================================================

    const handleEdit = () => {
        setFormData({
            username: profile.username,
            email: profile.email,
            phone: profile.phone,
            riskLevel: profile.riskLevel,
        });

        setEditing(true);
        setError("");
    };

    // =====================================================
    // INPUT
    // =====================================================

    const handleChange = (event) => {
        const {
            name,
            value,
        } = event.target;

        setFormData(
            (previous) => ({
                ...previous,
                [name]: value,
            })
        );

        setError("");
    };

    // =====================================================
    // SAVE PROFILE
    // =====================================================

    const handleSave = async () => {
        if (!userId) {
            setError(
                "User session not found. Please login again."
            );
            return;
        }

        const username =
            formData.username.trim();

        const email =
            formData.email.trim();

        const phone =
            formData.phone.trim();

        if (!username) {
            setError(
                "Username cannot be empty."
            );
            return;
        }

        if (!email) {
            setError(
                "Email cannot be empty."
            );
            return;
        }

        try {
            setLoading(true);
            setError("");

            const payload = {
                full_name: username,
                email,
                phone,
                risk_level:
                    formData.riskLevel,
            };

            const response = await api.put(
                `/users/profile/${userId}`,
                payload
            );

            const data =
                response.data?.user ??
                response.data?.data ??
                response.data;

            if (
                data &&
                typeof data === "object"
            ) {
                const updatedProfile =
                    convertUser(data);

                setProfile(updatedProfile);

                setFormData({
                    username:
                        updatedProfile.username,
                    email:
                        updatedProfile.email,
                    phone:
                        updatedProfile.phone,
                    riskLevel:
                        updatedProfile.riskLevel,
                });
            } else {
                const updatedProfile = {
                    ...profile,
                    id: userId,
                    username,
                    email,
                    phone,
                    riskLevel:
                        formData.riskLevel,
                };

                setProfile(updatedProfile);

                setFormData({
                    username,
                    email,
                    phone,
                    riskLevel:
                        formData.riskLevel,
                });
            }

            // Update localStorage user information
            const currentStoredUser =
                localStorage.getItem("user");

            if (currentStoredUser) {
                try {
                    const currentUser =
                        JSON.parse(
                            currentStoredUser
                        );

                    const updatedLocalUser = {
                        ...currentUser,
                        id:
                            currentUser.id ??
                            currentUser.user_id ??
                            userId,
                        user_id:
                            currentUser.user_id ??
                            userId,
                        full_name: username,
                        username,
                        email,
                        phone,
                        risk_level:
                            formData.riskLevel,
                        riskLevel:
                            formData.riskLevel,
                    };

                    localStorage.setItem(
                        "user",
                        JSON.stringify(
                            updatedLocalUser
                        )
                    );
                } catch (storageError) {
                    console.error(
                        "LOCAL STORAGE UPDATE ERROR:",
                        storageError
                    );
                }
            }

            setEditing(false);
        } catch (err) {
            console.error(
                "SAVE PROFILE ERROR:",
                err
            );

            if (
                err?.response?.status === 401
            ) {
                setError(
                    "Your session has expired. Please login again."
                );
            } else {
                setError(
                    err?.response?.data
                        ?.message ??
                    "Unable to save profile."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // CANCEL
    // =====================================================

    const handleCancel = () => {
        setFormData({
            username: profile.username,
            email: profile.email,
            phone: profile.phone,
            riskLevel: profile.riskLevel,
        });

        setEditing(false);
        setError("");
    };

    // =====================================================
    // DATE
    // =====================================================

    const formatDate = (date) => {
        if (!date) {
            return "—";
        }

        const parsedDate = new Date(date);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return String(date);
        }

        return parsedDate.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            }
        );
    };

    // =====================================================
    // INITIAL
    // =====================================================

    const getInitial = () => {
        return (
            profile.username
                ?.charAt(0)
                ?.toUpperCase() || "U"
        );
    };

    // =====================================================
    // PASSWORD INPUT
    // =====================================================

    const handlePasswordChange = (
        event
    ) => {
        const {
            name,
            value,
        } = event.target;

        setPasswordData(
            (previous) => ({
                ...previous,
                [name]: value,
            })
        );

        setPasswordError("");
        setPasswordSuccess("");
    };

    // =====================================================
    // CHANGE PASSWORD
    // =====================================================

    const handleChangePassword =
        async () => {
            if (!userId) {
                setPasswordError(
                    "User session not found. Please login again."
                );
                return;
            }

            const {
                currentPassword,
                newPassword,
                confirmPassword,
            } = passwordData;

            if (
                !currentPassword ||
                !newPassword ||
                !confirmPassword
            ) {
                setPasswordError(
                    "Please fill all password fields."
                );
                return;
            }

            if (
                newPassword.length < 6
            ) {
                setPasswordError(
                    "New password must be at least 6 characters."
                );
                return;
            }

            if (
                newPassword !==
                confirmPassword
            ) {
                setPasswordError(
                    "New password and confirm password do not match."
                );
                return;
            }

            if (
                currentPassword ===
                newPassword
            ) {
                setPasswordError(
                    "New password must be different from current password."
                );
                return;
            }

            try {
                setPasswordLoading(true);
                setPasswordError("");
                setPasswordSuccess("");

                const response =
                    await api.put(
                        `/users/change-password/${userId}`,
                        {
                            currentPassword,
                            newPassword,
                        }
                    );

                setPasswordSuccess(
                    response.data?.message ??
                    "Password changed successfully."
                );

                setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                });
            } catch (err) {
                console.error(
                    "CHANGE PASSWORD ERROR:",
                    err
                );

                setPasswordError(
                    err?.response?.data
                        ?.message ??
                    "Unable to change password."
                );
            } finally {
                setPasswordLoading(false);
            }
        };

    // =====================================================
    // OPEN PASSWORD
    // =====================================================

    const openPasswordModal = () => {
        setShowPasswordModal(true);
        setPasswordError("");
        setPasswordSuccess("");
    };

    // =====================================================
    // CLOSE PASSWORD
    // =====================================================

    const closePasswordModal = () => {
        if (passwordLoading) {
            return;
        }

        setShowPasswordModal(false);

        setPasswordData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        });

        setPasswordError("");
        setPasswordSuccess("");
    };

    // =====================================================
    // UI
    // =====================================================

    return (
        <div className="profile-page">

            {/* HEADER */}

            <div className="profile-header">

                <div>
                    <h1>
                        👤 My Profile
                    </h1>

                    <p>
                        Manage and view your
                        account information
                    </p>
                </div>

                <button
                    type="button"
                    className="profile-refresh-btn"
                    onClick={
                        handleRefresh
                    }
                    disabled={loading}
                >
                    {loading
                        ? "⏳ Loading..."
                        : "🔄 Refresh"}
                </button>

            </div>

            {/* ERROR */}

            {error && (
                <div className="profile-error">
                    ⚠️ {error}
                </div>
            )}

            {/* PROFILE HERO */}

            <div className="profile-card">

                <div className="profile-avatar">
                    {getInitial()}
                </div>

                <div className="profile-main-info">

                    <h2>
                        {profile.username ||
                            "User"}
                    </h2>

                    <p>
                        {profile.email ||
                            "No email available"}
                    </p>

                    <span className="user-id-badge">
                        User ID #
                        {profile.id || "—"}
                    </span>

                </div>

                <button
                    type="button"
                    className="edit-profile-btn"
                    onClick={handleEdit}
                >
                    ✏️ Edit Profile
                </button>

            </div>

            {/* EDIT FORM */}

            {editing && (
                <div className="profile-card edit-card">

                    <div className="card-title">

                        <h2>
                            ✏️ Edit Profile
                        </h2>

                        <p>
                            Update your account
                            information
                        </p>

                    </div>

                    <div className="profile-form">

                        <div className="form-group">

                            <label>
                                👤 Username
                            </label>

                            <input
                                type="text"
                                name="username"
                                value={
                                    formData.username
                                }
                                onChange={
                                    handleChange
                                }
                            />

                        </div>

                        <div className="form-group">

                            <label>
                                📧 Email
                            </label>

                            <input
                                type="email"
                                name="email"
                                value={
                                    formData.email
                                }
                                onChange={
                                    handleChange
                                }
                            />

                        </div>

                        <div className="form-group">

                            <label>
                                📱 Phone
                            </label>

                            <input
                                type="text"
                                name="phone"
                                value={
                                    formData.phone
                                }
                                onChange={
                                    handleChange
                                }
                            />

                        </div>

                        <div className="form-group">

                            <label>
                                📊 Risk Level
                            </label>

                            <select
                                name="riskLevel"
                                value={
                                    formData.riskLevel
                                }
                                onChange={
                                    handleChange
                                }
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

                    </div>

                    <div className="form-actions">

                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={
                                handleCancel
                            }
                            disabled={loading}
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            className="save-profile-btn"
                            onClick={
                                handleSave
                            }
                            disabled={loading}
                        >
                            {loading
                                ? "⏳ Saving..."
                                : "💾 Save Changes"}
                        </button>

                    </div>

                </div>
            )}

            {/* ACCOUNT INFORMATION */}

            {!editing && (
                <div className="profile-card">

                    <div className="card-title">

                        <h2>
                            📋 Account Information
                        </h2>

                        <p>
                            Your personal account
                            details
                        </p>

                    </div>

                    <div className="account-grid">

                        <div className="account-item">

                            <div className="account-icon">
                                👤
                            </div>

                            <div>
                                <span>
                                    Username
                                </span>

                                <strong>
                                    {profile.username ||
                                        "—"}
                                </strong>
                            </div>

                        </div>

                        <div className="account-item">

                            <div className="account-icon">
                                📧
                            </div>

                            <div>
                                <span>
                                    Email
                                </span>

                                <strong>
                                    {profile.email ||
                                        "—"}
                                </strong>
                            </div>

                        </div>

                        <div className="account-item">

                            <div className="account-icon">
                                📱
                            </div>

                            <div>
                                <span>
                                    Phone
                                </span>

                                <strong>
                                    {profile.phone ||
                                        "—"}
                                </strong>
                            </div>

                        </div>

                        <div className="account-item">

                            <div className="account-icon">
                                📊
                            </div>

                            <div>
                                <span>
                                    Risk Level
                                </span>

                                <strong
                                    className={`risk-${String(
                                        profile.riskLevel ||
                                        "medium"
                                    ).toLowerCase()}`}
                                >
                                    {profile.riskLevel ||
                                        "Medium"}
                                </strong>
                            </div>

                        </div>

                        <div className="account-item">

                            <div className="account-icon">
                                🆔
                            </div>

                            <div>
                                <span>
                                    User ID
                                </span>

                                <strong>
                                    #
                                    {profile.id ||
                                        "—"}
                                </strong>
                            </div>

                        </div>

                        <div className="account-item">

                            <div className="account-icon">
                                📅
                            </div>

                            <div>
                                <span>
                                    Joined Date
                                </span>

                                <strong>
                                    {formatDate(
                                        profile.joinedDate
                                    )}
                                </strong>
                            </div>

                        </div>

                    </div>

                </div>
            )}

            {/* SECURITY */}

            <div className="security-card">

                <div className="security-icon">
                    🔐
                </div>

                <div className="security-content">

                    <h2>
                        Security
                    </h2>

                    <p>
                        Keep your InvestAI
                        account secure
                    </p>

                    <button
                        type="button"
                        className="password-btn"
                        onClick={
                            openPasswordModal
                        }
                    >
                        🔑 Change Password
                    </button>

                    <div className="security-warning">
                        ⚠️ Keep your account
                        information secure
                        and never share your
                        password with anyone.
                    </div>

                </div>

            </div>

            {/* PASSWORD MODAL */}

            {showPasswordModal && (
                <div
                    className="password-modal-overlay"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closePasswordModal();
                        }
                    }}
                >

                    <div
                        className="password-modal"
                        onMouseDown={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <div className="password-modal-header">

                            <div>

                                <h2>
                                    🔐 Change Password
                                </h2>

                                <p>
                                    Update your
                                    InvestAI
                                    account
                                    password
                                </p>

                            </div>

                            <button
                                type="button"
                                className="close-password-modal"
                                onClick={
                                    closePasswordModal
                                }
                                disabled={
                                    passwordLoading
                                }
                            >
                                ✕
                            </button>

                        </div>

                        {passwordError && (
                            <div className="password-error">
                                ⚠️{" "}
                                {
                                    passwordError
                                }
                            </div>
                        )}

                        {passwordSuccess && (
                            <div className="password-success">
                                ✅{" "}
                                {
                                    passwordSuccess
                                }
                            </div>
                        )}

                        <div className="password-form">

                            <div className="password-form-group">

                                <label>
                                    Current Password
                                </label>

                                <input
                                    type="password"
                                    name="currentPassword"
                                    value={
                                        passwordData.currentPassword
                                    }
                                    onChange={
                                        handlePasswordChange
                                    }
                                    placeholder="Enter current password"
                                    disabled={
                                        passwordLoading
                                    }
                                />

                            </div>

                            <div className="password-form-group">

                                <label>
                                    New Password
                                </label>

                                <input
                                    type="password"
                                    name="newPassword"
                                    value={
                                        passwordData.newPassword
                                    }
                                    onChange={
                                        handlePasswordChange
                                    }
                                    placeholder="Enter new password"
                                    disabled={
                                        passwordLoading
                                    }
                                />

                            </div>

                            <div className="password-form-group">

                                <label>
                                    Confirm New Password
                                </label>

                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={
                                        passwordData.confirmPassword
                                    }
                                    onChange={
                                        handlePasswordChange
                                    }
                                    placeholder="Confirm new password"
                                    disabled={
                                        passwordLoading
                                    }
                                />

                            </div>

                        </div>

                        <div className="password-modal-actions">

                            <button
                                type="button"
                                className="password-cancel-btn"
                                onClick={
                                    closePasswordModal
                                }
                                disabled={
                                    passwordLoading
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="password-save-btn"
                                onClick={
                                    handleChangePassword
                                }
                                disabled={
                                    passwordLoading
                                }
                            >
                                {passwordLoading
                                    ? "⏳ Changing..."
                                    : "🔒 Change Password"}
                            </button>

                        </div>

                    </div>

                </div>
            )}

            {/* FOOTER */}

            <footer className="profile-footer">
                © 2026 InvestAI • Smart Investing with AI
            </footer>

        </div>
    );
}

export default Profile;