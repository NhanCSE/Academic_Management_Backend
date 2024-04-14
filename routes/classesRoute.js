const express = require("express");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const auth = require("../lib/auth");
const classesController = require("../controllers/classesController");
const router = express.Router();
const fs = require("fs");
const multer = require("multer");
const path = require("path");

router.post("/create",  auth.isAuthenticated(), auth.isAuthorized(["Quản trị viên"]), auth.isActive(), classesController.createClass);
router.post("/register", auth.isAuthenticated(), auth.isAuthorized(["Sinh viên", "Giảng viên"]), auth.isActive(), classesController.registerClass);
router.post("/update_score", auth.isAuthenticated(), auth.isAuthorized(["Giảng viên"]), auth.isActive(), classesController.updateScore);
router.put("/cancel_register", auth.isAuthenticated(), auth.isAuthorized(["Sinh viên", "Giảng viên"]), auth.isActive(), classesController.cancelRegisterClass);
module.exports = router;