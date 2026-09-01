const express = require("express");

const router = express.Router();

const {
    getProfile,
} = require("../controllers/ProfileController");

// Get Profile
router.get("/:user_id", getProfile);

module.exports = router;