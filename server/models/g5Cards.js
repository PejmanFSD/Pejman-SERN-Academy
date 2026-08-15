const { sql, connectDB } = require("../config/db");

// GET all cards belonging to a specific box
module.exports.getCardsByBoxId = async (boxId, userId) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input("box_id", sql.Int, boxId)
        .input("user_id", sql.Int, userId)
        // A card doesn't have the "user_id" as the foreign key; it has "box_id".
        // So to make sure a user can only modify their own cards, we need to verify ownership through G5_Boxes.
        // So we should join the "users" table and the "boxes" table:
        .query(`
            SELECT c.*
            FROM G5_Cards AS c
            INNER JOIN G5_Boxes AS b
                ON c.box_id = b.id
            WHERE c.box_id = @box_id
              AND b.user_id = @user_id
            ORDER BY c.id
        `);

    return result.recordset;
};
// CREATE a new card
module.exports.createCard = async (boxId, userId, question, answer, boxNumber) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input("box_id", sql.Int, boxId)
        .input("user_id", sql.Int, userId)
        .input("question", sql.VarChar(sql.MAX), question)
        .input("answer", sql.VarChar(sql.MAX), answer)
        .input("box_number", sql.Int, boxNumber)
        .query(`
            INSERT INTO G5_Cards
                (box_id, question, answer, box_number)
            OUTPUT INSERTED.*
            SELECT
                @box_id,
                @question,
                @answer,
                @box_number
            WHERE EXISTS (
                SELECT 1
                FROM G5_Boxes
                WHERE id = @box_id
                  AND user_id = @user_id
            )
        `);
    return result.recordset[0];
};
// UPDATE a card -> for update, we should include userId:
module.exports.updateCard = async (
    cardId,
    userId,
    question,
    answer,
    boxNumber
) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input("id", sql.Int, cardId)
        .input("user_id", sql.Int, userId)
        .input("question", sql.VarChar(sql.MAX), question)
        .input("answer", sql.VarChar(sql.MAX), answer)
        .input("box_number", sql.Int, boxNumber)
        .query(`
            UPDATE c
            SET
                c.question = @question,
                c.answer = @answer,
                c.box_number = @box_number
            OUTPUT INSERTED.*
            FROM G5_Cards AS c
            INNER JOIN G5_Boxes AS b
                ON c.box_id = b.id
            WHERE c.id = @id
              AND b.user_id = @user_id
        `);
    return result.recordset[0];
};
// DELETE a card -> for delete, we should include userId:
module.exports.deleteCard = async (cardId, userId) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input("id", sql.Int, cardId)
        .input("user_id", sql.Int, userId)
        .query(`
            DELETE c
            OUTPUT DELETED.*
            FROM G5_Cards AS c
            INNER JOIN G5_Boxes AS b
                ON c.box_id = b.id
            WHERE c.id = @id
              AND b.user_id = @user_id
        `);
    return result.recordset[0];
};