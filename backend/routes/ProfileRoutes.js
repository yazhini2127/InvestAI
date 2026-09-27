const express = require("express");

const router = express.Router();

const {
    getProfile,
    changePassword,
} = require("../controllers/ProfileController");

const authMiddleware = require("../middleware/authMiddleware");

// Get Profile
router.get("/:user_id", getProfile);

// Change Password
router.put("/change-password/:userId", authMiddleware, changePassword);

module.exports = router;