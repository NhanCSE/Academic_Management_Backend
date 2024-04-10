const express = require("express");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const auth = require("../lib/auth");
const teachersController = require("../controllers/teachersController");
const Teachers = require("../database/Teachers");
const router = express.Router();


const sessionStrategy = new LocalStrategy({
    usernameField: "username",
    passwordField: "password",
}, async (username, password, done) => {
    try {
        // console.log(username, password);
        const Teacher = await Teachers.getOneTeacher({ username: username });
        if (!Teacher.success) { 
            done(null, false);
        }
        const passwordFromDatabase = Teacher.data.password;
        const match = bcrypt.compareSync(password, passwordFromDatabase);

        if (!match) {
            return done(null, false);
        }

        const teacher_id = Teacher.data.teacher_id;
        const role = Teacher.data.role;
        const active = 1;
        //const active = staff.active;
        return done(null, {
            teacher_id,
            role,
            active,
        });
    } catch (error) {
        console.log(error);
        done(error);
    }
});

passport.use("teacherLogin", sessionStrategy);

router.post("/login", passport.authenticate("teacherLogin"), (req, res, next) => {
    passport.authenticate("teacherLogin", (err, user, info) => {
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
router.post("/create", auth.isAuthenticated(), auth.isAuthorized(["Quản trị viên"]), auth.isActive(), teachersController.createTeacher);
router.get("/get", auth.isAuthenticated(), auth.isAuthorized(["Quản trị viên", "Giảng viên"]), auth.isActive(), teachersController.getInfoTeacher);

router.put("/update", auth.isAuthenticated(), auth.isAuthorized(["Quản trị viên", "Giảng viên"]), auth.isActive(), teachersController.updateInfoTeacher);
router.delete("/delete", auth.isAuthenticated(), auth.isAuthorized(["Quản trị viên"]), auth.isActive(), teachersController.deleteTeacher);
router.put("/update_password", auth.isAuthenticated(), auth.isAuthorized(["Quản trị viên", "Giảng viên"]), auth.isActive(), teachersController.updatePassword);
module.exports = router;