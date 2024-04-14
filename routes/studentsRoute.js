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

const sessionStrategy = new LocalStrategy({
    usernameField: "username",
    passwordField: "password",
}, async (username, password, done) => {
    try {
        // console.log(username, password);
        const Student = await Students.getOneStudent({ username: username });
        if (!Student.success) { 
            done(null, false);
        }
        const passwordFromDatabase = Student.data.password;
        const match = bcrypt.compareSync(password, passwordFromDatabase);

        if (!match) {
            return done(null, false);
        }

        const student_id = Student.data.student_id;
        const role = Student.data.role;
        const active = Student.data.active;
        //const active = staff.active;
        return done(null, {
            student_id,
            role,
            active,
        });
    } catch (error) {
        console.log(error);
        done(error);
    }
});

passport.use("studentLogin", sessionStrategy);

router.post("/login", passport.authenticate("studentLogin"), (req, res, next) => {
    passport.authenticate("studentLogin", (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({ error: true, valid: false, message: "Xác thực thất bại." });
        }
        console.log(user);
        return res.status(200).json({ error: false, valid: true, message: "Xác thực thành công." });
    })(req, res, next);
});

router.post("/create", auth.isAuthenticated(), auth.isAuthorized(["Quản trị viên"]), auth.isActive(), studentsController.createStudent);
router.post("/get",auth.isAuthenticated(), auth.isAuthorized(["Sinh viên", "Quản trị viên"]), auth.isActive(), studentsController.getInfoStudent);
router.put("/update", auth.isAuthenticated(), auth.isAuthorized(["Sinh viên", "Quản trị viên"]), auth.isActive(), studentsController.updateInfoStudent);
router.delete("/delete", auth.isAuthenticated(), auth.isAuthorized(["Quản trị viên"]), auth.isActive(), studentsController.deleteStudent);
router.get("/get_classes",  auth.isAuthenticated(), auth.isAuthorized(["Sinh viên"]), auth.isActive(), studentsController.getClasses),
router.put("/update_password", studentsController.updatePassword);

router.post(
    "/create_by_file",
    auth.isAuthenticated(),
    auth.isAuthorized(["Quản trị viên"]),
    upload.single("file"),
    studentsController.createStudentsByFile,
);
module.exports = router;