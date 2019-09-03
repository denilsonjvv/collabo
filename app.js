const express = require("express"),
  app = express(),
  flash = require("connect-flash"),
  cookieParser = require("cookie-parser"),
  mongoose = require("mongoose"),
  session = require("express-session"),
  passport = require("passport"),
  bodyParser = require("body-parser"),
  LocalStrategy = require("passport-local"),
  methodOverride = require("method-override"),
  User = require("./models/user");
const indexRoutes = require("./routes/index"),
  homeRoutes = require("./routes/home"),
  profileRoutes = require("./routes/profile");

//Passport config
// require("./config/passport")(passport);
mongoose.connect("mongodb://localhost/collabotest", { useNewUrlParser: true });

//allows express to track files as .ejs
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method")); // allows PUT and DELETE as a post request

// Express session
app.use(
  session({
    secret: "Team Management",
    resave: true,
    saveUninitialized: false
  })
);
//Connect flash messages
app.use(flash());
//Global vars
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.info_msg = req.flash("info_msg");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

//Passport middleware
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Locate Routes
app.use("/user", indexRoutes); //login and register
app.use(homeRoutes); //  "/"
app.use("/profile", profileRoutes);

//-----------------LISTENING TO APP SERVER
const hostname = "127.0.0.1";
const port = 4000;
app.listen(port, hostname, () => {
  console.log(`Server running: http://${hostname}:${port}/`);
});

//creates new schema
// Project.create(
//   {
//     title: "My First Blog!",
//     description: "I love cats, blah blah blaaah!",
//     author: {
//       name: "Denilson",
//       profileImg: "proImage.png"
//     }
//   },
//   function(err, project) {
//     if (err) {
//       console.log(err);
//     } else {
//       console.log("newly created campground!");
//       console.log(project);
//     }
//   }
// );
