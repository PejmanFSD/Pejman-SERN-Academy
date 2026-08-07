const User = require("../models/users");
const isStrongPassword = require("../utils/isStrongPassword.js");
const bcrypt = require("bcrypt");

module.exports.index = async (req, res) => {
  const users = await User.getAllUsers();
  res.status(200).json({
    users: users.map((user) => ({
      id: user.user_id,
      username: user.username,
      role: user.role,
    })),
  });
};

module.exports.showUser = async (req, res) => {
    const user = await User.findById(req.session.user_id);
    // Error-Handling; if the user doesn't exist or the authentication is not correct:
    if (!user) {
        return res.status(404).json({
            error: "User not found"
        });
    }
    // Returning the user to UI:
    res.status(200).json({
        user: {
            id: user.user_id,
            username: user.username,
            role: user.role
        }
    });
};

module.exports.editUser = async (req, res) => {
    const { username } = req.body;
    const user = await User.updateUsername(
        req.session.user_id,
        username
    );
    if (!user) {
        return res.status(404).json({
            error: "User not found"
        });
    }
    res.status(200).json({
        message: "Profile edited successfully!",
        user: {
            id: user.user_id,
            username: user.username,
            role: user.role
        }
    });
};