const Portfolio = require("../models/PortfolioModel");

// ==========================
// Get Portfolio
// ==========================
exports.getPortfolio = (req, res) => {
  const { user_id } = req.params;

  Portfolio.getPortfolio(user_id, (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    res.status(200).json({
      success: true,
      portfolio: result,
    });
  });
};

// ==========================
// Add Investment
// ==========================
exports.addPortfolio = (req, res) => {
  const {
    user_id,
    investment_id,
    quantity,
    invested_amount,
    purchase_date,
  } = req.body;

  if (
    !user_id ||
    !investment_id ||
    !quantity ||
    !invested_amount ||
    !purchase_date
  ) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  Portfolio.addPortfolio(req.body, (err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    res.status(201).json({
      success: true,
      message: "Investment Added Successfully",
    });
  });
};

// ==========================
// Update Investment
// ==========================
exports.updatePortfolio = (req, res) => {
  const { id } = req.params;

  Portfolio.updatePortfolio(id, req.body, (err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    res.json({
      success: true,
      message: "Portfolio Updated Successfully",
    });
  });
};

// ==========================
// Delete Investment
// ==========================
exports.deletePortfolio = (req, res) => {
  const { id } = req.params;

  Portfolio.deletePortfolio(id, (err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    res.json({
      success: true,
      message: "Portfolio Deleted Successfully",
    });
  });
};