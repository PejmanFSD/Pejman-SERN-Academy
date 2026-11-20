const express = require("express");
const router = express.Router();

const teachersController = require("../controllers/teachers");
const { requireRole } = require("../middleware");

router.get(
  "/my-approved-schools",
  requireRole("Teacher"),
  teachersController.getMyApprovedSchools
);

module.exports = router;