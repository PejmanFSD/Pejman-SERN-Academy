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
