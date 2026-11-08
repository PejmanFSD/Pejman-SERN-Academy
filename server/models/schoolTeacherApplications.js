const { sql, connectDB } = require("../config/db");
// 1. GET ALL APPROVED SCHOOLS FOR A TEACHER
module.exports.getApprovedSchools = async (
  teacherId,
  page,
  pageSize = 6
) => {
  const pool = await connectDB();

  return pool.request()
    .input("teacherId", sql.Int, teacherId)
    .input("offset", sql.Int, (page - 1) * pageSize)
    .input("pageSize", sql.Int, pageSize)
    .query(`
      SELECT
        s.id,
        s.school_name,
        s.country_code,
        c.country_name,
        s.city,
        s.address,
        s.zip_code,
        p.username AS principal_username,

        sta.id AS application_id,
        sta.status AS application_status,
        sta.denial_message,
        sta.reconsideration_message,
        sta.applied_at,
        sta.reviewed_at,
        sta.approved_at,
        sta.resigned_at

      FROM dbo.Schools AS s

      INNER JOIN dbo.Countries AS c
        ON c.country_code = s.country_code

      INNER JOIN dbo.Users AS p
        ON p.user_id = s.principal_id

      LEFT JOIN dbo.SchoolTeacherApplications AS sta
        ON sta.school_id = s.id
        AND sta.teacher_id = @teacherId

      ORDER BY s.school_name ASC, s.id ASC

      OFFSET @offset ROWS
      FETCH NEXT @pageSize ROWS ONLY;

      SELECT COUNT(*) AS totalSchools
      FROM dbo.Schools;
    `);
};
// 2. APPLY TO A SCHOOL
module.exports.applyToSchool = async (
  schoolId,
  teacherId
) => {
  const pool = await connectDB();

  return pool.request()
    .input("schoolId", sql.Int, schoolId)
    .input("teacherId", sql.Int, teacherId)
    .query(`
      IF NOT EXISTS (
        SELECT 1
        FROM dbo.Schools
        WHERE id = @schoolId
      )
      BEGIN
        THROW 50002, 'School not found', 1;
      END;

      IF EXISTS (
        SELECT 1
        FROM dbo.SchoolTeacherApplications
        WHERE school_id = @schoolId
          AND teacher_id = @teacherId
          AND status = 'Approved'
      )
      BEGIN
        THROW 50003, 'You are already accepted in this school', 1;
      END;

      IF EXISTS (
        SELECT 1
        FROM dbo.SchoolTeacherApplications
        WHERE school_id = @schoolId
          AND teacher_id = @teacherId
          AND status = 'Pending'
      )
      BEGIN
        THROW 50004, 'Your application is already pending', 1;
      END;

      MERGE dbo.SchoolTeacherApplications AS target

      USING (
        SELECT
          @schoolId AS school_id,
          @teacherId AS teacher_id
      ) AS source

      ON target.school_id = source.school_id
      AND target.teacher_id = source.teacher_id

      WHEN MATCHED AND target.status IN ('Denied', 'Resigned')
      THEN UPDATE SET
        status = 'Pending',
        denial_message = NULL,
        reconsideration_message = NULL,
        applied_at = SYSUTCDATETIME(),
        reviewed_at = NULL,
        reconsidered_at = NULL,
        approved_at = NULL,
        resigned_at = NULL

      WHEN NOT MATCHED
      THEN INSERT (
        school_id,
        teacher_id,
        status,
        applied_at
      )
      VALUES (
        @schoolId,
        @teacherId,
        'Pending',
        SYSUTCDATETIME()
      );

      SELECT 'Application submitted successfully.' AS message;
    `);
};
// 3. REQUEST RECONSIDERATION
module.exports.requestReconsideration = async (
  schoolId,
  teacherId,
  reconsiderationMessage
) => {
  const pool = await connectDB();

  return pool.request()
    .input("schoolId", sql.Int, schoolId)
    .input("teacherId", sql.Int, teacherId)
    .input(
      "message",
      sql.NVarChar(1000),
      reconsiderationMessage
    )
    .query(`
      UPDATE dbo.SchoolTeacherApplications

      SET
        status = 'Pending',
        reconsideration_message = @message,
        reconsidered_at = SYSUTCDATETIME(),
        reviewed_at = NULL

      WHERE school_id = @schoolId
        AND teacher_id = @teacherId
        AND status = 'Denied';

      SELECT @@ROWCOUNT AS affectedRows;
    `);
};
// 4. RESIGN FROM A SCHOOL
module.exports.resignFromSchool = async (
  schoolId,
  teacherId
) => {
  const pool = await connectDB();

  return pool.request()
    .input("schoolId", sql.Int, schoolId)
    .input("teacherId", sql.Int, teacherId)
    .query(`
      UPDATE dbo.SchoolTeacherApplications

      SET
        status = 'Resigned',
        resigned_at = SYSUTCDATETIME()

      WHERE school_id = @schoolId
        AND teacher_id = @teacherId
        AND status = 'Approved';

      SELECT @@ROWCOUNT AS affectedRows;
    `);
};
// 5. GET PENDING TEACHER APPLICATIONS
//    FOR A PRINCIPAL'S SCHOOL
module.exports.getPendingTeacherApplications = async (
  schoolId,
  principalId,
  page,
  pageSize = 3
) => {
  const pool = await connectDB();

  return pool.request()
    .input("schoolId", sql.Int, schoolId)
    .input("principalId", sql.Int, principalId)
    .input("offset", sql.Int, (page - 1) * pageSize)
    .input("pageSize", sql.Int, pageSize)
    .query(`
      SELECT
        sta.id AS application_id,
        sta.school_id,
        sta.teacher_id,
        u.username AS teacher_username,
        sta.status,
        sta.denial_message,
        sta.reconsideration_message,
        sta.applied_at,
        sta.reconsidered_at

      FROM dbo.SchoolTeacherApplications AS sta

      INNER JOIN dbo.Schools AS s
        ON s.id = sta.school_id

      INNER JOIN dbo.Users AS u
        ON u.user_id = sta.teacher_id

      WHERE s.id = @schoolId
        AND s.principal_id = @principalId
        AND sta.status = 'Pending'

      ORDER BY
        CASE
          WHEN sta.reconsideration_message IS NOT NULL THEN 0
          ELSE 1
        END,
        sta.applied_at ASC,
        sta.id ASC

      OFFSET @offset ROWS
      FETCH NEXT @pageSize ROWS ONLY;

      SELECT COUNT(*) AS totalApplications

      FROM dbo.SchoolTeacherApplications AS sta

      INNER JOIN dbo.Schools AS s
        ON s.id = sta.school_id

      WHERE s.id = @schoolId
        AND s.principal_id = @principalId
        AND sta.status = 'Pending';
    `);
};
// 6. GET RESIGNED TEACHERS
module.exports.getResignedTeachers = async (
  schoolId,
  principalId,
  page,
  pageSize = 3
) => {
  const pool = await connectDB();

  return pool.request()
    .input("schoolId", sql.Int, schoolId)
    .input("principalId", sql.Int, principalId)
    .input("offset", sql.Int, (page - 1) * pageSize)
    .input("pageSize", sql.Int, pageSize)
    .query(`
      SELECT
        sta.id AS application_id,
        sta.teacher_id,
        u.username AS teacher_username,
        sta.applied_at,
        sta.approved_at,
        sta.resigned_at

      FROM dbo.SchoolTeacherApplications AS sta

      INNER JOIN dbo.Schools AS s
        ON s.id = sta.school_id

      INNER JOIN dbo.Users AS u
        ON u.user_id = sta.teacher_id

      WHERE s.id = @schoolId
        AND s.principal_id = @principalId
        AND sta.status = 'Resigned'

      ORDER BY sta.resigned_at DESC

      OFFSET @offset ROWS
      FETCH NEXT @pageSize ROWS ONLY;

      SELECT COUNT(*) AS totalResigned

      FROM dbo.SchoolTeacherApplications AS sta

      INNER JOIN dbo.Schools AS s
        ON s.id = sta.school_id

      WHERE s.id = @schoolId
        AND s.principal_id = @principalId
        AND sta.status = 'Resigned';
    `);
};
// 7. APPROVE A TEACHER
module.exports.approveTeacher = async (
  applicationId,
  principalId
) => {
  const pool = await connectDB();

  return pool.request()
    .input("applicationId", sql.Int, applicationId)
    .input("principalId", sql.Int, principalId)
    .query(`
      UPDATE sta

      SET
        status = 'Approved',
        approved_at = SYSUTCDATETIME(),
        reviewed_at = SYSUTCDATETIME(),
        denial_message = NULL

      FROM dbo.SchoolTeacherApplications AS sta

      INNER JOIN dbo.Schools AS s
        ON s.id = sta.school_id

      WHERE sta.id = @applicationId
        AND s.principal_id = @principalId
        AND sta.status = 'Pending';

      SELECT @@ROWCOUNT AS affectedRows;
    `);
};
// 8. DENY A TEACHER
module.exports.denyTeacher = async (
  applicationId,
  principalId,
  denialMessage
) => {
  const pool = await connectDB();

  return pool.request()
    .input("applicationId", sql.Int, applicationId)
    .input("principalId", sql.Int, principalId)
    .input(
      "denialMessage",
      sql.NVarChar(1000),
      denialMessage
    )
    .query(`
      UPDATE sta

      SET
        status = 'Denied',
        denial_message = @denialMessage,
        reviewed_at = SYSUTCDATETIME()

      FROM dbo.SchoolTeacherApplications AS sta

      INNER JOIN dbo.Schools AS s
        ON s.id = sta.school_id

      WHERE sta.id = @applicationId
        AND s.principal_id = @principalId
        AND sta.status = 'Pending';

      SELECT @@ROWCOUNT AS affectedRows;
    `);
};
