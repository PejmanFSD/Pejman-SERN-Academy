const express = require("express");
const router = express.Router();
const { isLoggedOut, handleUserErrors } = require("../middleware.js");
const catchAsync = require('../utils/catchAsync.js');
const usersAuthController = require("../controllers/usersAuth");

// The route to register(sign-up) a user:
router.route("/register")
    .post(isLoggedOut,catchAsync(usersAuthController.register),handleUserErrors);
// The route to fetch and login a specific registered user:
router.route('/login')
    .post(isLoggedOut, catchAsync(usersAuthController.login));
// The route to logout a specific registered user:
router.post('/logout', usersAuthController.logout);
// The route to fetch a specific logged-in user:
router.get("/current-user", usersAuthController.currentUser);

module.exports = router;