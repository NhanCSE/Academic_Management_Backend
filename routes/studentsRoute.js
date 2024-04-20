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
            student_id: jwtPayload.student_id,
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


passport.use("studentLogin", jwtStrategy);

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
  
  // Protected route
// router.get('/protected-route', authenticate, (req, res) => {
// // If the request reaches here, it means the user has been authenticated successfully
// res.send('You have accessed the protected route!');
// });

router.get('/protected-route', passport.authenticate('studentLogin', { session: false }), (req, res) => {
    // If the request reaches here, it means the user has been authenticated successfully
    console.log("Hello World", req.user);
    res.send('You have accessed the protected route!');
});



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

// const sessionStrategy = new LocalStrategy({
//     usernameField: "username",
//     passwordField: "password",
// }, async (username, password, done) => {
//     try {
//         // console.log(username, password);
//         const Student = await Students.getOneStudent({ username: username });
//         if (!Student.success) { 
//             done(null, false);
//         }
//         const passwordFromDatabase = Student.data.password;
//         const match = bcrypt.compareSync(password, passwordFromDatabase);

//         if (!match) {
//             return done(null, false);
//         }

//         const student_id = Student.data.student_id;
//         const role = Student.data.role;
//         const active = Student.data.active;
//         //const active = staff.active;
//         return done(null, {
//             student_id,
//             role,
//             active,
//         });
//     } catch (error) {
//         console.log(error);
//         done(error);
//     }
// });

// passport.use("studentLogin", sessionStrategy);

// router.post("/login", passport.authenticate("studentLogin"), (req, res, next) => {
//     passport.authenticate("studentLogin", (err, user, info) => {
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

router.post("/create", auth.isAuthenticated(), auth.isAuthorized(["Quản trị viên"]), auth.isActive(), studentsController.createStudent);
router.post("/get",auth.isAuthenticated(), auth.isAuthorized(["Sinh viên", "Quản trị viên"]), auth.isActive(), studentsController.getInfoStudent);
router.put("/update", auth.isAuthenticated(), auth.isAuthorized(["Sinh viên", "Quản trị viên"]), auth.isActive(), studentsController.updateInfoStudent);
router.delete("/delete", auth.isAuthenticated(), auth.isAuthorized(["Quản trị viên"]), auth.isActive(), studentsController.deleteStudent);
router.get("/get_classes", passport.authenticate('studentLogin', { session: false }), auth.isAuthenticated(), auth.isAuthorized(["Sinh viên"]), auth.isActive(), studentsController.getClasses),
router.get("/get_score",  auth.isAuthenticated(), auth.isAuthorized(["Sinh viên"]), auth.isActive(), studentsController.getScore),
router.put("/update_password", studentsController.updatePassword);

router.post(
    "/create_by_file",
    auth.isAuthenticated(),
    auth.isAuthorized(["Quản trị viên"]),
    upload.single("file"),
    studentsController.createStudentsByFile,
);
module.exports = router;