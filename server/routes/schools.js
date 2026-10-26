
const express = require("express");
const router = express.Router();
const { requireRole } = require("../middleware");
const catchAsync = require("../utils/catchAsync");
const schoolsController = require("../controllers/schools");

// Principals submit school applications
router.post(
  "/applications",
  requireRole("Principal"),
  catchAsync(schoolsController.createApplication)
);
// Admins see pending applications
router.get(
  "/applications/pending",
  requireRole("Admin"),
  catchAsync(schoolsController.getPendingApplications)
);
// Admins approve applications
router.patch(
  "/applications/:id/approve",
  requireRole("Admin"),
  catchAsync(schoolsController.approveApplication)
);
// Admins reject applications
router.patch(
  "/applications/:id/reject",
  requireRole("Admin"),
  catchAsync(schoolsController.rejectApplication)
);
// Principals retrieve their approved schools
router.get(
  "/my-schools",
  requireRole("Principal"),
  catchAsync(schoolsController.getMySchools)
);
// Principals retrieve their rejected schools
router.get(
  "/my-applications/rejected",
  requireRole("Principal"),
  catchAsync(schoolsController.getMyRejectedApplications)
);

// Principal: edit their own school
router.put(
  "/:id",
  requireRole("Principal"),
  catchAsync(schoolsController.updateMySchool)
);
// Principal: delete their own school
router.delete(
  "/:id",
  requireRole("Principal"),
  catchAsync(schoolsController.deleteMySchool)
);

module.exports = router;