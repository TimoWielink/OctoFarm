const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");

const app = express();

//Passport Config
require("./config/passport.js")(passport);

//DB Config
const db = require("./config/db.js").MongoURI;

//Mongo Connect
mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected..."))
  .catch(err => console.log(err));

//JSON
app.use(express.json());

//EJS
app.use(expressLayouts);
app.set("view engine", "ejs");

//Bodyparser
app.use(express.urlencoded({ extended: false }));

// Express Session Middleware
app.use(
  session({
    secret: "supersecret",
    resave: true,
    saveUninitialized: true
  })
);

//Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//Connect Flash Middleware
app.use(flash());

//Global Vars
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

//Routes
app.use(express.static(__dirname + "/views"));
if (db === "") {
  app.use("/", require("./routes/index"));
} else {
  app.use("/", require("./routes/index"));
  app.use("/users", require("./routes/users"));
  app.use("/printers", require("./routes/printers"));
}

//Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, console.log(`Server started on port ${PORT}`));
if (db != "") {
  //Start backend metrics gathering...
  const runner = require("./runners/state.js");
  const Runner = runner.Runner;
  Runner.init();
}
