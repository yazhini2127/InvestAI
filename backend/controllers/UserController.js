const bcrypt = require("bcryptjs");
const db = require("../config/db");

// =====================================================
// GET PROFILE
// =====================================================

const getProfile = async (req, res) => {
    try {
        const userId = req.params.id;

        const [users] = await db.query(
            `
            SELECT
                id,
                username,
                email,
                phone,
                risk_level,
                created_at
            FROM users
            WHERE id = ?
            `,
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                message: "User not found.",
            });
        }

        const user = users[0];

        return res.status(200).json({
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                phone: user.phone,
                riskLevel: user.risk_level,
                joinedDate: user.created_at,
            },
        });

    } catch (error) {
        console.error(
            "GET PROFILE ERROR:",
            error
        );

        return res.status(500).json({
            message: "Server error while loading profile.",
        });
    }
};

// =====================================================
// UPDATE PROFILE
// =====================================================

const updateProfile = async (req, res) => {
    try {
        const userId = req.params.id;

        const {
            username,
            email,
            phone,
            riskLevel,
        } = req.body;

        if (!username || !email) {
            return res.status(400).json({
                message:
                    "Username and email are required.",
            });
        }

        const [existingUsers] = await db.query(
            "SELECT id FROM users WHERE id = ?",
            [userId]
        );

        if (existingUsers.length === 0) {
            return res.status(404).json({
                message: "User not found.",
            });
        }

        await db.query(
            `
            UPDATE users
            SET
                username = ?,
                email = ?,
                phone = ?,
                risk_level = ?
            WHERE id = ?
            `,
            [
                username.trim(),
                email.trim(),
                phone || "",
                riskLevel || "Medium",
                userId,
            ]
        );

        const [users] = await db.query(
            `
            SELECT
                id,
                username,
                email,
                phone,
                risk_level,
                created_at
            FROM users
            WHERE id = ?
            `,
            [userId]
        );

        const user = users[0];

        return res.status(200).json({
            message: "Profile updated successfully.",
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                phone: user.phone,
                riskLevel: user.risk_level,
                joinedDate: user.created_at,
            },
        });

    } catch (error) {
        console.error(
            "UPDATE PROFILE ERROR:",
            error
        );

        return res.status(500).json({
            message: "Server error while updating profile.",
        });
    }
};

// =====================================================
// CHANGE PASSWORD
// =====================================================

const changePassword = async (req, res) => {
    try {
        const userId = req.params.id;

        const {
            currentPassword,
            newPassword,
        } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message:
                    "Current password and new password are required.",
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                message:
                    "New password must be at least 6 characters.",
            });
        }

        const [users] = await db.query(
            `
            SELECT
                id,
                password
            FROM users
            WHERE id = ?
            `,
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                message: "User not found.",
            });
        }

        const user = users[0];

        const passwordMatch = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message:
                    "Current password is incorrect.",
            });
        }

        const hashedPassword =
            await bcrypt.hash(
                newPassword,
                10
            );

        await db.query(
            `
            UPDATE users
            SET password = ?
            WHERE id = ?
            `,
            [
                hashedPassword,
                userId,
            ]
        );

        return res.status(200).json({
            message:
                "Password changed successfully.",
        });

    } catch (error) {
        console.error(
            "CHANGE PASSWORD ERROR:",
            error
        );

        return res.status(500).json({
            message:
                "Server error while changing password.",
        });
    }
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
    getProfile,
    updateProfile,
    changePassword,
};