const Teachers = require("../models/teachers");
const catchAsync = require("../utils/catchAsync");

module.exports.getMyApprovedSchools = catchAsync(async (req, res) => {
  const teacherId = req.session.user_id;

  const result = await Teachers.getMyApprovedSchools(teacherId);

  return res.status(200).json({
    success: true,
    schools: result.recordset,
  });
});
