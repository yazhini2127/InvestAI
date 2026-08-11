const express = require("express");

const router = express.Router();

const {
    getSIPPlans,
} = require("../controllers/SIPController");

// Get SIP Plans
router.get("/:user_id", getSIPPlans);

module.exports = router;