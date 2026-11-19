const express = require("express");
const router = express.Router();

const subjectsController = require("../controllers/subjects");
const catchAsync = require("../utils/catchAsync");

router.get(
    "/subject-categories",
    catchAsync(subjectsController.getCategories)
);

router.get(
    "/subject-categories/:categoryId/subjects",
    catchAsync(subjectsController.getSubjectsByCategory)
);

module.exports = router;