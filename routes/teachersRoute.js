const express = require("express");
const teachersController = require("../controllers/teachersController");
const router = express.Router();

router.post("/create", teachersController.createTeacher);
router.get("/getInfoTeacher", teachersController.getInfoTeacher)

module.exports = router;