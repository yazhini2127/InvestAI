const db = require("../config/db");

// Create User
const createUser = (user, callback) => {
  const sql = `
    INSERT INTO users (full_name, email, password, phone, risk_level)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      user.full_name,
      user.email,
      user.password,
      user.phone,
      user.risk_level,
    ],
    callback
  );
};

// Find User by Email
const findUserByEmail = (email, callback) => {
  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], callback);
};

module.exports = {
  createUser,
  findUserByEmail,
};