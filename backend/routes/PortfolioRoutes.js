const express = require("express");
const router = express.Router();

const {
  getPortfolio,
  addPortfolio,
  updatePortfolio,
  deletePortfolio,
} = require("../controllers/PortfolioController");

// Get Portfolio
router.get("/:user_id", getPortfolio);

// Add Investment
router.post("/", addPortfolio);

// Update Investment
router.put("/:id", updatePortfolio);

// Delete Investment
router.delete("/:id", deletePortfolio);

module.exports = router;
