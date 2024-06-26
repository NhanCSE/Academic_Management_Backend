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
const teachersRoute = require("./routes/teachersRoute");
const coursesRoute = require("./routes/coursesRoute");
const classesRoute = require("./routes/classesRoute");


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// app.use(function(req, res, next) {
// 	res.header("Access-Control-Allow-Origin", "https://stu-admin.vercel.app");
// 	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
// 	next();
// });

const allowedOrigins = ["http://localhost:3000", "https://stu-admin.vercel.app", "https://stinfo-beta.vercel.app"];

app.set("trust proxy", 1);

// Sử dụng cors middleware với tùy chọn chỉ cho phép các trang web trong danh sách
app.use(cors({
	origin: function (origin, callback) {
		if (!origin || allowedOrigins.includes(origin)) {
			callback(null, true);
		} else {
			callback(new Error('Not allowed by CORS'));
		}
	},
	// Thêm các tùy chọn khác nếu cần thiết
	methods: 'GET, HEAD, PUT, PATCH, POST, DELETE',
	credentials: true,
}));

app.use(passport.initialize());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use("/api/v1/students", studentsRoute);
app.use("/api/v1/admins", adminsRoute);
app.use("/api/v1/courses", coursesRoute);
app.use("/api/v1/classes", classesRoute);

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
app.use("/api/v1/teachers", teachersRoute);


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
