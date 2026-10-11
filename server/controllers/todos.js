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
    if (error.number === 2627) {
      return res.status(409).json({
        message: "You already have a todo with this text and due date.",
      });
    }
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
  try {
    const userId = req.session.user_id;
    const todoId = Number(req.params.id);
    const { text, due_date } = req.body;

    if (!Number.isInteger(todoId) || todoId <= 0) {
      return res.status(400).json({
        message: "Invalid todo ID.",
      });
    }
    if (typeof text !== "string" || !text.trim()) {
      return res.status(400).json({
        message: "Todo text is required.",
      });
    }
    if (text.trim().length > 500) {
      return res.status(400).json({
        message: "Todo text cannot exceed 500 characters.",
      });
    }
    // Validate YYYY-MM-DD and prevent past due dates.
    if (
      typeof due_date !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(due_date) ||
      !Number.isFinite(Date.parse(`${due_date}T00:00:00Z`)) ||
      new Date(`${due_date}T00:00:00Z`)
        .toISOString().slice(0, 10) !== due_date
    ) {
      return res.status(400).json({
        message: "Please provide a valid due date.",
      });
    }
    const updatedTodo = await Todo.updateTodo(
      todoId,
      userId,
      text.trim(),
      due_date
    );
    if (!updatedTodo) {
      return res.status(404).json({
        message:
          "Todo not found, already completed, or the due date is in the past.",
      });
    }
    return res.status(200).json(updatedTodo);
  } catch (error) {
    // SQL Server duplicate-key errors for your unique constraint.
    if (error.number === 2627 || error.number === 2601) {
      return res.status(409).json({
        message:
          "You already have a todo with this text and due date.",
      });
    }
    console.error("Error updating todo:", error);
    return res.status(500).json({
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
// Completind a todo
module.exports.completeTodo = async (req, res) => {
    const userId = req.session.user_id;
    const todoId = Number(req.params.id);
    if (!Number.isInteger(todoId) || todoId <= 0) {
        return res.status(400).json({
            message: "Invalid Todo ID."
        });
    }
    try {
        const todo = await Todo.completeTodo(todoId, userId);
        if (!todo) {
            return res.status(404).json({
                message: "Todo not found or already completed."
            });
        }
        res.status(200).json(todo);
    } catch (error) {
        console.error("Error completing Todo:", error);
        res.status(500).json({
            message: "Something went wrong while completing the Todo."
        });
    }
};
// Undo a completed todo
module.exports.undoTodo = async (req, res) => {
    const userId = req.session.user_id;
    const todoId = Number(req.params.id);
    if (!Number.isInteger(todoId) || todoId <= 0) {
        return res.status(400).json({
            message: "Invalid Todo ID."
        });
    }
    try {
        const todo = await Todo.undoTodo(todoId, userId);
        if (!todo) {
            return res.status(404).json({
                message: "Todo not found or already completed."
            });
        }
        res.status(200).json(todo);
    } catch (error) {
        console.error("Error completing Todo:", error);
        res.status(500).json({
            message: "Something went wrong while completing the Todo."
        });
    }
};