const express = require("express");
const auth = require("../lib/auth");
const coursesController = require("../controllers/coursesController");

const router = express.Router();
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

/*
CÁC TRƯỜNG THÔNG TIN CỦA MÔN HỌC
    "course_name": string
    "credits": int => số tín chỉ
    "course_type": string
    "major": array string
    "faculty" : string
    "course_condition" : array string gồm các course_id tiên quyết
    "student_condition" : int (1/2/3/4/5)
    "classes": subcollection
*/

//Chỉ admin được tạo MH
router.post("/create", authenticate, auth.isAuthorized(["Quản trị viên"]), auth.isActive(), coursesController.createCourse);
//Tất cả mn đều có thể xem được thông tin môn học
router.post("/get", authenticate, auth.isAuthorized(["Quản trị viên", "Giảng viên", "Sinh viên"]), auth.isActive(), coursesController.getInfoCourse);
//Chỉ admin được cập nhật và xóa mh
router.put("/update",authenticate, auth.isAuthorized(["Quản trị viên"]), auth.isActive(), coursesController.updateCourse);
router.delete("/delete",authenticate, auth.isAuthorized(["Quản trị viên"]), auth.isActive(), coursesController.deleteCourse);
//Tất cả mn đều có thể xem được thông tin lớp của môn học
router.get("/get_classes", authenticate, auth.isAuthorized(["Quản trị viên", "Giảng viên", "Sinh viên"]), auth.isActive(), coursesController.getAllClassesInCourse)
module.exports = router