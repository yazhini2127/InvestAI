const Settings = require("../models/SettingsModel");

// Get Settings
exports.getSettings = (req, res) => {
    const { user_id } = req.params;

    Settings.getSettings(user_id, (err, result) => {
        if (err) {
            console.error("Settings Error:", err);

            return res.status(500).json({
                success: false,
                message: err.message,
            });
        }

        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Settings not found",
            });
        }

        res.json({
            success: true,
            settings: result[0],
        });
    });
};

// Update Settings
exports.updateSettings = (req, res) => {
    const { user_id } = req.params;

    const {
        notifications,
        dark_mode,
        email_alerts,
        risk_level,
    } = req.body;

    Settings.updateSettings(
        user_id,
        {
            notifications,
            dark_mode,
            email_alerts,
            risk_level,
        },
        (err, result) => {
            if (err) {
                console.error("Update Settings Error:", err);

                return res.status(500).json({
                    success: false,
                    message: err.message,
                });
            }

            res.json({
                success: true,
                message: "Settings updated successfully",
            });
        }
    );
};