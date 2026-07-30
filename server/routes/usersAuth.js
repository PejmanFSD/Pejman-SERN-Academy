const express = require("express");
const router = express.Router();

const usersAuthController = require("../controllers/usersAuth");

router.get("/", (req, res) => {
    res.send("Users Auth Route");
});

router.post("/register", usersAuthController.registerUser);

module.exports = router;