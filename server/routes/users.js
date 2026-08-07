const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users.js");
const catchAsync = require("../utils/catchAsync.js");
const { isLoggedIn, isAdmin, handleUserErrors } = require("../middleware.js");

router.get("/", isLoggedIn, isAdmin, catchAsync(usersController.index));
router.get('/profile', isLoggedIn, catchAsync(usersController.showUser));
router.put('/edit-profile', isLoggedIn, catchAsync(usersController.editUser), handleUserErrors); // We
// use "handleUserErrors" middleware after executing the controller because this middleware
// should have the values of the <input /> tags before evaluating them.

module.exports = router;
