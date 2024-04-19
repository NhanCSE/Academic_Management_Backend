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
const passportJWT = require('passport-jwt');
const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;


const jwtOpts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
};

const jwtStrategy = new JwtStrategy(jwtOpts, async (jwtPayload, done) => {
    try {
        // Find user based on the payload data (e.g., user ID)
        console.log("Hlloe", jwtPayload);
        // Include additional information in the user object
        const user = {
            teacher_id: jwtPayload.teacher_id,
            role: jwtPayload.role,
            active: jwtPayload.active,
            // Include any other relevant information
        };
 
        console.log(user);
        return done(null, user);
    } catch (error) {
        console.log(error.message);
        return done(error, false);
    }
});


passport.use("teacherLogin", jwtStrategy);

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
            active: Teacher.data.active,
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
  
  // Protected route
// router.get('/protected-route', authenticate, (req, res) => {
// // If the request reaches here, it means the user has been authenticated successfully
// res.send('You have accessed the protected route!');
// });

router.get('/protected-route', passport.authenticate('teacherLogin', { session: false }), (req, res) => {
    // If the request reaches here, it means the user has been authenticated successfully
    console.log("Hello World", req.user);
    res.send('You have accessed the protected route!');
});

// const sessionStrategy = new LocalStrategy({
//     usernameField: "username",
//     passwordField: "password",
// }, async (username, password, done) => {
//     try {
//         // console.log(username, password);
//         const Teacher = await Teachers.getOneTeacher({ username: username });
//         if (!Teacher.success) { 
//             done(null, false);
//         }
//         const passwordFromDatabase = Teacher.data.password;
//         const match = bcrypt.compareSync(password, passwordFromDatabase);

//         if (!match) {
//             return done(null, false);
//         }

//         const teacher_id = Teacher.data.teacher_id;
//         const role = Teacher.data.role;
//         const active = 1;
//         //const active = staff.active;
//         return done(null, {
//             teacher_id,
//             role,
//             active,
//         });
//     } catch (error) {
//         console.log(error);
//         done(error);
//     }
// });

// passport.use("teacherLogin", sessionStrategy);

// router.post("/login", passport.authenticate("teacherLogin"), (req, res, next) => {
//     passport.authenticate("teacherLogin", (err, user, info) => {
//         if (err) {
//             return next(err);
//         }
//         if (!user) {
//             return res.status(401).json({ error: true, valid: false, message: "Xác thực thất bại." });
//         }
//         console.log(user);
//         return res.status(200).json({ error: false, valid: true, message: "Xác thực thành công." });
//     })(req, res, next);
// });
router.post("/create", auth.isAuthenticated(), auth.isAuthorized(["Quản trị viên"]), auth.isActive(), teachersController.createTeacher);
router.post("/get", auth.isAuthenticated(), auth.isAuthorized(["Quản trị viên", "Giảng viên"]), auth.isActive(), teachersController.getInfoTeacher);

router.put("/update", auth.isAuthenticated(), auth.isAuthorized(["Quản trị viên", "Giảng viên"]), auth.isActive(), teachersController.updateInfoTeacher);
router.delete("/delete", auth.isAuthenticated(), auth.isAuthorized(["Quản trị viên"]), auth.isActive(), teachersController.deleteTeacher);
router.put("/update_password", auth.isAuthenticated(), auth.isAuthorized(["Quản trị viên", "Giảng viên"]), auth.isActive(), teachersController.updatePassword);
router.get("/get_classes", auth.isAuthenticated(), auth.isAuthorized(["Giảng viên"]), auth.isActive(), teachersController.getClasses);

module.exports = router;