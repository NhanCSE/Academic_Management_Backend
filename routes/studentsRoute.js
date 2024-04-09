const express = require("express");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const auth = require("../lib/auth");
const studentsController = require("../controllers/studentsController");
const Students = require("../database/Students");
const router = express.Router();

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
router.get("/get",auth.isAuthenticated(), auth.isAuthorized(["Sinh viên", "Quản trị viên"]), auth.isActive(), studentsController.getInfoStudent);
router.put("/update", auth.isAuthenticated(), auth.isAuthorized(["Sinh viên", "Quản trị viên"]), auth.isActive(), studentsController.updateInfoStudent);
router.delete("/delete", auth.isAuthenticated(), auth.isAuthorized(["Quản trị viên"]), auth.isActive(), studentsController.deleteStudent);
router.post("/registerSubject", studentsController.registerSubject);
router.put("/update_password", studentsController.updatePassword);


module.exports = router;