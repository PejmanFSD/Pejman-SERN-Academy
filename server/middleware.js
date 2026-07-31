module.exports.isLoggedIn = (req, res, next) => {
    if (!req.session.user_id) {
        return res.status(401).json({
            error: "You must be logged in!"
        });
    }
    next();
};
// In order to stop the already logged-in users to login again or register:
module.exports.isLoggedOut = (req, res, next) => {
  if (req.session.user_id) {
    return res.status(400).json({
      error: "You are already logged in. You should logout first!"
    });
  }
  next();
};

module.exports.handleUserErrors = (err, req, res, next) => {
    if (err.number === 2627 || err.number === 2601) {
        return res.status(400).json({
            message: "Username already taken. Please choose another one."
        });
    }
    console.error(err);
    res.status(500).json({
        message: "Something went wrong on the server."
    });
};