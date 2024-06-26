const express = require("express");
const auth = require("../lib/auth");
const classesController = require("../controllers/classesController");
const router = express.Router();
const multer = require("multer");

const jwt = require('jsonwebtoken');
const { route } = require("./teachersRoute");
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
router.post("/create", authenticate, auth.isAuthorized(["Quản trị viên"]), auth.isActive(), classesController.createClass);
router.get("/get", authenticate, auth.isAuthorized(["Sinh viên", "Giảng viên", "Quản trị viên"]), auth.isActive(), classesController.getClassInfo);
router.get("/get_students", authenticate, auth.isAuthorized(["Sinh viên", "Giảng viên", "Quản trị viên"]), auth.isActive(), classesController.getStudentInClass);
router.post("/register", authenticate, auth.isAuthorized(["Sinh viên", "Giảng viên"]), auth.isActive(), classesController.registerClass);
router.post("/update_score", authenticate, auth.isAuthorized(["Giảng viên"]), auth.isActive(), classesController.updateScore);
router.put("/cancel_register", authenticate, auth.isAuthorized(["Sinh viên", "Giảng viên"]), auth.isActive(), classesController.cancelRegisterClass);
router.get("/get_score", authenticate, auth.isAuthorized(["Giảng viên"]), auth.isActive(), classesController.getScoreByTeacher);
// Storage file
// Set up Multer storage for file uploads
const storage = multer.memoryStorage();
const fileFilter = (req, file, done) => {
  if (!file) {
      return done(new Error("File không tồn tại."));
  }

  if (file.mimetype !== "application/pdf") { 
     return done(new Error("File không hợp lệ. Chỉ cho phép file pdf"));
  }

  const maxFileSize = 50 * 1024 * 1024;
  if (file.size > maxFileSize) {
      done(new Error("File có kích thước quá lớn. Tối đa 50MB được cho phép"));
  }

  if (file.originalname.length > 100) {
      done(new Error("Tên file quá dài. Tối đa 100 ký tự được cho phép."));
  }

  return done(null, true);
};
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter 
});

// Nộp file dành cho sinh viên
router.post("/submit_file", 
  authenticate, 
  auth.isAuthorized(["Sinh viên"]), 
  auth.isActive(),
  upload.single("submitFile"),
  classesController.submitFile
);

// Tải zip các file đã nộp trong một lớp của sinh viên
router.get("/get_files", 
  authenticate, 
  auth.isAuthorized(["Sinh viên", "Giảng viên"]), 
  auth.isActive(),
  classesController.getSubmitFiles
);


// Xóa file nộp
router.delete("/delete_file", 
  authenticate, 
  auth.isAuthorized(["Sinh viên"]), 
  auth.isActive(),
  classesController.deleteSubmitFile
);

// Trả về array tên file đã nộp
router.get("/show_files",
  authenticate, 
  auth.isAuthorized(["Sinh viên", "Giảng viên"]), 
  auth.isActive(),
  classesController.showSubmitFile
);

module.exports = router;