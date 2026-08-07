const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users.js");
const catchAsync = require("../utils/catchAsync.js");
const { isLoggedIn, isAdmin, handleUserErrors } = require("../middleware.js");

router.get("/", isLoggedIn, isAdmin, catchAsync(usersController.index));
router.get('/profile', isLoggedIn, catchAsync(usersController.showUser));

module.exports = router;
