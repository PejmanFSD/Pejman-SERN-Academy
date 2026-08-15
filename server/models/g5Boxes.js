const { sql, connectDB } = require("../config/db");

// GET all boxes belonging to a user
module.exports.getBoxesByUserId = async (userId) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input("user_id", sql.Int, userId)
        .query(`
            SELECT *
            FROM G5_Boxes
            WHERE user_id = @user_id
            ORDER BY id
        `);
    return result.recordset;
};
// CREATE a new box
module.exports.createBox = async (userId, boxName) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input("user_id", sql.Int, userId)
        .input("box_name", sql.VarChar(100), boxName)
        .query(`
            INSERT INTO G5_Boxes (user_id, box_name)
            OUTPUT INSERTED.*
            VALUES (@user_id, @box_name)
        `);
    return result.recordset[0];
};
// UPDATE a box
module.exports.updateBox = async (boxId, userId, boxName) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input("id", sql.Int, boxId)
        .input("user_id", sql.Int, userId)
        .input("box_name", sql.VarChar(100), boxName)
        .query(`
            UPDATE G5_Boxes
            SET box_name = @box_name
            OUTPUT INSERTED.*
            WHERE id = @id
              AND user_id = @user_id
        `);
    return result.recordset[0];
};
// DELETE a box
module.exports.deleteBox = async (boxId, userId) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input("id", sql.Int, boxId)
        .input("user_id", sql.Int, userId)
        .query(`
            DELETE FROM G5_Boxes
            OUTPUT DELETED.*
            WHERE id = @id
              AND user_id = @user_id
        `);
    return result.recordset[0];
};
