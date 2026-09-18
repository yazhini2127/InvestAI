const mysql = require("mysql2");

const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: process.env.DB_SSL === "true"
    ? { rejectUnauthorized: true }
    : undefined,
});

db.getConnection((err, connection) => {
  if (err) {
    console.log("❌ Database Connection Failed");
    console.log(err);
  } else {
    console.log("✅ MySQL Connected Successfully");
    connection.release();
  }
});

// Callback style preserved (db.query(sql, callback)) so existing routes don't break.
// If you want async/await later, use: const dbPromise = db.promise();
module.exports = db;