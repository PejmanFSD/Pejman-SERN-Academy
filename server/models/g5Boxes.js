const { sql, connectDB } = require("../config/db"); // Importing "sql" and "connectDB" from the config file
// GET all boxes belonging to a user
module.exports.getBoxesByUserId = async (userId) => {
    const pool = await connectDB(); // "pool" is a collection of database connections
  // that Node.js application can use to communicate with SQL Server.
    const result = await pool // Wait until the database connection is available before continuing.
    .request() // pool.request() creates a new SQL request (We're about to send a SQL command to the database)
    // Introducing the "user_id" parameter as the inputs of the query:
        .input("user_id", sql.Int, userId)
        // Executing the SQL query:
        .query(`
            SELECT *
            FROM G5_Boxes
            WHERE user_id = @user_id
            ORDER BY box_name ASC
        `);
    // Returning all the boxes to UI ("recordset" contains the rows returned by SQL Server):
    return result.recordset;
};
// CREATE a new box
module.exports.createBox = async (userId, boxName) => {
    const pool = await connectDB(); // "pool" is a collection of database connections
  // that Node.js application can use to communicate with SQL Server.
    const result = await pool // Wait until the database connection is available before continuing.
    .request() // pool.request() creates a new SQL request (We're about to send a SQL command to the database)
    // Introducing the "user_id" and "box_name" parameters as the inputs of the query:
        .input("user_id", sql.Int, userId)
        .input("box_name", sql.VarChar(100), boxName)
        // Executing the SQL query:
        .query(`
            INSERT INTO G5_Boxes (user_id, box_name)
            OUTPUT INSERTED.*
            VALUES (@user_id, @box_name)
        `);
    // Return the first found box / the first row of the rows that are returned by SQL Server:
    // ("recordset" contains the rows returned by SQL Server)
    return result.recordset[0];
};
// UPDATE a box
module.exports.updateBox = async (boxId, userId, boxName) => {
    const pool = await connectDB(); // "pool" is a collection of database connections
  // that Node.js application can use to communicate with SQL Server.
    const result = await pool // Wait until the database connection is available before continuing.
    .request() // pool.request() creates a new SQL request (We're about to send a SQL command to the database)
    // Introducing the "box_id", "user_id" and "box_name" parameters as the inputs of the query:
        .input("id", sql.Int, boxId)
        .input("user_id", sql.Int, userId)
        .input("box_name", sql.VarChar(100), boxName)
        // Executing the SQL query:
        .query(`
            UPDATE G5_Boxes
            SET box_name = @box_name
            OUTPUT INSERTED.*
            WHERE id = @id
              AND user_id = @user_id
        `);
    // Return the first found box / the first row of the rows that are returned by SQL Server:
    // ("recordset" contains the rows returned by SQL Server)
    return result.recordset[0];
};
// DELETE a box
module.exports.deleteBox = async (boxId, userId) => {
    const pool = await connectDB(); // "pool" is a collection of database connections
  // that Node.js application can use to communicate with SQL Server.
    const result = await pool // Wait until the database connection is available before continuing.
    .request() // pool.request() creates a new SQL request (We're about to send a SQL command to the database)
    // Introducing the "box_id" and "user_id" parameters as the inputs of the query:
        .input("id", sql.Int, boxId)
        .input("user_id", sql.Int, userId)
        // Executing the SQL query:
        .query(`
            DELETE FROM G5_Boxes
            OUTPUT DELETED.*
            WHERE id = @id
              AND user_id = @user_id
        `);
    // Return the first found box / the first row of the rows that are returned by SQL Server:
    // ("recordset" contains the rows returned by SQL Server)
    return result.recordset[0];
};
