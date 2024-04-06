const express = require("express");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const auth = require("../lib/auth");
const adminsController = require("../controllers/adminsController");
const Admins = require("../database/Admins");
const router = express.Router();

const sessionStrategy = new LocalStrategy({
    usernameField: "username",
    passwordField: "password",
}, async (username, password, done) => {
    try {
        console.log(username, password);
        const Admin = await Admins.getOneAdmin({ username: username });

        if (!Admin) {
            done(null, false);
        }
        const passwordFromDatabase = Admin.password;
        const match = bcrypt.compareSync(password, passwordFromDatabase);

        if (!match) {
            return done(null, false);
        }

        const admin_id = Admin.admin_id;
        const role = Admin.role;
        //const active = staff.active;

        return done(null, {
            admin_id,
            role,
            // active,
        });
    } catch (error) {
        console.log(error);
        done(error);
    }
});

passport.use("adminLogin", sessionStrategy);

router.post("/login", passport.authenticate("adminLogin"), (req, res, next) => {
    passport.authenticate("adminLogin", (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({ error: true, valid: false, message: "Xác thực thất bại." });
        }

        return res.status(200).json({ error: false, valid: true, message: "Xác thực thành công." });
    })(req, res, next);
});

router.post("/create", adminsController.createAdmin);

module.exports = router;