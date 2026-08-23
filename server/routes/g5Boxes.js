const express = require("express");
const router = express.Router();
const g5BoxesController = require("../controllers/g5Boxes");
const catchAsync = require("../middleware/catchAsync");
const { isLoggedIn } = require("../middleware/isLoggedIn");
// GET all boxes belonging to a specific logged-in user
router.get("/", isLoggedIn, catchAsync(g5BoxesController.index));
// CREATE a new box
router.post("/", isLoggedIn, catchAsync(g5BoxesController.create));
// UPDATE a box
router.put("/:id", isLoggedIn, catchAsync(g5BoxesController.update));
// DELETE a box
router.delete("/:id", isLoggedIn, catchAsync(g5BoxesController.remove));

module.exports = router;