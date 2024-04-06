const express = require("express");
const teachersController = require("../controllers/teachersController");
const router = express.Router();

router.post("/create", teachersController.createTeacher);
router.get("/get", teachersController.getInfoTeacher);

router.put("/update", teachersController.updateInfoTeacher);
router.delete("/delete", teachersController.deleteTeacher);

module.exports = router;