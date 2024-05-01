const express = require("express");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const auth = require("../lib/auth");
const teachersController = require("../controllers/teachersController");
const Teachers = require("../database/Teachers");
const router = express.Router();

const fs = require("fs");
const multer = require("multer");
const path = require("path");

const jwt = require('jsonwebtoken');


router.post('/login', async (req, res, next) => {
    try {
        const { username, password } = req.body;

        // Find user based on the username
        const Teacher = await Teachers.getOneTeacher({ username: username });
        if (!Teacher.success || !Teacher.data) { 
            return res.status(401).json({ error: 'Unauthorized: Invalid username or password' });
        }
        const passwordFromDatabase = Teacher.data.password;
        const match = bcrypt.compareSync(password, passwordFromDatabase);

        if (!match) {
            return res.status(401).json({ error: 'Unauthorized: Invalid username or password' });
        }

        // Generate JWT token
        const token = jwt.sign({
            teacher_id: Teacher.data.teacher_id,
            role: Teacher.data.role,
            active: 1,
        }, process.env.JWT_SECRET, { expiresIn: '10h' });
        
        // Return success response with token
        return res.status(200).json({ error: false, valid: true, message: 'Xác thực thành công.', token });
    } catch (error) {
        // Forward error to error handling middleware
        next(error);
    }
});


// Middleware to authenticate requests
const authenticate = (req, res, next) => {
    const token = req.headers.authorization;
    console.log(`Token sent to server: ${token}`);
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
  
    // Verify token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: `Unauthorized: Invalid token ${token}` });
      }
      req.user = decoded; // Attach decoded user information to request object
      next(); // Proceed to next middleware
    });
};
  

router.post("/create", authenticate, auth.isAuthorized(["Quản trị viên"]), auth.isActive(), teachersController.createTeacher);
router.post("/get", authenticate, auth.isAuthorized(["Quản trị viên", "Giảng viên"]), auth.isActive(), teachersController.getInfoTeacher);

router.put("/update", authenticate, auth.isAuthorized(["Quản trị viên", "Giảng viên"]), auth.isActive(), teachersController.updateInfoTeacher);
router.delete("/delete", authenticate, auth.isAuthorized(["Quản trị viên"]), auth.isActive(), teachersController.deleteTeacher);
router.put("/update_password", authenticate, auth.isAuthorized(["Quản trị viên", "Giảng viên"]), auth.isActive(), teachersController.updatePassword);
router.get("/get_classes", authenticate, auth.isAuthorized(["Giảng viên"]), auth.isActive(), teachersController.getClasses);

module.exports = router;