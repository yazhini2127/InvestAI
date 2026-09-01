const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ==========================
// Register User
// ==========================
exports.register = async (req, res) => {
    try {
        const {
            full_name,
            email,
            phone,
            password,
            risk_level
        } = req.body;

        // Check Empty Fields
        if (!full_name || !email || !phone || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Check Existing User
        db.query(
            "SELECT * FROM users WHERE email = ?",
            [email],
            async (err, result) => {

                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: err.message
                    });
                }

                if (result.length > 0) {
                    return res.status(400).json({
                        success: false,
                        message: "Email already exists"
                    });
                }

                // Hash Password
                const hashedPassword = await bcrypt.hash(password, 10);

                // Insert User
                const sql = `
                    INSERT INTO users
                    (full_name, email, password, phone, risk_level)
                    VALUES (?, ?, ?, ?, ?)
                `;

                db.query(
                    sql,
                    [
                        full_name,
                        email,
                        hashedPassword,
                        phone,
                        risk_level || "Medium"
                    ],
                    (err, result) => {

                        if (err) {
                            return res.status(500).json({
                                success: false,
                                message: err.message
                            });
                        }

                        res.status(201).json({
                            success: true,
                            message: "Registration Successful",
                            user_id: result.insertId
                        });
                    }
                );
            }
        );

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ==========================
// Login User
// ==========================
exports.login = (req, res) => {

    const { email, password } = req.body;

    // Check Empty Fields
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and Password are required"
        });
    }

    // Find User
    db.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        async (err, result) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            if (result.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid Email"
                });
            }

            const user = result[0];

            // Compare Password
            const isMatch = await bcrypt.compare(
                password,
                user.password
            );

            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid Password"
                });
            }

            // JWT Token
            const token = jwt.sign(
                {
                    id: user.user_id,
                    email: user.email
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "1d"
                }
            );

            // Login Success
            res.status(200).json({
                success: true,
                message: "Login Successful",
                token,

                user: {
                    id: user.user_id,
                    name: user.full_name,
                    email: user.email,
                    phone: user.phone,
                    riskLevel: user.risk_level
                }
            });
        }
    );
};