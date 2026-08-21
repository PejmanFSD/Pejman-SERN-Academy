const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users.js");
const catchAsync = require("../utils/catchAsync.js");
const { isLoggedIn, isAdmin, handleUserErrors } = require("../middleware.js");

// The route to fetch all the registered users:
router.get('/', isLoggedIn, isAdmin, catchAsync(usersController.index));
// The route to fetch a specific registered user:
router.get('/profile', isLoggedIn, catchAsync(usersController.showUser));
// The route to fetch the number of all the registered user:
router.get('/count', catchAsync(usersController.getUserCount));
// The route to fetch and edit the information of a specific registered user:
router.put('/edit-profile', isLoggedIn, catchAsync(usersController.editUser), handleUserErrors); // We
// use "handleUserErrors" middleware after executing the controller because this middleware
// should have the values of the <input /> tags before evaluating them.
// The route to fetch and edit the hashed password of a specific registered user:
router.put('/change-password', isLoggedIn, catchAsync(usersController.changePassword));
// The route to fetch and delete a specific registered user:
router.delete('/:id', isLoggedIn, isAdmin, catchAsync(usersController.deleteUser));

module.exports = router;
