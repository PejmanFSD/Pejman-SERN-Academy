const { sql, connectDB } = require("../config/db");

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
