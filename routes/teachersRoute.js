const express = require("express");
const bcrypt = require("bcrypt");
const auth = require("../lib/auth");
const teachersController = require("../controllers/teachersController");
const Teachers = require("../database/Teachers");
const router = express.Router();
const jwt = require('jsonwebtoken');

//hàm đăng nhập
//Bước 1 lấy thông tin GV qua username, nếu ko thành công hoặc ko có dữ liệu -> báo invalid
//Bước 2 lấy password từ db rồi so sánh với passw đã nhập => nếu ko trùng khớp -> báo invalid
//Bước 3 Nếu đúng B1 và B2 thì trả về 1 token có thời hạn trong 1h
router.post('/login', async (req, res, next) => {
    try {
        const { username, password } = req.body;

        // B1
        const Teacher = await Teachers.getOneTeacher({ username: username });
        if (!Teacher.success || !Teacher.data) { 
            return res.status(401).json({ error: 'Unauthorized: Invalid username or password' });
        }
        //B2
        const passwordFromDatabase = Teacher.data.password;
        const match = bcrypt.compareSync(password, passwordFromDatabase);

        if (!match) {
            return res.status(401).json({ error: 'Unauthorized: Invalid username or password' });
        }
        //B3
        // Generate JWT token
        const token = jwt.sign({
            teacher_id: Teacher.data.teacher_id,
            role: Teacher.data.role,
            active: 1,
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
    //console.log(token);
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
  
//Các hàm thao tác với Giảng viên
router.post("/create", authenticate, auth.isAuthorized(["Quản trị viên"]), auth.isActive(), teachersController.createTeacher);
router.post("/get", authenticate, auth.isAuthorized(["Quản trị viên", "Giảng viên"]), auth.isActive(), teachersController.getInfoTeacher);

router.put("/update", authenticate, auth.isAuthorized(["Quản trị viên", "Giảng viên"]), auth.isActive(), teachersController.updateInfoTeacher);
router.delete("/delete", authenticate, auth.isAuthorized(["Quản trị viên"]), auth.isActive(), teachersController.deleteTeacher);
router.put("/update_password", authenticate, auth.isAuthorized(["Quản trị viên", "Giảng viên"]), auth.isActive(), teachersController.updatePassword);
router.get("/get_classes", authenticate, auth.isAuthorized(["Giảng viên"]), auth.isActive(), teachersController.getClasses);

module.exports = router;