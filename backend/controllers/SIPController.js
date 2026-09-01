const SIP = require("../models/SIPModel");

// ==========================
// Get SIP Plans
// ==========================
exports.getSIPPlans = (req, res) => {
    const { user_id } = req.params;

    SIP.getSIPPlans(user_id, (err, result) => {
        if (err) {
            console.error("SIP Error:", err);

            return res.status(500).json({
                success: false,
                message: err.message,
            });
        }

        res.status(200).json({
            success: true,
            sipPlans: result,
        });
    });
};