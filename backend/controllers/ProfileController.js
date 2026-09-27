const Profile = require("../models/ProfileModel");
const User = require("../models/UserModel");
const bcrypt = require("bcryptjs");

// ==========================
// Get User Profile
// ==========================
exports.getProfile = (req, res) => {
    const { user_id } = req.params;

    Profile.getProfile(user_id, (err, result) => {
        if (err) {
            console.error("Profile Error:", err);

            return res.status(500).json({
                success: false,
                message: err.message,
            });
        }

        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User profile not found",
            });
        }

        res.status(200).json({
            success: true,
            profile: result[0],
        });
    });
};

// ==========================
// Change Password
// ==========================
exports.changePassword = async (req, res) => {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
        return res.status(401).json({
            success: false,
            message: "Authentication required",
        });
    }

    if (!currentPassword || !newPassword) {
        return res.status(400).json({
            success: false,
            message: "Current password and new password are required",
        });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({
            success: false,
            message: "New password must be at least 6 characters",
        });
    }

    User.findUserById(userId, async (err, result) => {
        if (err) {
            console.error("Find User Error:", err);

            return res.status(500).json({
                success: false,
                message: err.message,
            });
        }

        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const user = result[0];

        try {
            // Check current password using bcrypt
            const isMatch = await bcrypt.compare(
                currentPassword,
                user.password
            );

            if (!isMatch) {
                return res.status(400).json({
                    success: false,
                    message: "Current password is incorrect",
                });
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(
                newPassword,
                10
            );

            // Save hashed password
            User.changePassword(
                userId,
                hashedPassword,
                (err) => {
                    if (err) {
                        console.error(
                            "Change Password Error:",
                            err
                        );

                        return res.status(500).json({
                            success: false,
                            message: err.message,
                        });
                    }

                    return res.status(200).json({
                        success: true,
                        message:
                            "Password changed successfully",
                    });
                }
            );
        } catch (error) {
            console.error(
                "Password Change Error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Failed to change password",
            });
        }
    });
};