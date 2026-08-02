const express = require("express");
const router = express.Router();
const { isLoggedOut, handleUserErrors } = require("../middleware.js");
const catchAsync = require('../utils/catchAsync.js');
const usersAuthController = require("../controllers/usersAuth");

router.route("/register")
    .post(isLoggedOut,catchAsync(usersAuthController.register),handleUserErrors);

router.route('/login')
    .post(isLoggedOut, catchAsync(usersAuthController.login));

module.exports = router;