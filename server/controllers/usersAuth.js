const User = require("../models/users");
const isStrongPassword = require("../utils/isStrongPassword.js");
const bcrypt = require("bcrypt");
// The registration controller
module.exports.register = async (req, res) => {
  try {
    // Fetching the values of the <input />s of the registration form
    // (the ones that the user fills when they're registering)
    const { username, password, confirmPassword, role, adminSecret } = req.body;
    // Checking if the password is strong:
    if (!isStrongPassword(password)) { // The "isStrongPassword" function has been already created in the utils folder
      // Send the error message to the front-end by the status code of 400
      return res.status(400).json({
        error: "You should enter a strong password",
      });
    }
    // Confirming the password (The 2 passwords that the user types in the registration <form /> should be the same):
    if (password !== confirmPassword) { // If the 2 passwords of the registration <form /> are not the same
      // Send the error message to the front-end by the status code of 400
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }
    let finalRole = "Student"; // The default role of the user is "Student"
    // Checking the "Admin secret" if the user chooses "Admin as their role":
    if (role === "Admin") {
      if (adminSecret !== process.env.ADMIN_SECRET) { // The Admin secret has been saved in the .env file
        // Send the error message to the front-end by the status code of 403
        return res.status(403).json({
          error: "Invalid admin secret",
        });
      }
      // Changing the default role to "Admin":
      finalRole = "Admin";
    }
    // Hashing the password;
    const passwordHash = await bcrypt.hash(password, 12);
    // Creating the user by the username, passwordHash and finalRole that have been chosen by the user:
    const result = await User.createUser(username, passwordHash, finalRole); // The "createUser" function has been
    // already created in the model
    // Fetching the user_id:
    const userId = result.recordset[0].user_id; // Fetching the user_id of the first element of the value of recordset result
    // The result of the "createUser" function is saved as the value of a key called "recordset"
    // Implementing the user_id to session:
    req.session.user_id = userId;
    // Assigning the created user to the "res" and sending it + its message
    // (the one that will appear in the flash message) to UI as an object:
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
    if (e.number === 2627 || e.number === 2601) { // The status codes of this error are "2627" and "2601"
      // Sending the error message to UI with the status code of 400
      return res.status(400).json({
        message: "Username already taken. Please choose another one.",
      });
    }
    // Finally if there's any other error:
    res.status(500).json({ // Send it to UI with an error message
      error: "Server error",
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
            error: "Invalid username or password"
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
            role: foundUser.role
        }
    });
};
// The logout controller
module.exports.logout = (req, res) => {
  // Removing session from server store:
  req.session.destroy((err) => { // The "destroy" function is a built-in function of JavaScript
    if (err) { // if there's any kind of error
      // Return the error to UI with the following message and the status code of 500
      return res.status(500).json({
        error: "Logout failed"
      });
    }
    // Removing the cookie from browser:
    res.clearCookie("connect.sid"); // "" is a built-in function of JavaScript
    // Sending the success message to UI with the status code of 200
    return res.status(200).json({
      message: "Successfully logged out!"
    });
  });
};
// The current logged-in controller:
module.exports.currentUser = async (req, res) => {
  // If the user (the id) doesn't exist:
    if (!req.session.user_id) {
      // return "null" as the loged-in user:
        return res.json({
            user: null
        });
    }
    // Fetch the user based on the imported id and the "findById" middleware from the router file
    // and assign it to a variable called "user":
    const user = await User.findById(req.session.user_id);
    // If the user (the id) doesn't exist, return null:
    if (!user) {
        return res.json({
            user: null
        });
    }
    // Returning the found user to UI as an object:
    return res.json({
        user: {
            id: user.user_id,
            username: user.username,
            role: user.role
        }
    });
};