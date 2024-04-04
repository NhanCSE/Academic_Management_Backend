var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const dotenv = require("dotenv");
const session = require("express-session");
const FirestoreStore = require("firestore-store")(session);
const database = require("./firebase/firebaseConnection");
const cron = require("cron");
const cors = require("cors");
const passport = require("passport");
const auth = require("./lib/auth");
dotenv.config();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

const studentsRoute = require("./routes/studentsRoute");
const adminsRoute = require("./routes/adminsRoute");

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


const sessionMiddleware = session({
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: false,
	store: new FirestoreStore({
    database: database
  }),
	cookie: {
		// secure: false,
		// sameSite: 'None',
		httpOnly: false,
		maxAge: 12 * 60 * 60 * 1000,
	}
});
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use("/api/v1/students", studentsRoute);
app.use("/api/v1/admins", adminsRoute);


app.use("/get_session", (req, res) => {
	console.log(req.user);
	res.status(200).json({
		error: false,
		message: "Lấy phiên đăng nhập thành công.",
	});
});
app.get("/destroy_session", (req, res) => {
	req.logout(() => {
		req.session.destroy();
	});
	return res.status(200).json({
		error: false,
		message: "Hủy phiên hoạt động thành công.",
	});
});

passport.serializeUser(auth.setSession);
passport.deserializeUser((user, done) => {
	auth.verifyPermission(user, done);
});



app.use("/get_session", (req, res) => {
	console.log(req.user);
	res.status(200).json({
		error: false,
		message: "Lấy phiên đăng nhập thành công.",
	});
});
app.get("/destroy_session", (req, res) => {
	req.logout(() => {
		req.session.destroy();
	});
	return res.status(200).json({
		error: false,
		message: "Hủy phiên hoạt động thành công.",
	});
});

passport.serializeUser(auth.setSession);
passport.deserializeUser((user, done) => {
	auth.verifyPermission(user, done);
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

const cleanUpExpiredSession = new cron.CronJob("0 */12 * * *", async () => {
    try {
        const currentTime = new Date();
        const snapshot = await database.collection("sessions").where("expires", "<", currentTime).get();
        const batch = database.batch();

        snapshot.forEach(doc => {
            batch.delete(doc.ref);
        });

        await batch.commit();
        console.log("Expired sessions have been cleared successfully!");
    } catch (err) {
        console.error("Error cleaning up expired sessions:", err);
    }
});

cleanUpExpiredSession.start();

module.exports = app;
