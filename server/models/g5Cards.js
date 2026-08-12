const { sql, connectDB } = require("../config/db");

module.exports.createCard = async (boxId, question, answer, boxNumber) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("box_id", sql.Int, boxId)
        .input("question", sql.VarChar(sql.MAX), question)
        .input("answer", sql.VarChar(sql.MAX), answer)
        .input("box_number", sql.Int, boxNumber)
        .query(`
            INSERT INTO G5_Cards
                (box_id, question, answer, box_number)
            OUTPUT INSERTED.*
            VALUES
                (@box_id, @question, @answer, @box_number)
        `);

    return result.recordset[0];
};

module.exports.getCardsByBoxId = async (boxId) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("box_id", sql.Int, boxId)
        .query(`
            SELECT *
            FROM G5_Cards
            WHERE box_id = @box_id
            ORDER BY id
        `);

    return result.recordset;
};
