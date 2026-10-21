
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

// Admins approve or reject applications
router.patch(
  "/applications/:id/approve",
  requireRole("Admin"),
  catchAsync(schoolsController.approveApplication)
);

router.patch(
  "/applications/:id/reject",
  requireRole("Admin"),
  catchAsync(schoolsController.rejectApplication)
);

module.exports = router;
