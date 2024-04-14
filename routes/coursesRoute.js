const express = require("express");
const auth = require("../lib/auth");
const coursesController = require("../controllers/coursesController");

const router = express.Router();

router.post("/create", auth.isAuthenticated(), auth.isAuthorized(["Quản trị viên"]), auth.isActive(), coursesController.createCourse);
router.post("/get", auth.isAuthenticated(), auth.isAuthorized(["Quản trị viên", "Giảng viên", "Sinh viên"]), auth.isActive(), coursesController.getInfoCourse);
router.put("/update", auth.isAuthenticated(), auth.isAuthorized(["Quản trị viên"]), auth.isActive(), coursesController.updateCourse);
router.delete("/delete", auth.isAuthenticated(), auth.isAuthorized(["Quản trị viên"]), auth.isActive(), coursesController.deleteCourse);
router.get("/get_classes", auth.isAuthenticated(), auth.isAuthorized(["Quản trị viên", "Giảng viên", "Sinh viên"]), auth.isActive(), coursesController.getAllClassesInCourse)
module.exports = router