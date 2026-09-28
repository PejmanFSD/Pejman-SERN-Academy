const express = require("express");
const router = express.Router();
const g5CardsController = require("../controllers/g5Cards");
const catchAsync = require("../utils/catchAsync.js");
const { isLoggedIn } = require("../middleware.js");

// GET all cards belonging to a specific box
router.get("/:boxId/cards", isLoggedIn, catchAsync(g5CardsController.index));
// CREATE a new card inside a specific box
router.post("/:boxId/cards", isLoggedIn, catchAsync(g5CardsController.create));
// UPDATE a card
router.put("/:id", isLoggedIn, catchAsync(g5CardsController.update));
// Moving the card to the next box
router.put("/:id/next-box", isLoggedIn, catchAsync(g5CardsController.moveToNextBox));
// Returning the card to the starting area
router.put("/:id/reset-box", isLoggedIn, catchAsync(g5CardsController.resetToFirstBox));
// Sending the card to box 1
router.put("/:id/start-box", isLoggedIn, catchAsync(g5CardsController.startAnswering));
// DELETE a card
router.delete("/:id", isLoggedIn, catchAsync(g5CardsController.remove));

module.exports = router;