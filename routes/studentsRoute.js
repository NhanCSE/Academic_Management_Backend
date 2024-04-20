const express = require("express");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const auth = require("../lib/auth");
const studentsController = require("../controllers/studentsController");
const Students = require("../database/Students");
const router = express.Router();
const fs = require("fs");
const multer = require("multer");
const path = require("path");

const jwt = require('jsonwebtoken');


router.post('/login', async (req, res, next) => {
    try {
        const { username, password } = req.body;

        // Find user based on the username
        const Student = await Students.getOneStudent({ username: username });
        if (!Student.success || !Student.data) { 
            return res.status(401).json({ error: 'Unauthorized: Invalid username or password' });
        }
        const passwordFromDatabase = Student.data.password;
        const match = bcrypt.compareSync(password, passwordFromDatabase);

        if (!match) {
            return res.status(401).json({ error: 'Unauthorized: Invalid username or password' });
        }

        // Generate JWT token
        const token = jwt.sign({
            student_id: Student.data.student_id,
            role: Student.data.role,
            active: Student.data.active,
        }, process.env.JWT_SECRET, { expiresIn: '1h' });
        
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
  

const storage = multer.diskStorage({	
    destination: async function (req, file, done) {
        const folderPath = path.join("storage", "students_document", "students_temp");
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }
        
        return done(null, folderPath);
    },

    filename: function (req, file, done) {
        done(null,  Date.now() + "_" + file.originalname);
    }
});

const fileFilter = (req, file, done) => {
    if (!file) {
        return done(new Error("File không tồn tại."));
    }

    if (file.mimetype === "application/vnd.ms-excel") { 
       return done(new Error("File không hợp lệ. Chỉ cho phép file .xlsx"));
    }

    const maxFileSize = 5 * 1024 * 1024;
    if (file.size > maxFileSize) {
        done(new Error("File có kích thước quá lớn. Tối đa 5MB được cho phép"));
    }

    if (file.originalname.length > 100) {
        done(new Error("Tên file quá dài. Tối đa 100 ký tự được cho phép."));
    }

    return done(null, true);
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
});

router.post("/create", authenticate, auth.isAuthorized(["Quản trị viên"]), auth.isActive(), studentsController.createStudent);
router.post("/get", authenticate, auth.isAuthorized(["Sinh viên", "Quản trị viên"]), auth.isActive(), studentsController.getInfoStudent);
router.put("/update", authenticate, auth.isAuthorized(["Sinh viên", "Quản trị viên"]), auth.isActive(), studentsController.updateInfoStudent);
router.delete("/delete", authenticate, auth.isAuthorized(["Quản trị viên"]), auth.isActive(), studentsController.deleteStudent);
router.get("/get_classes", authenticate, auth.isAuthorized(["Sinh viên"]), auth.isActive(), studentsController.getClasses),
router.get("/get_score", authenticate, auth.isAuthorized(["Sinh viên"]), auth.isActive(), studentsController.getScore),
router.put("/update_password", studentsController.updatePassword);

router.post(
    "/create_by_file",
    authenticate,
    auth.isAuthorized(["Quản trị viên"]),
    upload.single("file"),
    studentsController.createStudentsByFile,
);
module.exports = router;