
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

module.exports.approveApplication = async (applicationId, adminId) => {
  const pool = await connectDB();
  const transaction = new sql.Transaction(pool);

  await transaction.begin();

  try {
    // 1. Find and lock the pending application.
    const applicationResult = await transaction.request()
      .input("id", sql.Int, applicationId)
      .query(`
        SELECT *
        FROM dbo.SchoolApplications WITH (UPDLOCK, HOLDLOCK)
        WHERE id = @id AND status = 'Pending';
      `);

    const application = applicationResult.recordset[0];

    // 2. Check that the application exists before using it.
    if (!application) {
      const error = new Error(
        "Application not found or already reviewed."
      );
      error.statusCode = 409;
      throw error;
    }

    // 3. Insert the approved school, including application_id.
    const schoolResult = await transaction.request()
      .input("applicationId", sql.Int, application.id)
      .input("schoolName", sql.NVarChar(200), application.school_name)
      .input("principalId", sql.Int, application.principal_id)
      .input("countryCode", sql.Char(2), application.country_code)
      .input("city", sql.NVarChar(100), application.city)
      .input("address", sql.NVarChar(255), application.address)
      .input("zipCode", sql.NVarChar(20), application.zip_code)
      .query(`
        INSERT INTO dbo.Schools (
          application_id,
          school_name,
          principal_id,
          country_code,
          city,
          address,
          zip_code
        )
        OUTPUT INSERTED.id
        VALUES (
          @applicationId,
          @schoolName,
          @principalId,
          @countryCode,
          @city,
          @address,
          @zipCode
        );
      `);

    // 4. Record which admin approved the application and when.
    const updateResult = await transaction.request()
      .input("id", sql.Int, application.id)
      .input("adminId", sql.Int, adminId)
      .query(`
        UPDATE dbo.SchoolApplications
        SET status = 'Approved',
            reviewed_by = @adminId,
            reviewed_at = SYSUTCDATETIME()
        WHERE id = @id AND status = 'Pending';

        SELECT @@ROWCOUNT AS affectedRows;
      `);

    if (updateResult.recordset[0].affectedRows !== 1) {
      const error = new Error(
        "The application could not be marked as approved."
      );
      error.statusCode = 409;
      throw error;
    }

    // 5. Commit both database changes together.
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

module.exports.getMySchools = async (principalId) => {
  const pool = await connectDB();

  return pool.request()
    .input("principalId", sql.Int, principalId)
    .query(`
      SELECT
        s.id,
        s.school_name,
        s.principal_id,
        s.country_code,
        c.country_name,
        s.city,
        s.address,
        s.zip_code,
        a.reviewed_at AS approved_at,
        admin.username AS approved_by
      FROM dbo.Schools AS s
      INNER JOIN dbo.Countries AS c
        ON c.country_code = s.country_code
      LEFT JOIN dbo.SchoolApplications AS a
        ON a.id = s.application_id
       AND a.status = 'Approved'
      LEFT JOIN dbo.Users AS admin
        ON admin.user_id = a.reviewed_by
      WHERE s.principal_id = @principalId
      ORDER BY s.id DESC;
    `);
};

module.exports.updateMySchool = async (
  schoolId,
  principalId,
  {
    schoolName,
    countryCode,
    city,
    address,
    zipCode,
  }
) => {
  const pool = await connectDB();

  return pool.request()
    .input("id", sql.Int, schoolId)
    .input("principalId", sql.Int, principalId)
    .input("schoolName", sql.NVarChar(200), schoolName)
    .input("countryCode", sql.Char(2), countryCode)
    .input("city", sql.NVarChar(100), city)
    .input("address", sql.NVarChar(255), address)
    .input("zipCode", sql.NVarChar(20), zipCode || null)
    .query(`
      UPDATE dbo.Schools
      SET school_name = @schoolName,
          country_code = @countryCode,
          city = @city,
          address = @address,
          zip_code = @zipCode
      WHERE id = @id
        AND principal_id = @principalId;

      SELECT @@ROWCOUNT AS affectedRows;
    `);
};

module.exports.deleteMySchool = async (
  schoolId,
  principalId
) => {
  const pool = await connectDB();

  return pool.request()
    .input("id", sql.Int, schoolId)
    .input("principalId", sql.Int, principalId)
    .query(`
      DELETE FROM dbo.Schools
      WHERE id = @id
        AND principal_id = @principalId;

      SELECT @@ROWCOUNT AS affectedRows;
    `);
};
