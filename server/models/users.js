const { sql, connectDB } = require("../config/db");
const bcrypt = require("bcrypt");

module.exports.createUser = async (username, passwordHash, role) => {
  const pool = await connectDB();

  const result = await pool
    .request()
    .input("username", sql.VarChar(100), username)
    .input("passwordHash", sql.VarChar(255), passwordHash)
    .input("role", sql.VarChar(20), role).query(`
            INSERT INTO Users (username, password_hash, role)
            OUTPUT INSERTED.user_id
            VALUES (@username, @passwordHash, @role);
        `);

  return result;
};

module.exports.findAndValidate = async (username, password) => {
  const pool = await connectDB();
  const result = await pool
    .request()
    .input("username", sql.VarChar(100), username).query(`
            SELECT user_id, username, password_hash, role
            FROM Users
            WHERE username = @username;
        `);
  // If the user doesn't exist:
  if (result.recordset.length === 0) {
    return null;
  }
  const user = result.recordset[0];
  // Validating password (comparing the entered password with the stored hash password):
  const validPassword = await bcrypt.compare(password, user.password_hash);
  // If the validation doesn't work:
  if (!validPassword) {
    return null;
  }
  return user;
};

module.exports.findById = async (userId) => {
    const pool = await connectDB();
    // fetching the user by the imported id:
    const result = await pool
        .request()
        .input("userId", sql.Int, userId)
        .query(`
            SELECT user_id, username, role
            FROM Users
            WHERE user_id = @userId;
        `);
    // if the imported id doesn't exist:
    if (result.recordset.length === 0) {
        return null;
    }
    // Return the first found user:
    return result.recordset[0];
};

module.exports.getAllUsers = async () => {
    const pool = await connectDB();
    // Fetching all the users:
    const result = await pool
        .request()
        .query(`
            SELECT user_id, username, role
            FROM Users
            ORDER BY user_id;
        `);
    // Returning all the users:
    return result.recordset;
};

module.exports.updateUsername = async (userId, username) => {
    const pool = await connectDB();
    const result = await pool
        .request()
        .input("userId", sql.Int, userId)
        .input("username", sql.VarChar(100), username)
        .query(`
            UPDATE Users
            SET username = @username
            OUTPUT INSERTED.user_id, INSERTED.username, INSERTED.role
            WHERE user_id = @userId;
        `);
    if (result.recordset.length === 0) {
        return null;
    }
    return result.recordset[0];
};

module.exports.findPasswordHash = async (userId) => {
    const pool = await connectDB();
    const result = await pool
        .request()
        .input("userId", sql.Int, userId)
        .query(`
            SELECT password_hash
            FROM Users
            WHERE user_id = @userId;
        `);
    if (result.recordset.length === 0) {
        return null;
    }
    return result.recordset[0].password_hash;
};

module.exports.updatePassword = async (userId, passwordHash) => {
    const pool = await connectDB();
    await pool
        .request()
        .input("userId", sql.Int, userId)
        .input("passwordHash", sql.VarChar(255), passwordHash)
        .query(`
            UPDATE Users
            SET password_hash = @passwordHash
            WHERE user_id = @userId;
        `);
};