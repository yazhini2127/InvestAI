const express = require("express");

const router = express.Router();

const {
    getProfile,
    updateProfile,
    changePassword,
} = require("./controllers/UserController");

// =====================================================
// PROFILE
// =====================================================

router.get(
    "/profile/:id",
    getProfile
);

router.put(
    "/profile/:id",
    updateProfile
);

// =====================================================
// CHANGE PASSWORD
// =====================================================

router.put(
    "/change-password/:id",
    changePassword
);

module.exports = router;