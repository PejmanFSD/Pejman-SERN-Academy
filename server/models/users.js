const { sql, connectDB } = require("../config/db"); // Importing "sql" and "connectDB" from the config file
const bcrypt = require("bcrypt"); // Importing "bcrypt" from the installed library of npm
// The function for creating(registering) a user:
module.exports.createUser = async (username, passwordHash, role) => {
  const pool = await connectDB(); // "pool" is a collection of database connections
  // that Node.js application can use to communicate with SQL Server.
  const result = await // Executing the SQL query:
  pool // Wait until the database connection is available before continuing.
    .request() // pool.request() creates a new SQL request (We're about to send a SQL command to the database)
    // Introducing the "username", "passwordHash" and "role" parameters as the inputs of the query:
    .input("username", sql.VarChar(100), username)
    .input("passwordHash", sql.VarChar(255), passwordHash)
    .input("role", sql.VarChar(20), role).query(`
            INSERT INTO Users (username, password_hash, role)
            OUTPUT INSERTED.user_id
            VALUES (@username, @passwordHash, @role);
        `);
  // Returning the result:
  return result;
};
// The function for fetching a user by having "username" and "password" as its inputs:
module.exports.findAndValidate = async (username, password) => {
  const pool = await connectDB(); // "pool" is a collection of database connections
  // that Node.js application can use to communicate with SQL Server.
  const result = await pool // Wait until the database connection is available before continuing.
    .request() // pool.request() creates a new SQL request (We're about to send a SQL command to the database)
    // Executing the SQL query:
    .input("username", sql.VarChar(100), username).query(`
            SELECT user_id, username, password_hash, role
            FROM Users
            WHERE username = @username;
        `);
  // If the user doesn't exist ("recordset" contains the rows returned by SQL Server):
  if (result.recordset.length === 0) {
    return null;
  }
  // Create a new variable for the fetched user called "user" by
  // fetching the first element of "recordset" ("recordset" contains the rows returned by SQL Server)
  const user = result.recordset[0];
  // Validating password (comparing the entered password with the stored hash password):
  const validPassword = await bcrypt.compare(password, user.password_hash);
  // If the validation doesn't work:
  if (!validPassword) {
    return null;
  }
  return user;
};
// The function for fetching a user by having their id as its input:
module.exports.findById = async (userId) => {
  const pool = await connectDB(); // "pool" is a collection of database connections
  // that Node.js application can use to communicate with SQL Server.
  // fetching the user by the imported id:
  const result = await pool // Wait until the database connection is available before continuing.
    .request() // pool.request() creates a new SQL request (We're about to send a SQL command to the database)
    // Executing the SQL query:
    .input("userId", sql.Int, userId).query(`
            SELECT user_id, username, role
            FROM Users
            WHERE user_id = @userId;
        `);
  // if the imported id doesn't exist / the number of rows returned by SQL Server is zero:
  // ("recordset" contains the rows returned by SQL Server)
  if (result.recordset.length === 0) {
    return null;
  }
  // Return the first found user / the first row of the rows that are returned by SQL Server:
  // ("recordset" contains the rows returned by SQL Server)
  return result.recordset[0];
};
// The function for fetching all the users:
module.exports.getAllUsers = async (page = 1, search = "") => {
  const pool = await connectDB(); // "pool" is a collection of database connections
  // that Node.js application can use to communicate with SQL Server.
  const pageSize = 5; // Each page has 5 users
  const offset = (page - 1) * pageSize; // The number of all the users in the previouse pages
  // fetching the users:
  const result = await // Executing the SQL query:
  pool // Wait until the database connection is available before continuing.
    .request() // pool.request() creates a new SQL request (We're about to send a SQL command to the database)
    .input("search", sql.VarChar(100), `%${search}%`) // We need the format of %-% for searching the user
    // In the query we need the "offset" and "pageSize" variables for pagination:
    .input("offset", sql.Int, offset)
    .input("pageSize", sql.Int, pageSize).query(`
            SELECT
                user_id,
                username,
                role
            FROM Users
            WHERE username LIKE @search
            ORDER BY
                CASE
                    WHEN role = 'admin' THEN 1
                    WHEN role = 'student' THEN 2
                    ELSE 3
                END,
                username ASC
            OFFSET @offset ROWS
            FETCH NEXT @pageSize ROWS ONLY;

            SELECT COUNT(*) AS totalUsers
            FROM Users
            WHERE username LIKE @search;
        `);
  // Returning all the users to UI ("recordset" contains the rows returned by SQL Server):
  return {
    users: result.recordsets[0],
    totalUsers: result.recordsets[1][0].totalUsers,
  };
};
// The function for updating the username:
module.exports.updateUsername = async (userId, username) => {
  const pool = await connectDB(); // "pool" is a collection of database connections
  // that Node.js application can use to communicate with SQL Server.
  const result = await // Executing the SQL query:
  pool // Wait until the database connection is available before continuing.
    .request() // pool.request() creates a new SQL request (We're about to send a SQL command to the database)
    // Introducing the "userId" and "username" parameters as the inputs of the query:
    .input("userId", sql.Int, userId)
    .input("username", sql.VarChar(100), username).query(`
            UPDATE Users
            SET username = @username
            OUTPUT INSERTED.user_id, INSERTED.username, INSERTED.role
            WHERE user_id = @userId;
        `);
  // if the imported id or username doesn't exist / the number of rows returned by SQL Server is zero:
  // ("recordset" contains the rows returned by SQL Server)
  if (result.recordset.length === 0) {
    return null;
  }
  // Return the first row of the rows that are returned by SQL Server
  return result.recordset[0];
};
// The function for fetching the hashed password based on the entered password:
module.exports.findPasswordHash = async (userId) => {
  const pool = await connectDB(); // "pool" is a collection of database connections
  // that Node.js application can use to communicate with SQL Server.
  const result = await // Executing the SQL query:
  pool // Wait until the database connection is available before continuing.
    .request() // pool.request() creates a new SQL request (We're about to send a SQL command to the database)
    // Introducing the "userId" parameter as the inputs of the query:
    .input("userId", sql.Int, userId).query(`
            SELECT password_hash
            FROM Users
            WHERE user_id = @userId;
        `);
  // if the imported id doesn't exist / the number of rows returned by SQL Server is zero:
  // ("recordset" contains the rows returned by SQL Server)
  if (result.recordset.length === 0) {
    return null;
  }
  // Return the the value of the "password_hash" key of the first row of the rows that are returned by SQL Server
  return result.recordset[0].password_hash;
};
// The function for updating the password based on the entered user_id and password:
module.exports.updatePassword = async (userId, passwordHash) => {
  const pool = await connectDB(); // "pool" is a collection of database connections
  // that Node.js application can use to communicate with SQL Server.
  await // Executing the SQL query:
  pool // Wait until the database connection is available before continuing.
    .request() // pool.request() creates a new SQL request (We're about to send a SQL command to the database)
    // Introducing the "userId" and "passwordHash" parameters as the inputs of the query:
    .input("userId", sql.Int, userId)
    .input("passwordHash", sql.VarChar(255), passwordHash).query(`
            UPDATE Users
            SET password_hash = @passwordHash
            WHERE user_id = @userId;
        `);
};
// The function for fetching the number of all the registered users:
module.exports.getUserCount = async () => {
  const pool = await connectDB(); // "pool" is a collection of database connections
  // that Node.js application can use to communicate with SQL Server.
  const result = await // Executing the SQL query:
  pool // Wait until the database connection is available before continuing.
    .request() // pool.request() creates a new SQL request (We're about to send a SQL command to the database)
    .query(`
            SELECT COUNT(*) AS count
            FROM Users;
        `);
  // Return the the value of the "count" key of the first row of the rows that are returned by SQL Server
  return result.recordset[0].count;
};
// The function for deleting a specific user from the database based on their id:
module.exports.deleteUser = async (userId) => {
  const pool = await connectDB(); // "pool" is a collection of database connections
  // that Node.js application can use to communicate with SQL Server.
  const result = await // Executing the SQL query:
  pool // Wait until the database connection is available before continuing.
    .request() // pool.request() creates a new SQL request (We're about to send a SQL command to the database)
    // Introducing the "userId" parameter as the inputs of the query:
    .input("userId", sql.Int, userId).query(`
            DELETE FROM Users
            OUTPUT DELETED.user_id
            WHERE user_id = @userId;
        `);
  // if the imported id doesn't exist / the number of rows returned by SQL Server is zero:
  // ("recordset" contains the rows returned by SQL Server)
  if (result.recordset.length === 0) {
    return null;
  }
  // Return the first row of the rows that are returned by SQL Server
  return result.recordset[0];
};
