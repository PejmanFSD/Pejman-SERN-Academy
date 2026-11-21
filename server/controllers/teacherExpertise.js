const TeacherExpertise = require("../models/teacherExpertise");
const catchAsync = require("../utils/catchAsync");

module.exports.getMyExpertise = catchAsync(async (req, res) => {
  const teacherId = req.session.user_id;

  const result = await TeacherExpertise.getMyExpertise(teacherId);

  return res.status(200).json({
    success: true,
    expertise: result.recordset,
  });
});
