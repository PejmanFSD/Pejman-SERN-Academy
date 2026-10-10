const express = require("express");
const router = express.Router();
const {createTodo, getTodos, getTodo, updateTodo, deleteTodo, completeTodo, undoTodo} = require("../controllers/todos");
const { isLoggedIn } = require("../middleware.js");
// CREATE
router.post("/", isLoggedIn, createTodo);
// READ ALL
router.get("/", isLoggedIn, getTodos);
// READ ONE
router.get("/:id", isLoggedIn, getTodo);
// UPDATE
router.put("/:id", isLoggedIn, updateTodo);
// DELETE
router.delete("/:id", isLoggedIn, deleteTodo);
// Completind a todo
router.patch("/:id/complete", isLoggedIn, completeTodo);
// Undo a completed todo
router.patch("/:id/undo", isLoggedIn, undoTodo);

module.exports = router;