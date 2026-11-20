const { sql, connectDB } = require("../config/db");

module.exports.getMyApprovedSchools = async (teacherId) => {
  const pool = await connectDB();

  return pool
    .request()
    .input("teacherId", sql.Int, teacherId)
    .query(`
      SELECT
        s.id AS school_id,
        s.school_name,
        s.city,
        s.address,
        s.zip_code,
        s.country_code,
        c.country_name,
        sta.approved_at
      FROM dbo.SchoolTeacherApplications AS sta
      INNER JOIN dbo.Schools AS s
        ON s.id = sta.school_id
      LEFT JOIN dbo.Countries AS c
        ON c.country_code = s.country_code
      WHERE
        sta.teacher_id = @teacherId
        AND sta.status = 'Approved'
      ORDER BY sta.approved_at DESC;
    `);
};