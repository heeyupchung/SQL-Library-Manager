var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

const Book = require("./models").Book;

const errorRoutes = require("./routes/error");
var indexRouter = require("./routes/index");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);

const sequelize = require("./models").sequelize;

(async () => {
	try {
		await sequelize.authenticate();
		console.log("Connection to the database successful!");
	} catch (error) {
		console.error("Error connecting to the database: ", error);
	}
})();

//Handles 404 errors
app.use(errorRoutes.fourOneFourHandler);

//Handles global errors
app.use(errorRoutes.globalHandler);

module.exports = app;
