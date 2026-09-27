const {
    getAllPlatforms
} = require("../models/PlatformModel");

const getPlatforms = (req, res) => {

    getAllPlatforms((error, results) => {

        if (error) {

            console.error(
                "❌ Platform Error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Failed to load platforms",
                error: error.message
            });
        }

        return res.status(200).json({
            success: true,
            data: results
        });
    });
};

module.exports = {
    getPlatforms
};