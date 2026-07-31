const User = require("../models/users");
const isStrongPassword = require("../utils/isStrongPassword.js");
const bcrypt = require("bcrypt");

module.exports.register = async (req, res) => {
  try {
    const { username, password, confirmPassword, role, adminSecret } = req.body;
    // Checking if the password is strong:
    if (!isStrongPassword(password)) {
      return res.status(400).json({
        error: "You should enter a strong password",
      });
    }
    // Confirming the password:
    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }
    let finalRole = "Student";
    // Checking the "Admin secret":
    if (role === "Admin") {
      if (adminSecret !== process.env.ADMIN_SECRET) {
        return res.status(403).json({
          error: "Invalid admin secret",
        });
      }
      finalRole = "Admin";
    }
    // Hashing the password;
    const passwordHash = await bcrypt.hash(password, 12);
    // Creating the user:
    const result = await User.createUser(username, passwordHash, finalRole);
    // Fetching the user_id:
    const userId = result.recordset[0].user_id;
    // Implementing the user_id to session:
    req.session.user_id = userId;
    // Assigning the created user to the "res":
    res.status(201).json({
      message: "Successfully registered!",
      user: {
        id: userId,
        username,
        role: finalRole,
      },
    });
    // Catch block:
  } catch (e) {
    // Checking if the username is already in the database:
    if (e.number === 2627 || e.number === 2601) {
      return res.status(400).json({
        message: "Username already taken. Please choose another one.",
      });
    }
    res.status(500).json({
      error: "Server error",
    });
  }
};
