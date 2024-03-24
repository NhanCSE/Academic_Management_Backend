const express = require("express");
const studentsController = require("../controllers/studentsController");
const router = express.Router();

router.post("/create", studentsController.createStudent);

module.exports = router;