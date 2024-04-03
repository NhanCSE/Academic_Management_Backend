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
        console.log(username, password);
        const Student = await Students.getOneStudent({ username: username });
        if (!Student) {
            done(null, false);
        }
        const passwordFromDatabase = Student.password;
        const match = bcrypt.compareSync(password, passwordFromDatabase); 
        if (!match) {
            return done(null, false);
        }

        const student_id = Student.student_id;
        const role = Student.role;
        //const active = staff.active;

        return done(null, {
            student_id,
            role,
            // active,
        });
    } catch (error) {
        console.log(error);
        done(error);
    }
});

passport.use("normalLogin", sessionStrategy);

router.post("/login", passport.authenticate("normalLogin"), (req, res, next) => {
    passport.authenticate("normalLogin", (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({ error: true, valid: false, message: "Xác thực thất bại." });
        }

        return res.status(200).json({ error: false, valid: true, message: "Xác thực thành công." });
    })(req, res, next);
});

router.post("/create", studentsController.createStudent);
router.post("/createSubject", studentsController.createSubject);
router.get("/getInfoStudent", studentsController.getInfoStudent);
router.get("/getAllStudents", studentsController.getAllStudents);
router.put("/updateInfoStudent", studentsController.updateInfoStudent);
router.delete("/deleteStudent", studentsController.deleteStudent);
router.post("/registerSubject", studentsController.registerSubject);

module.exports = router;