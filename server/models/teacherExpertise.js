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

module.exports.updateMyExpertise = async (teacherId, subjectIds) => {
  const pool = await connectDB();
  const transaction = new sql.Transaction(pool);

  await transaction.begin();

  try {
    // Expertise is required
    if (!Array.isArray(subjectIds) || subjectIds.length === 0) {
      throw new Error("You must select at least one subject.");
    }

    // Prevent duplicate subject IDs
    const uniqueSubjectIds = [...new Set(subjectIds)];

    // Validate the subject IDs against the Subjects table
    const subjectCheck = await new sql.Request(transaction).query(`
      SELECT subject_id
      FROM dbo.Subjects;
    `);

    const validSubjectIds = new Set(
      subjectCheck.recordset.map((subject) => subject.subject_id),
    );

    for (const subjectId of uniqueSubjectIds) {
      if (!Number.isInteger(subjectId) || subjectId <= 0) {
        throw new Error("Invalid subject ID.");
      }

      if (!validSubjectIds.has(subjectId)) {
        throw new Error(`Subject ID ${subjectId} does not exist.`);
      }
    }

    // Delete the teacher's existing expertise
    await new sql.Request(transaction).input("teacherId", sql.Int, teacherId)
      .query(`
        DELETE FROM dbo.TeacherExpertise
        WHERE teacher_id = @teacherId;
      `);

    // Insert the new expertise
    for (const subjectId of uniqueSubjectIds) {
      await new sql.Request(transaction)
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

    await transaction.commit();

    return uniqueSubjectIds;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
