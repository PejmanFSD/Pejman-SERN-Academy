const { sql, connectDB } = require("../config/db");
// const sql = require("mssql");
// const connectDB = require("../config/db");

// CREATE
module.exports.createTodo = async (userId, text, dueDate) => {
    const pool = await connectDB();

    const result = await pool
        .request()
        .input("user_id", sql.Int, userId)
        .input("text", sql.VarChar(500), text)
        .input("due_date", sql.Date, dueDate)
        .query(`
            INSERT INTO todos (user_id, text, due_date)
            OUTPUT INSERTED.*
            VALUES (@user_id, @text, @due_date)
        `);

    return result.recordset[0];
};
// READ ALL TODOS FOR A USER
module.exports.getTodosByUser = async (userId) => {
    const pool = await connectDB();

    const result = await pool
        .request()
        .input("user_id", sql.Int, userId)
        .query(`
            SELECT
                id,
                user_id,
                text,
                created_date,
                due_date,
                status
            FROM todos
            WHERE user_id = @user_id
            ORDER BY due_date ASC, created_date DESC
        `);

    return result.recordset;
};
// READ ONE TODO
module.exports.getTodoById = async (todoId, userId) => {
    const pool = await connectDB();

    const result = await pool
        .request()
        .input("id", sql.Int, todoId)
        .input("user_id", sql.Int, userId)
        .query(`
            SELECT
                id,
                user_id,
                text,
                created_date,
                due_date,
                status
            FROM todos
            WHERE id = @id
            AND user_id = @user_id
        `);

    return result.recordset[0];
};
// UPDATE (We don't mention "Created_date" because the user shouldn't be able to change it)
module.exports.updateTodo = async (todoId, userId, text, dueDate, status) => {
    const pool = await connectDB();

    const result = await pool
        .request()
        .input("id", sql.Int, todoId)
        .input("user_id", sql.Int, userId)
        .input("text", sql.VarChar(500), text)
        .input("due_date", sql.Date, dueDate)
        .input("status", sql.Bit, status)
        .query(`
            UPDATE todos
            SET
                text = @text,
                due_date = @due_date,
                status = @status
            OUTPUT INSERTED.*
            WHERE id = @id
            AND user_id = @user_id
        `);

    return result.recordset[0];
};
// DELETE
module.exports.deleteTodo = async (todoId, userId) => {
    const pool = await connectDB();

    const result = await pool
        .request()
        .input("id", sql.Int, todoId)
        .input("user_id", sql.Int, userId)
        .query(`
            DELETE FROM todos
            OUTPUT DELETED.id
            WHERE id = @id
            AND user_id = @user_id
        `);

    return result.recordset[0];
};
// Completind a todo
module.exports.completeTodo = async (todoId, userId) => {
    const pool = await connectDB();

    const result = await pool
        .request()
        .input("id", sql.Int, todoId)
        .input("user_id", sql.Int, userId)
        .query(`
            UPDATE todos
            SET status = 1
            OUTPUT INSERTED.*
            WHERE id = @id
              AND user_id = @user_id
              AND status = 0
        `);

    return result.recordset[0];
};
// Undo a completed todo
module.exports.undoTodo = async (todoId, userId) => {
    const pool = await connectDB();

    const result = await pool
        .request()
        .input("id", sql.Int, todoId)
        .input("user_id", sql.Int, userId)
        .query(`
            UPDATE todos
            SET status = 0
            OUTPUT INSERTED.*
            WHERE id = @id
              AND user_id = @user_id
              AND status = 1
        `);

    return result.recordset[0];
};