const express = require("express");
const studentsController = require("../controllers/studentsController");
const router = express.Router();

router.post("/create", studentsController.createStudent);
router.post("/createSubject", studentsController.createSubject);
router.get("/getStudent/:id", studentsController.getStudent);
router.get("/getAllStudents", studentsController.getAllStudents);
router.put("/updateStudent/:id", studentsController.updateStudent);

router.post("/registerSubject/:id", studentsController.registerSubject);

module.exports = router;