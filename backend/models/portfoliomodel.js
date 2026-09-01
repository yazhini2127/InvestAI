const db = require("../config/db");

// Get Portfolio
exports.getPortfolio = (userId, callback) => {
  const sql = `
    SELECT * FROM portfolio
    WHERE user_id = ?
    ORDER BY portfolio_id DESC
  `;

  db.query(sql, [userId], callback);
};

// Add Investment
exports.addPortfolio = (data, callback) => {
  const sql = `
    INSERT INTO portfolio
    (user_id, investment_id, quantity, invested_amount, purchase_date)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      data.user_id,
      data.investment_id,
      data.quantity,
      data.invested_amount,
      data.purchase_date,
    ],
    callback
  );
};

// Update Investment
exports.updatePortfolio = (id, data, callback) => {
  const sql = `
    UPDATE portfolio
    SET investment_id=?,
        quantity=?,
        invested_amount=?,
        purchase_date=?
    WHERE portfolio_id=?
  `;

  db.query(
    sql,
    [
      data.investment_id,
      data.quantity,
      data.invested_amount,
      data.purchase_date,
      id,
    ],
    callback
  );
};

// Delete Investment
exports.deletePortfolio = (id, callback) => {
  db.query(
    "DELETE FROM portfolio WHERE portfolio_id=?",
    [id],
    callback
  );
};