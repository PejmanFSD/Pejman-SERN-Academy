const { sql, connectDB } = require("../config/db");

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
