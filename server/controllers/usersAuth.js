const User = require("../models/users");
const isStrongPassword = require("../utils/isStrongPassword.js");
const bcrypt = require("bcrypt");
// The registration controller
module.exports.register = async (req, res) => {
  try {
    const {
      username,
      password,
      confirmPassword,
      role,
      adminSecret,
      expertise,
    } = req.body;

    // Check password strength
    if (!isStrongPassword(password)) {
      return res.status(400).json({
        error: "You should enter a strong password",
      });
    }

    // Check password confirmation
    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    // Validate Teacher expertise
    let uniqueExpertise = [];

    if (role === "Teacher") {
      if (!Array.isArray(expertise) || expertise.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Teachers must select at least one subject of expertise.",
        });
      }

      const numericExpertise = expertise.map(Number);

      if (numericExpertise.some((id) => !Number.isInteger(id) || id <= 0)) {
        return res.status(400).json({
          success: false,
          message: "Invalid expertise subject IDs.",
        });
      }

      uniqueExpertise = [...new Set(numericExpertise)];
    }

    // Validate the role
    let finalRole = "Student";

    if (role === "Student") {
      finalRole = "Student";
    } else if (role === "Teacher") {
      finalRole = "Teacher";
    } else if (role === "Principal") {
      finalRole = "Principal";
    } else if (role === "Admin") {
      if (
        !process.env.ADMIN_SECRET ||
        adminSecret !== process.env.ADMIN_SECRET
      ) {
        return res.status(403).json({
          error: "Invalid admin secret",
        });
      }

      finalRole = "Admin";
    } else {
      return res.status(400).json({
        error: "Invalid role selected",
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user and expertise within one transaction
    const userId = await User.registerUserWithExpertise(
      username,
      passwordHash,
      finalRole,
      uniqueExpertise,
    );

    // Log in the newly registered user
    req.session.user_id = userId;

    return res.status(201).json({
      message: "Successfully registered!",
      user: {
        id: userId,
        username,
        role: finalRole,
      },
    });
  } catch (e) {
    // IMPORTANT: Log the actual error to the backend terminal
    console.error("Error in registration:", e);

    // Duplicate username
    if (e.number === 2627 || e.number === 2601) {
      return res.status(400).json({
        message: "Username already taken. Please choose another one.",
      });
    }

    return res.status(500).json({
      error: "Server error",
      message: e.message,
    });
  }
};
// The login controller
module.exports.login = async (req, res) => {
  // Fetching the values of the <input />s of the login form
  // (the ones that the user fills when they're signing in)
  const { username, password } = req.body;
  // Checking if the username exists and if the password is correct
  // if they do, create the user with them and assign it to a variable called "foundUser":
  const foundUser = await User.findAndValidate(username, password);
  // Error-Handling; if the user doesn't exist or the authentication is not correct:
  if (!foundUser) {
    // Send the error message to the front-end by the status code of 401
    return res.status(401).json({
      error: "Invalid username or password",
    });
  }
  // Saving the user's information in the session:
  req.session.user_id = foundUser.user_id;
  req.session.role = foundUser.role;
  // Returning the logged-in user + its message to UI as an object:
  res.status(200).json({
    message: "Successfully logged in!",
    user: {
      id: foundUser.user_id,
      username: foundUser.username,
      role: foundUser.role,
    },
  });
};
// The logout controller
module.exports.logout = (req, res) => {
  // Removing session from server store:
  req.session.destroy((err) => {
    // The "destroy" function is a built-in function of JavaScript
    if (err) {
      // if there's any kind of error
      // Return the error to UI with the following message and the status code of 500
      return res.status(500).json({
        error: "Logout failed",
      });
    }
    // Removing the cookie from browser:
    res.clearCookie("connect.sid"); // "" is a built-in function of JavaScript
    // Sending the success message to UI with the status code of 200
    return res.status(200).json({
      message: "Successfully logged out!",
    });
  });
};
// The current logged-in controller:
module.exports.currentUser = async (req, res) => {
  // If the user (the id) doesn't exist:
  if (!req.session.user_id) {
    // return "null" as the loged-in user:
    return res.json({
      user: null,
    });
  }
  // Fetch the user based on the imported id and the "findById" middleware from the router file
  // and assign it to a variable called "user":
  const user = await User.findById(req.session.user_id);
  // If the user (the id) doesn't exist, return null:
  if (!user) {
    return res.json({
      user: null,
    });
  }
  // Returning the found user to UI as an object:
  return res.json({
    user: {
      id: user.user_id,
      username: user.username,
      role: user.role,
    },
  });
};
