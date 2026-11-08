const express = require("express");
const router = express.Router();

const { requireRole } = require("../middleware");
const catchAsync = require("../utils/catchAsync");

const controller = require(
  "../controllers/schoolTeacherApplications"
);
// TEACHER ROUTES
// Get all approved schools
router.get(
  "/teacher/schools",
  requireRole("Teacher"),
  catchAsync(controller.getApprovedSchools)
);
// Apply to a school
router.post(
  "/teacher/schools/:schoolId/apply",
  requireRole("Teacher"),
  catchAsync(controller.applyToSchool)
);
// Request reconsideration
router.post(
  "/teacher/schools/:schoolId/reconsider",
  requireRole("Teacher"),
  catchAsync(controller.requestReconsideration)
);
// Resign from a school
router.patch(
  "/teacher/schools/:schoolId/resign",
  requireRole("Teacher"),
  catchAsync(controller.resignFromSchool)
);
// PRINCIPAL ROUTES
// Get pending applications for one of their schools
router.get(
  "/principal/schools/:schoolId/teacher-applications",
  requireRole("Principal"),
  catchAsync(controller.getPendingTeacherApplications)
);
// Get resigned teachers
router.get(
  "/principal/schools/:schoolId/resigned-teachers",
  requireRole("Principal"),
  catchAsync(controller.getResignedTeachers)
);
// Approve teacher
router.patch(
  "/principal/teacher-applications/:applicationId/approve",
  requireRole("Principal"),
  catchAsync(controller.approveTeacher)
);
// Deny teacher
router.patch(
  "/principal/teacher-applications/:applicationId/deny",
  requireRole("Principal"),
  catchAsync(controller.denyTeacher)
);
module.exports = router;