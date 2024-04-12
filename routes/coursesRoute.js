const express = require("express");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const auth = require("../lib/auth");
const coursesController = require("../controllers/coursesController");
const Courses = require("../database/Courses");
const router = express.Router();

router.post("/create", auth.isAuthenticated(), auth.isAuthorized(["Quản trị viên"]), auth.isActive(), coursesController.createCourse);
router.get("/get", auth.isAuthenticated(), auth.isAuthorized(["Quản trị viên", "Giảng viên", "Sinh viên"]), auth.isActive(), coursesController.getInfoCourse);
router.put("/update", auth.isAuthenticated(), auth.isAuthorized(["Quản trị viên"]), auth.isActive(), coursesController.updateCourse);
router.delete("/delete", auth.isAuthenticated(), auth.isAuthorized(["Quản trị viên"]), auth.isActive(), coursesController.deleteCourse);
module.exports = router