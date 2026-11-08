const SchoolTeacherApplications = require(
  "../models/schoolTeacherApplications"
);
// 1. TEACHER: GET APPROVED SCHOOLS
module.exports.getApprovedSchools = async (req, res) => {
  const page = Number(req.query.page) || 1;

  if (!Number.isSafeInteger(page) || page < 1) {
    return res.status(400).json({
      error: "Invalid page number."
    });
  }

  const result =
    await SchoolTeacherApplications.getApprovedSchools(
      req.session.user_id,
      page,
      6
    );

  return res.status(200).json({
    schools: result.recordsets[0],
    totalSchools: result.recordsets[1][0].totalSchools,
    currentPage: page,
    totalPages: Math.ceil(
      result.recordsets[1][0].totalSchools / 6
    )
  });
};
// 2. TEACHER: APPLY TO SCHOOL
module.exports.applyToSchool = async (req, res) => {
  const schoolId = Number(req.params.schoolId);

  if (!Number.isSafeInteger(schoolId) || schoolId < 1) {
    return res.status(400).json({
      error: "Invalid school ID."
    });
  }

  try {
    await SchoolTeacherApplications.applyToSchool(
      schoolId,
      req.session.user_id
    );

    return res.status(200).json({
      message: "Your application has been submitted."
    });

  } catch (error) {
    if (error.number === 50002) {
      return res.status(404).json({
        error: "School not found."
      });
    }

    if (error.number === 50003 || error.number === 50004) {
      return res.status(409).json({
        error: error.message
      });
    }

    throw error;
  }
};
// 3. TEACHER: REQUEST RECONSIDERATION
module.exports.requestReconsideration = async (req, res) => {
  const schoolId = Number(req.params.schoolId);

  const { reconsiderationMessage } = req.body || {};

  if (!Number.isSafeInteger(schoolId) || schoolId < 1) {
    return res.status(400).json({
      error: "Invalid school ID."
    });
  }

  if (
    typeof reconsiderationMessage !== "string" ||
    !reconsiderationMessage.trim() ||
    reconsiderationMessage.trim().length > 1000
  ) {
    return res.status(400).json({
      error: "Please provide a reconsideration message (maximum 1000 characters)."
    });
  }

  const result =
    await SchoolTeacherApplications.requestReconsideration(
      schoolId,
      req.session.user_id,
      reconsiderationMessage.trim()
    );

  if (result.recordset[0].affectedRows !== 1) {
    return res.status(409).json({
      error: "Your application cannot be reconsidered."
    });
  }

  return res.status(200).json({
    message: "Your reconsideration request has been submitted."
  });
};
// 4. TEACHER: RESIGN
module.exports.resignFromSchool = async (req, res) => {
  const schoolId = Number(req.params.schoolId);

  if (!Number.isSafeInteger(schoolId) || schoolId < 1) {
    return res.status(400).json({
      error: "Invalid school ID."
    });
  }

  const result =
    await SchoolTeacherApplications.resignFromSchool(
      schoolId,
      req.session.user_id
    );

  if (result.recordset[0].affectedRows !== 1) {
    return res.status(409).json({
      error: "You are not currently accepted in this school."
    });
  }

  return res.status(200).json({
    message: "You have successfully resigned from this school."
  });
};
// 5. PRINCIPAL: GET PENDING APPLICATIONS
module.exports.getPendingTeacherApplications = async (
  req,
  res
) => {
  const schoolId = Number(req.params.schoolId);
  const page = Number(req.query.page) || 1;

  if (
    !Number.isSafeInteger(schoolId) || schoolId < 1 ||
    !Number.isSafeInteger(page) || page < 1
  ) {
    return res.status(400).json({
      error: "Invalid school ID or page number."
    });
  }

  const result =
    await SchoolTeacherApplications.getPendingTeacherApplications(
      schoolId,
      req.session.user_id,
      page,
      3
    );

  const total = result.recordsets[1][0].totalApplications;

  return res.status(200).json({
    applications: result.recordsets[0],
    totalApplications: total,
    currentPage: page,
    totalPages: Math.ceil(total / 3)
  });
};
// 6. PRINCIPAL: GET RESIGNED TEACHERS
module.exports.getResignedTeachers = async (req, res) => {
  const schoolId = Number(req.params.schoolId);
  const page = Number(req.query.page) || 1;

  if (
    !Number.isSafeInteger(schoolId) || schoolId < 1 ||
    !Number.isSafeInteger(page) || page < 1
  ) {
    return res.status(400).json({
      error: "Invalid school ID or page number."
    });
  }

  const result =
    await SchoolTeacherApplications.getResignedTeachers(
      schoolId,
      req.session.user_id,
      page,
      3
    );

  const total = result.recordsets[1][0].totalResigned;

  return res.status(200).json({
    teachers: result.recordsets[0],
    totalTeachers: total,
    currentPage: page,
    totalPages: Math.ceil(total / 3)
  });
};
// 7. PRINCIPAL: APPROVE TEACHER
module.exports.approveTeacher = async (req, res) => {
  const applicationId = Number(req.params.applicationId);

  if (
    !Number.isSafeInteger(applicationId) ||
    applicationId < 1
  ) {
    return res.status(400).json({
      error: "Invalid application ID."
    });
  }

  const result =
    await SchoolTeacherApplications.approveTeacher(
      applicationId,
      req.session.user_id
    );

  if (result.recordset[0].affectedRows !== 1) {
    return res.status(409).json({
      error: "Application not found, not owned by you, or already reviewed."
    });
  }

  return res.status(200).json({
    message: "Teacher approved successfully."
  });
};
// 8. PRINCIPAL: DENY TEACHER
module.exports.denyTeacher = async (req, res) => {
  const applicationId = Number(req.params.applicationId);

  const { denialMessage } = req.body || {};

  if (
    !Number.isSafeInteger(applicationId) ||
    applicationId < 1
  ) {
    return res.status(400).json({
      error: "Invalid application ID."
    });
  }

  if (
    typeof denialMessage !== "string" ||
    !denialMessage.trim() ||
    denialMessage.trim().length > 1000
  ) {
    return res.status(400).json({
      error: "Please provide a denial message (maximum 1000 characters)."
    });
  }

  const result =
    await SchoolTeacherApplications.denyTeacher(
      applicationId,
      req.session.user_id,
      denialMessage.trim()
    );

  if (result.recordset[0].affectedRows !== 1) {
    return res.status(409).json({
      error: "Application not found, not owned by you, or already reviewed."
    });
  }

  return res.status(200).json({
    message: "Teacher application denied successfully."
  });
};
