const express = require("express");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const auth = require("../lib/auth");
const adminsController = require("../controllers/adminsController");
const Admins = require("../database/Admins");
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
            admin_id: jwtPayload.admin_id,
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


passport.use("adminLogin", jwtStrategy);

router.post('/login', async (req, res, next) => {
    try {
        const { username, password } = req.body;

        // Find user based on the username
        const Admin = await Admins.getOneAdmin({ username: username });
        if (!Admin.success || !Admin.data) { 
            return res.status(401).json({ error: 'Unauthorized: Invalid username or password' });
        }
        const passwordFromDatabase = Admin.data.password;
        const match = bcrypt.compareSync(password, passwordFromDatabase);

        if (!match) {
            return res.status(401).json({ error: 'Unauthorized: Invalid username or password' });
        }

        // Generate JWT token
        const token = jwt.sign({
            admin_id: Admin.data.admin_id,
            role: Admin.data.role,
            active: Admin.data.active,
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

router.get('/protected-route', passport.authenticate('adminLogin', { session: false }), (req, res) => {
    // If the request reaches here, it means the user has been authenticated successfully
    console.log("Hello World", req.user);
    res.send('You have accessed the protected route!');
});

// const sessionStrategy = new LocalStrategy({
//     usernameField: "username",
//     passwordField: "password",
// }, async (username, password, done) => {
//     try {
//         console.log(username, password);
//         const Admin = await Admins.getOneAdmin({ username: username });

//         if (!Admin) {
//             done(null, false);
//         }
//         const passwordFromDatabase = Admin.password;
//         const match = bcrypt.compareSync(password, passwordFromDatabase);

//         if (!match) {
//             return done(null, false);
//         }

//         const admin_id = Admin.admin_id;
//         const role = Admin.role;
//         const active = 1;

//         return done(null, {
//             admin_id,
//             role,
//             active,
//         });
//     } catch (error) {
//         console.log(error);
//         done(error);
//     }
// });

// passport.use("adminLogin", sessionStrategy);

// router.post("/login", passport.authenticate("adminLogin"), (req, res, next) => {
//     passport.authenticate("adminLogin", (err, user, info) => {
//         if (err) {
//             return next(err);
//         }
//         if (!user) {
//             return res.status(401).json({ error: true, valid: false, message: "Xác thực thất bại." });
//         }

//         return res.status(200).json({ error: false, valid: true, message: "Xác thực thành công." });
//     })(req, res, next);
// });

router.post("/create", adminsController.createAdmin);

module.exports = router;