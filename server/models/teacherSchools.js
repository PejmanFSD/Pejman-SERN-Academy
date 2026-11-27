const { sql, connectDB } = require("../config/db");

module.exports.getSchoolDetails = async (schoolId) => {
  const pool = await connectDB();

  const schoolResult = await pool
    .request()
    .input("schoolId", sql.Int, schoolId)
    .query(`
      SELECT
        s.id AS school_id,
        s.school_name,
        s.city,
        s.address,
        s.zip_code,
        s.country_code,
        c.country_name,
        u.username AS principal_username
      FROM dbo.Schools AS s
      INNER JOIN dbo.Users AS u
        ON u.user_id = s.principal_id
      LEFT JOIN dbo.Countries AS c
        ON c.country_code = s.country_code
      WHERE s.id = @schoolId;
    `);

  if (schoolResult.recordset.length === 0) {
    return null;
  }

  const school = schoolResult.recordset[0];

  const subjectsResult = await pool
    .request()
    .input("schoolId", sql.Int, schoolId)
    .query(`
      SELECT
        sc.category_id,
        sc.category_name,
        sub.subject_id,
        sub.subject_name
      FROM dbo.SchoolSubjects AS ss
      INNER JOIN dbo.Subjects AS sub
        ON sub.subject_id = ss.subject_id
      INNER JOIN dbo.SubjectCategories AS sc
        ON sc.category_id = sub.category_id
      WHERE ss.school_id = @schoolId
      ORDER BY sc.category_name, sub.subject_name;
    `);

  return {
    ...school,
    subjects: subjectsResult.recordset,
  };
};