const User = require("../models/users");
const isStrongPassword = require("../utils/isStrongPassword.js");
const bcrypt = require("bcrypt");

// GET all registered users
module.exports.index = async (req, res) => {
  // Fetching the page where the user is
  let page = parseInt(req.query.page) || 1;
  // Fetching the value that we're searching (if there's nothing in the search input, the it would be ""):
  const search = req.query.search || "";
  // The exception of the page:
  if (page < 1) {
    page = 1;
  }
  // Fetching all the registered users and assigning it to the "users" variable:
  const { users, totalUsers } = await User.getAllUsers(page, search);

  const pageSize = 5; // Each page has 5 users
  const totalPages = Math.ceil(totalUsers / pageSize); // Calculating the "totalPages" number
  // Sending all the users to the front-end as an object
  res.status(200).json({
    users: users.map((user) => ({
      id: user.user_id,
      username: user.username,
      role: user.role,
    })),
    totalPages,
  });
};
// GET one specific registered user
module.exports.showUser = async (req, res) => {
  // Fetching the registered user by their id that has been saved in session
  // and assigning it to the "user" variable:
  const user = await User.findById(req.session.user_id); // The "findById" function has been already created in the model
  // Error-Handling; if the user doesn't exist or the authentication is not correct:
  if (!user) {
    // Sending the error message to the front-end by the status code of 404
    return res.status(404).json({
      error: "User not found",
    });
  }
  // Returning the user to UI as an object:
  res.status(200).json({
    user: {
      id: user.user_id,
      username: user.username,
      role: user.role,
    },
  });
};
// UPDATE one specific registered user
module.exports.editUser = async (req, res) => {
  const { username } = req.body; // Fetching the username of the user from the update <form /> that the user fills
  // Creating the new user by the already fetched username and the user's id
  // The "updateUsername" function has been already created in the model
  const user = await User.updateUsername(
    req.session.user_id, // Fetching the user's id from the session
    username,
  );
  // Error-Handling; if the user doesn't exist or the authentication is not correct:
  if (!user) {
    // Sending the error message to the front-end by the status code of 404
    return res.status(404).json({
      error: "User not found",
    });
  }
  // Returning the user + the message (the one that will be used in the flash message) to UI as an object:
  res.status(200).json({
    message: "Profile edited successfully!",
    user: {
      id: user.user_id,
      username: user.username,
      role: user.role,
    },
  });
};
// The specific separate function for changing the hashed password
module.exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body; // Fetching the currentPassword and the newPassword of
  // the user from the update <form /> that the user fills
  const userId = req.session.user_id; // Fetching the user's id from the session
  // Finding the current password hash by the user's id
  const passwordHash = await User.findPasswordHash(userId); // The "findPasswordHash" function has been already
  // created in the model
  // Error-Handling; if the passwordHash doesn't exist:
  if (!passwordHash) {
    // Sending the error message to the front-end by the status code of 404
    return res.status(404).json({
      message: "User not found",
    });
  }
  // Checking if the currentPassword (the one that the user enters in the update <form />) and the one in the
  // database (passwordHash) are the same or not
  // The "compare" function is a built-in function of JavaScript -> the "isMatch" function returns a boolean
  const isMatch = await bcrypt.compare(currentPassword, passwordHash);
  // If the "isMatch" function returns false = If the currentPassword (the one that the user enters in the update <form />)
  // and the one in the database (passwordHash) are not the same
  if (!isMatch) {
    // Sending the error message to the front-end by the status code of 404
    return res.status(400).json({
      message: "Current password is incorrect",
    });
  }
  // Making sure if the new password is different from the old one
  if (currentPassword === newPassword) {
    // If not
    // Sending the error message to the front-end by the status code of 400
    return res.status(400).json({
      message: "New password must be different from current password",
    });
  }
  // Checking if the password is strong
  if (!isStrongPassword(newPassword)) {
    // The "isStrongPassword" function has been already created in the utils folder
    // Sending the error message to the front-end by the status code of 400
    return res.status(400).json({
      error: "Your new password should be strong!",
    });
  }
  // Hashing the new password
  const newPasswordHash = await bcrypt.hash(newPassword, 12); // The "hash" function is a built-in function of JavaScript
  // Saving the new hashed password:
  await User.updatePassword(userId, newPasswordHash); // The "updatePassword" function has been already created in the model
  // Returning the message (the one that will be used in the flash message) to UI as an object:
  res.status(200).json({
    message: "Password updated successfully",
  });
};
// The controller for fetching the total number of the registered users:
module.exports.getUserCount = async (req, res) => {
  // Assigning the total number of the registered users to a variable called "count":
  const count = await User.getUserCount(); // The "getUserCount" function has been already created in the model
  // Returning the "count" variable to UI as an object:
  res.status(200).json({
    count,
  });
};
// DELETE one specific registered user
module.exports.deleteUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10); // Fetching the user's id from the router
    // And we use the "10" number so that JavaScript knows that we're parsing a base-10 integer
    const deletedUser = await User.deleteUser(userId); // Fetching + Deleting the user whose id is the fetched id from the router
    // and assigning it to a variable called "deletedUser"
    // The "deleteUser" function has been already created in the model
    if (!deletedUser) {
      // If there's no user with the fetched id
      // Send the error message to the front-end by the status code of 404
      return res.status(404).json({
        error: "User not found",
      });
    }
    // Returning the message (the one that will be used in the flash message) to UI as an object:
    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (err) {
      console.error("DELETE USER ERROR:", err);
      res.status(500).json({
          error: err.message
      });
  }
};
