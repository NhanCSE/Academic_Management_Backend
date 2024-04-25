const express = require("express");
const bcrypt = require("bcrypt");
const auth = require("../lib/auth");
const adminsController = require("../controllers/adminsController");
const Admins = require("../database/Admins");
const router = express.Router();
const multer = require("multer");
const jwt = require('jsonwebtoken');
/*
trường thông tin của QTV:
    "fullname": string
    "admin_id": string
    "username"
    "password"
    "role": "Quản trị viên"
    "active": 1/0

*/
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


//hàm đăng nhập
//Bước 1 lấy thông tin admin qua username, nếu ko thành công hoặc ko có dữ liệu -> báo invalid
//Bước 2 lấy password từ db rồi so sánh với passw đã nhập => nếu ko trùng khớp -> báo invalid
//Bước 3 Nếu đúng B1 và B2 thì trả về 1 token có thời hạn trong 1h
router.post('/login', async (req, res, next) => {
    try {
        const { username, password } = req.body;

        //Bước 1
        const Admin = await Admins.getOneAdmin({ username: username });
        if (!Admin.success || !Admin.data) { 
            return res.status(401).json({ error: 'Unauthorized: Invalid username or password' });
        }
        //Bước 2
        const passwordFromDatabase = Admin.data.password;
        const match = bcrypt.compareSync(password, passwordFromDatabase);

        if (!match) {
            return res.status(401).json({ error: 'Unauthorized: Invalid username or password' });
        }
        //Bước 3
        // Generate JWT token
        const token = jwt.sign({
            admin_id: Admin.data.admin_id,
            role: Admin.data.role,
            active: 1,
        }, process.env.JWT_SECRET, { expiresIn: '1h' });
        
        // Return success response with token
        return res.status(200).json({ error: false, valid: true, message: 'Xác thực thành công.', token });
    } catch (error) {
        // Forward error to error handling middleware
        next(error);
    }
});


//Một admin đã có tạo tài khoản cho admin mới
router.post("/create", authenticate, auth.isAuthorized(["Quản trị viên"]), auth.isActive(), adminsController.createAdmin);

module.exports = router;