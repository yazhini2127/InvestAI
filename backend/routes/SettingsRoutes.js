const express = require("express");

const router = express.Router();

const {
    getSettings,
    updateSettings,
} = require("../controllers/SettingsController");

// Get Settings
router.get("/:user_id", getSettings);

// Update Settings
router.put("/:user_id", updateSettings);

module.exports = router;