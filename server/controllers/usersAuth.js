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

module.exports.login = async (req, res) => {
    const { username, password } = req.body;
    // Checking if the username exists and if the password is correct:
    const foundUser = await User.findAndValidate(username, password);

    if (!foundUser) {
        return res.status(401).json({
            error: "Invalid username or password"
        });
    }
    // Saving the user's information in the session:
    req.session.user_id = foundUser.user_id;
    req.session.role = foundUser.role;
    // Returning the logged-in user
    res.status(200).json({
        message: "Successfully logged in!",
        user: {
            id: foundUser.user_id,
            username: foundUser.username,
            role: foundUser.role
        }
    });
};

module.exports.logout = (req, res) => {
  // Removing session from server store:
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        error: "Logout failed"
      });
    }
    // Removing the cookie from browser:
    res.clearCookie("connect.sid");
    return res.status(200).json({
      message: "Successfully logged out!"
    });
  });
};

module.exports.currentUser = async (req, res) => {
  // If the user (the id) doesn't exist:
    if (!req.session.user_id) {
        return res.json({
            user: null
        });
    }
    // Fetch the user based on the imported id and the "findById" middleware from the router file:
    const user = await User.findById(req.session.user_id);
    // If the user (the id) doesn't exist, return null:
    if (!user) {
        return res.json({
            user: null
        });
    }
    // Returning the found user:
    return res.json({
        user: {
            id: user.user_id,
            username: user.username,
            role: user.role
        }
    });
};