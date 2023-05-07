let express = require("express");
let router = express.Router({ mergeParams: true });
let passport = require("passport"),
  User = require("../models/user");

// AUTH ROUTES
router.get("/login", function (req, res) {
  res.render("login");
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/user/login",
    failureFlash: true,
  }),
  function (req, res) {}
);

//Show register form
router.get("/register", function (req, res) {
  res.render("register");
});

//Create new user
router.post("/register", function (req, res) {
  var { name, profileImg, email, password, password2 } = req.body;
  let errors = [];

  //check required fields
  if (!name || !email || !password || !password2) {
    errors.push({ msg: "Fill in all fields please" });
  }
  //check passwords match
  if (password !== password2) {
    errors.push({ msg: "Passwords do not match" });
  }
  // Check pass length
  if (password.length < 6) {
    errors.push({ msg: "Password should be at least 6 characters" });
  }
  if (errors.length > 0) {
    res.render("register", { errors, name, email, password, password2 });
  } else {
    //validate passed
    User.findOne({ email: email }, function (err, user) {
      if (user) {
        //User exists
        errors.push({ msg: "Email is already registered" });
        res.render("register", {
          errors,
          name,
          email,
          password,
          password2,
        });
      } else {
        var userInfo = {
          name: name,
          profileImg: profileImg,
          email: email,
        };
        User.register(
          new User(userInfo),
          req.body.password,
          function (err, user) {
            if (err) {
              console.log(err);
            } else {
              req.flash("success_msg", "You are now registered and can log in");
              res.redirect("login");
            }
          }
        );
      }
    });
  }
});

//Logout Handler
router.get("/logout", function (req, res) {
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("/user/login");
});

//Global Router
module.exports = router;
