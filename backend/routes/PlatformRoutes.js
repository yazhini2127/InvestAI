const express = require("express");

const router = express.Router();

const {
    getPlatforms
} = require("../controllers/PlatformController");

router.get("/", getPlatforms);

module.exports = router;