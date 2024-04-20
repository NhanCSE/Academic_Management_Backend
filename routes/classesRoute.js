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

const jwt = require('jsonwebtoken');
// Middleware to authenticate requests
const authenticate = (req, res, next) => {
    const token = req.headers.authorization;
    console.log(token);
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
  
    // Verify token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
      }
      req.user = decoded; // Attach decoded user information to request object
      next(); // Proceed to next middleware
    });
};
router.post("/create", authenticate, auth.isAuthorized(["Quản trị viên"]), auth.isActive(), classesController.createClass);
router.post("/register", authenticate, auth.isAuthorized(["Sinh viên", "Giảng viên"]), auth.isActive(), classesController.registerClass);
router.post("/update_score", authenticate, auth.isAuthorized(["Giảng viên"]), auth.isActive(), classesController.updateScore);
router.put("/cancel_register", authenticate, auth.isAuthorized(["Sinh viên", "Giảng viên"]), auth.isActive(), classesController.cancelRegisterClass);
module.exports = router;