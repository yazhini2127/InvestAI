const Profile = require("../models/ProfileModel");

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