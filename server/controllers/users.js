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
