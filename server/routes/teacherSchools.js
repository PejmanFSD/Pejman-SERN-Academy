const express = require("express");
const router = express.Router();

const teacherSchoolsController = require("../controllers/teacherSchools");
const { requireRole } = require("../middleware");

router.get(
  "/schools/:schoolId/details",
  requireRole("Teacher"),
  teacherSchoolsController.getSchoolDetails,
);

module.exports = router;