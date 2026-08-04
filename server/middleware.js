const User = require("./models/users");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.session.user_id) {
    return res.status(401).json({
      error: "You must be logged in!",
    });
  }
  next();
};
// In order to stop the already logged-in users to login again or register:
module.exports.isLoggedOut = (req, res, next) => {
  if (req.session.user_id) {
    return res.status(400).json({
      error: "You are already logged in. You should logout first!",
    });
  }
  next();
};

module.exports.handleUserErrors = (err, req, res, next) => {
  if (err.number === 2627 || err.number === 2601) {
    return res.status(400).json({
      message: "Username already taken. Please choose another one.",
    });
  }
  console.error(err);
  res.status(500).json({
    message: "Something went wrong on the server.",
  });
};

module.exports.isAdmin = async (req, res, next) => {
  try {
    // First check if the user is logged-in:
    if (!req.session.user_id) {
      return res.status(401).json({
        error: "Not logged in",
      });
    }
    // Fetch the logged-in user:
    const user = await User.findById(req.session.user_id);
    // If "findById" returns "null" (for example, if the user was deleted from the database after logging in):
    if (!user) {
      return res.status(401).json({
        error: "User not found",
      });
    }
    // Check if the logged-in user is admin:
    if (user.role !== "Admin") {
      return res.status(403).json({
        error: "Admin access only!",
      });
    }
    // If none of the above conditions happens (if everything is OK):
    next();
  } catch (err) {
    next(err);
  }
};
