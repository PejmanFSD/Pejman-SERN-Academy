const { sql, connectDB } = require("../config/db");

module.exports.createTeacherExpertise = async (
  teacherId,
  subjectIds,
  transaction,
) => {
  for (const subjectId of subjectIds) {
    await transaction
      .request()
      .input("teacherId", sql.Int, teacherId)
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
};
// Get the subjects a teacher can teach
module.exports.getMyExpertise = async (teacherId) => {
  const pool = await connectDB();

  return pool.request().input("teacherId", sql.Int, teacherId).query(`
      SELECT
        s.subject_id,
        s.subject_name,
        sc.category_id,
        sc.category_name
      FROM dbo.TeacherExpertise AS te
      INNER JOIN dbo.Subjects AS s
        ON s.subject_id = te.subject_id
      INNER JOIN dbo.SubjectCategories AS sc
        ON sc.category_id = s.category_id
      WHERE te.teacher_id = @teacherId
      ORDER BY sc.category_name, s.subject_name;
    `);
};
