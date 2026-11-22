const express = require("express");
const router = express.Router();

const teacherExpertiseController = require("../controllers/teacherExpertise");
const { requireRole } = require("../middleware");

router.get(
  "/my-expertise",
  requireRole("Teacher"),
  teacherExpertiseController.getMyExpertise,
);

router.put(
  "/my-expertise",
  requireRole("Teacher"),
  teacherExpertiseController.updateMyExpertise,
);

module.exports = router;
