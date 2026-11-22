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

module.exports.updateMyExpertise = catchAsync(async (req, res) => {
  const { expertise } = req.body;

  // Validate that expertise is an array
  if (!Array.isArray(expertise) || expertise.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Please select at least one subject.",
    });
  }

  // Convert IDs to numbers (e.g. Postman may send strings)
  const numericExpertise = expertise.map(Number);

  // Validate IDs
  if (numericExpertise.some((id) => !Number.isInteger(id) || id <= 0)) {
    return res.status(400).json({
      success: false,
      message: "Invalid subject selection.",
    });
  }

  // Remove duplicates
  const uniqueExpertise = [...new Set(numericExpertise)];

  const teacherId = req.session.user_id;

  const updatedExpertise = await TeacherExpertise.updateMyExpertise(
    teacherId,
    uniqueExpertise,
  );

  return res.status(200).json({
    success: true,
    message: "Your expertise has been updated successfully!",
    expertise: updatedExpertise,
  });
});
