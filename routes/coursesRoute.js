const express = require("express");
const auth = require("../lib/auth");
const coursesController = require("../controllers/coursesController");

const router = express.Router();
const jwt = require('jsonwebtoken');
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

router.post("/create", authenticate, auth.isAuthorized(["Quản trị viên"]), auth.isActive(), coursesController.createCourse);
router.post("/get", authenticate, auth.isAuthorized(["Quản trị viên", "Giảng viên", "Sinh viên"]), auth.isActive(), coursesController.getInfoCourse);
router.put("/update",authenticate, auth.isAuthorized(["Quản trị viên"]), auth.isActive(), coursesController.updateCourse);
router.delete("/delete",authenticate, auth.isAuthorized(["Quản trị viên"]), auth.isActive(), coursesController.deleteCourse);
router.get("/get_classes", authenticate, auth.isAuthorized(["Quản trị viên", "Giảng viên", "Sinh viên"]), auth.isActive(), coursesController.getAllClassesInCourse)
module.exports = router