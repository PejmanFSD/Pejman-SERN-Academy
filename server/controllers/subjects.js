const subjectsModel = require("../models/subjects");

exports.getCategories = async (req, res) => {
    const categories = await subjectsModel.getCategories();

    res.status(200).json({
        success: true,
        categories
    });
};

exports.getSubjectsByCategory = async (req, res) => {
    const categoryId = Number(req.params.categoryId);

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid category ID."
        });
    }

    const subjects = await subjectsModel.getSubjectsByCategory(categoryId);

    res.status(200).json({
        success: true,
        subjects
    });
};