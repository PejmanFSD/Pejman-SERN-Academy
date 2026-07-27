const sql = require("mssql");

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    port: Number(process.env.DB_PORT),
    options: {
        encrypt: true,
        trustServerCertificate: false
    }
};

const connectDB = async () => {
    try {
        await sql.connect(config);
        console.log("Connected to Azure SQL Database");
    } catch (error) {
        console.log("Database connection error:", error);
    }
};

module.exports = { sql, connectDB };