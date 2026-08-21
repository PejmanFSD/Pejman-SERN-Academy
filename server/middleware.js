const User = require("./models/users");
// Creating the middleware that assures that the user is logged-in:
module.exports.isLoggedIn = (req, res, next) => {
  // If the "session" of the browser doesn't have the "user_id" -> it means that the user is not logged-in
  if (!req.session.user_id) {
    // Sending the error message (that will be used in the flash message) + the status code of
    // 401 to UI as an object:
    return res.status(401).json({
      error: "You must be logged in!",
    });
  }
  // Otherwise, everything is Ok to continue:
  next();
};
// Creating the middleware that assures that the user is logged-out:
// In order to stop the already logged-in users to login again or register:
module.exports.isLoggedOut = (req, res, next) => {
  // If the "session" of the browser has the "user_id" -> it means that the user is logged-in
  if (req.session.user_id) {
    // Sending the error message (that will be used in the flash message) + the status code of
    // 400 to UI as an object:
    return res.status(400).json({
      error: "You are already logged in. You should logout first!",
    });
  }
  // Otherwise, everything is Ok to continue:
  next();
};
// Creating the middleware that handles specific kinds of errors:
module.exports.handleUserErrors = (err, req, res, next) => {
  // The error numbers of "2627" and "2601" are reserved for the already existed usernames:
  if (err.number === 2627 || err.number === 2601) {
    // Sending the error message (that will be used in the flash message) + the status code of
    // 400 to UI as an object:
    return res.status(400).json({
      message: "Username already taken. Please choose another one.",
    });
  }
  console.error(err);
  // If there's any other kind of error, except the one that's been mentioned above
  // Send the error message (that will be used in the flash message) + the status code of
  // 500 to UI as an object:
  res.status(500).json({
    message: "Something went wrong on the server.",
  });
};
// Creating the middleware that assures that the logged-in user is an admin:
module.exports.isAdmin = async (req, res, next) => {
  try {
    // First check if the user is logged-in:
    if (!req.session.user_id) {
      // If they're not logged-in, Send the error message (that will be used in the flash message)
      // and the status code of 401 to UI as an object:
      return res.status(401).json({
        error: "Not logged in",
      });
    }
    // Fetch the logged-in user (the "findById" function has been already created in the model):
    const user = await User.findById(req.session.user_id);
    // If "findById" returns "null" (for example, if the user was deleted from the database after logging in):
    if (!user) {
      // Send the error message (that will be used in the flash message) + the status code of
      // 401 to UI as an object:
      return res.status(401).json({
        error: "User not found",
      });
    }
    // Check if the logged-in user is admin:
    if (user.role !== "Admin") {
      // Send the error message (that will be used in the flash message) + the status code of
      // 403 to UI as an object:
      return res.status(403).json({
        error: "Admin access only!",
      });
    }
    // If none of the above conditions happens (if everything is OK) then continue:
    next();
  } catch (err) {
    // Catch any other error:
    next(err);
  }
};
