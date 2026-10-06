const Todo = require("../models/Todos");

// CREATE TODO
module.exports.createTodo = async (req, res) => {
  const userId = req.session.user_id;

  const { text, due_date } = req.body;

  if (!text || text.trim() === "") {
    return res.status(400).json({
      message: "Todo text is required.",
    });
  }

  if (!due_date) {
    return res.status(400).json({
      message: "Due date is required.",
    });
  }

  try {
    const todo = await Todo.createTodo(userId, text.trim(), due_date);

    if (!todo) {
      return res.status(400).json({
        message: "Due date cannot be before today.",
      });
    }

    res.status(201).json(todo);
  } catch (error) {
    console.error("Error creating todo:", error);

    res.status(500).json({
      message: "Something went wrong while creating the todo.",
    });
  }
};
// GET ALL TODOS
module.exports.getTodos = async (req, res) => {
  const userId = req.session.user_id;

  try {
    const todos = await Todo.getTodosByUser(userId);

    res.status(200).json(todos);
  } catch (error) {
    console.error("Error getting todos:", error);

    res.status(500).json({
      message: "Something went wrong while getting the todos.",
    });
  }
};
// GET ONE TODO
module.exports.getTodo = async (req, res) => {
  const userId = req.session.user_id;
  const todoId = parseInt(req.params.id);

  try {
    const todo = await Todo.getTodoById(todoId, userId);

    if (!todo) {
      return res.status(404).json({
        message: "Todo not found.",
      });
    }

    res.status(200).json(todo);
  } catch (error) {
    console.error("Error getting todo:", error);

    res.status(500).json({
      message: "Something went wrong while getting the todo.",
    });
  }
};
// UPDATE TODO
module.exports.updateTodo = async (req, res) => {
  const userId = req.session.user_id;
  const todoId = parseInt(req.params.id);
  // (We don't de-structure "Created_date" because the user shouldn't be able to change it)
  const { text, due_date, status } = req.body;

  if (!text || text.trim() === "") {
    return res.status(400).json({
      message: "Todo text is required.",
    });
  }

  try {
    const todo = await Todo.updateTodo(
      todoId,
      userId,
      text.trim(),
      due_date,
      status,
    );

    if (!todo) {
      return res.status(404).json({
        message: "Todo not found.",
      });
    }

    res.status(200).json(todo);
  } catch (error) {
    console.error("Error updating todo:", error);

    res.status(500).json({
      message: "Something went wrong while updating the todo.",
    });
  }
};
// DELETE TODO
module.exports.deleteTodo = async (req, res) => {
  const userId = req.session.user_id;
  const todoId = parseInt(req.params.id);

  try {
    const deletedTodo = await Todo.deleteTodo(todoId, userId);

    if (!deletedTodo) {
      return res.status(404).json({
        message: "Todo not found.",
      });
    }

    res.status(200).json({
      message: "Todo deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting todo:", error);

    res.status(500).json({
      message: "Something went wrong while deleting the todo.",
    });
  }
};
