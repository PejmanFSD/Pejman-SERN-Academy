const { sql, connectDB } = require("../config/db");

module.exports.getCategories = async () => {
    const pool = await connectDB();

    const result = await pool.request().query(`
        SELECT category_id, category_name
        FROM dbo.SubjectCategories
        ORDER BY category_name
    `);

    return result.recordset;
};

module.exports.getSubjectsByCategory = async (categoryId) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("categoryId", sql.Int, categoryId)
        .query(`
            SELECT subject_id, subject_name
            FROM dbo.Subjects
            WHERE category_id = @categoryId
            ORDER BY subject_name
        `);

    return result.recordset;
};
