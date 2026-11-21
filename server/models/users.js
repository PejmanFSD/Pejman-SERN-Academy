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
module.exports.getAllUsers = async (
  page = 1,
  search = "",
  role = "All",
  sortBy = "role",
) => {
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
    .input("pageSize", sql.Int, pageSize)
    .input("role", sql.VarChar(20), role)
    .input("sortBy", sql.VarChar(20), sortBy).query(`
      SELECT
      user_id,
      username,
      role
    FROM Users
    WHERE username LIKE @search
      AND (@role = 'All' OR role = @role)
    ORDER BY
      CASE
        WHEN @sortBy = 'role' THEN
          CASE
            WHEN role = 'Admin' THEN 1
            WHEN role = 'Principal' THEN 2
            WHEN role = 'Teacher' THEN 3
            WHEN role = 'Student' THEN 4
            ELSE 5
          END
        ELSE 0
      END ASC,

      CASE
        WHEN @sortBy = 'username' THEN username
        ELSE NULL
      END ASC,

      CASE
        WHEN @sortBy = 'role' THEN username
        ELSE NULL
      END ASC

    OFFSET @offset ROWS
    FETCH NEXT @pageSize ROWS ONLY;

    SELECT COUNT(*) AS totalUsers
    FROM Users
    WHERE username LIKE @search
      AND (@role = 'All' OR role = @role);
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

module.exports.registerUserWithExpertise = async (
  username,
  passwordHash,
  role,
  expertise = [],
) => {
  const pool = await connectDB();
  const transaction = new sql.Transaction(pool);

  await transaction.begin();

  try {
    // If the role is Teacher, validate the selected subject IDs
    // against the actual Subjects table.
    if (role === "Teacher") {
      if (!Array.isArray(expertise) || expertise.length === 0) {
        throw new Error("Teacher expertise is required.");
      }

      const subjectCheck = await new sql.Request(transaction).query(`
        SELECT subject_id
        FROM dbo.Subjects;
      `);

      const validSubjectIds = new Set(
        subjectCheck.recordset.map((subject) => subject.subject_id),
      );

      for (const subjectId of expertise) {
        if (!validSubjectIds.has(subjectId)) {
          throw new Error(`Invalid subject ID: ${subjectId}`);
        }
      }
    }

    // Insert the new user and retrieve their user_id.
    const userResult = await new sql.Request(transaction)
      .input("username", sql.VarChar(100), username)
      .input("passwordHash", sql.VarChar(255), passwordHash)
      .input("role", sql.VarChar(20), role).query(`
        INSERT INTO dbo.Users
        (
          username,
          password_hash,
          role
        )
        OUTPUT INSERTED.user_id
        VALUES
        (
          @username,
          @passwordHash,
          @role
        );
      `);

    const userId = userResult.recordset[0].user_id;

    // If Teacher, save their expertise.
    if (role === "Teacher") {
      for (const subjectId of expertise) {
        await new sql.Request(transaction)
          .input("teacherId", sql.Int, userId)
          .input("subjectId", sql.Int, subjectId).query(`
            INSERT INTO dbo.TeacherExpertise
            (
              teacher_id,
              subject_id
            )
            VALUES
            (
              @teacherId,
              @subjectId
            );
          `);
      }
    }

    // Both user and expertise insertions succeed together.
    await transaction.commit();

    return userId;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
