const express = require("express");
const teachersController = require("../controllers/teachersController");
const router = express.Router();

router.post("/createTeacher", teachersController.createTeacher);
router.get("/getInfoTeacher", teachersController.getInfoTeacher);
router.get("/getAllTeacher", teachersController.getAllTeacher);
router.put("/updateInfoTeacher", teachersController.updateInfoTeacher);
router.delete("/deleteTeacher", teachersController.deleteTeacher);

module.exports = router;