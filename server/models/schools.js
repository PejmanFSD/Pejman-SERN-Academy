
const { sql, connectDB } = require("../config/db");
// inserting a pending application, not creating an approved school yet!
module.exports.createApplication = async ({
  schoolName,
  principalId,
  countryCode,
  city,
  address,
  zipCode,
}) => {
  const pool = await connectDB();

  return pool.request()
    .input("schoolName", sql.NVarChar(200), schoolName)
    .input("principalId", sql.Int, principalId)
    .input("countryCode", sql.Char(2), countryCode)
    .input("city", sql.NVarChar(100), city)
    .input("address", sql.NVarChar(255), address)
    .input("zipCode", sql.NVarChar(20), zipCode || null)
    .query(`
      IF EXISTS (
        SELECT 1
        FROM dbo.Schools
        WHERE school_name = @schoolName
      )
      BEGIN
        THROW 50001, 'School name already exists', 1;
      END;

      INSERT INTO dbo.SchoolApplications (
        school_name,
        principal_id,
        country_code,
        city,
        address,
        zip_code
      )
      OUTPUT INSERTED.id
      VALUES (
        @schoolName,
        @principalId,
        @countryCode,
        @city,
        @address,
        @zipCode
      );
    `);
};
// Fetching all the pending schools for admins:
module.exports.getPendingApplications = async () => {
  const pool = await connectDB();

  return pool.request().query(`
    SELECT
      a.id,
      a.school_name,
      a.principal_id,
      u.username AS principal_username,
      a.country_code,
      c.country_name,
      a.city,
      a.address,
      a.zip_code,
      a.created_at
    FROM dbo.SchoolApplications AS a
    INNER JOIN dbo.Users AS u
      ON u.user_id = a.principal_id
    INNER JOIN dbo.Countries AS c
      ON c.country_code = a.country_code
    WHERE a.status = 'Pending'
    ORDER BY a.created_at ASC;
  `);
};
// Approving a school by an admin:
module.exports.approveApplication = async (
  applicationId,
  adminId
) => {
  const pool = await connectDB();
  const transaction = new sql.Transaction(pool);

  await transaction.begin();

  try {
    const applicationResult = await transaction.request()
      .input("id", sql.Int, applicationId)
      .query(`
        SELECT *
        FROM dbo.SchoolApplications WITH (UPDLOCK, HOLDLOCK)
        WHERE id = @id AND status = 'Pending';
      `);

    const application = applicationResult.recordset[0];

    if (!application) {
      const error = new Error(
        "Application not found or already reviewed."
      );
      error.statusCode = 409;
      throw error;
    }

    const schoolResult = await transaction.request()
      .input("schoolName", sql.NVarChar(200), application.school_name)
      .input("principalId", sql.Int, application.principal_id)
      .input("countryCode", sql.Char(2), application.country_code)
      .input("city", sql.NVarChar(100), application.city)
      .input("address", sql.NVarChar(255), application.address)
      .input("zipCode", sql.NVarChar(20), application.zip_code)
      .query(`
        INSERT INTO dbo.Schools (
          school_name,
          principal_id,
          country_code,
          city,
          address,
          zip_code
        )
        OUTPUT INSERTED.id
        VALUES (
          @schoolName,
          @principalId,
          @countryCode,
          @city,
          @address,
          @zipCode
        );
      `);

    await transaction.request()
      .input("id", sql.Int, applicationId)
      .input("adminId", sql.Int, adminId)
      .query(`
        UPDATE dbo.SchoolApplications
        SET status = 'Approved',
            reviewed_by = @adminId,
            reviewed_at = SYSUTCDATETIME()
        WHERE id = @id AND status = 'Pending';
      `);

    await transaction.commit();

    return {
      schoolId: schoolResult.recordset[0].id,
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
// Rejecting a school by an admin:
module.exports.rejectApplication = async (
  applicationId,
  adminId
) => {
  const pool = await connectDB();

  const result = await pool.request()
    .input("id", sql.Int, applicationId)
    .input("adminId", sql.Int, adminId)
    .query(`
      UPDATE dbo.SchoolApplications
      SET status = 'Rejected',
          reviewed_by = @adminId,
          reviewed_at = SYSUTCDATETIME()
      WHERE id = @id
        AND status = 'Pending';
    `);

  if (result.rowsAffected[0] !== 1) {
    const error = new Error(
      "Application not found or already reviewed."
    );
    error.statusCode = 409;
    throw error;
  }
};
