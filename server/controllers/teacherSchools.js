const TeacherSchools = require("../models/teacherSchools");
const catchAsync = require("../utils/catchAsync");

module.exports.getSchoolDetails = catchAsync(async (req, res) => {
  const schoolId = Number(req.params.schoolId);

  if (!Number.isInteger(schoolId) || schoolId <= 0) {
    return res.status(400).json({
      error: "Invalid school ID.",
    });
  }

  const school = await TeacherSchools.getSchoolDetails(schoolId);

  if (!school) {
    return res.status(404).json({
      error: "School not found.",
    });
  }

  res.status(200).json({
    success: true,
    school,
  });
});