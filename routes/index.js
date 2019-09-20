let express = require("express");
let router = express.Router({ mergeParams: true });
let passport = require("passport"),
  User = require("../models/user"),
  UserNames = require("../models/userNames");
let multer = require("multer"),
  path = require("path"),
  fs = require("fs");

// AUTH ROUTES
router.get("/login", function(req, res) {
  res.render("login");
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/user/login",
    failureFlash: true
  }),
  function(req, res) {}
);

//Show register form
router.get("/register", function(req, res) {
  res.render("register");
});

var imgUpload = multer({
  storage: multer.diskStorage({
    destination: function(req, file, callback) {
      callback(null, "./public/pro-img");
    },
    filename: function(req, file, callback) {
      callback(
        null,
        file.fieldname + "-" + Date.now() + path.extname(file.originalname)
      );
    }
  }),
  limits: {
    fileSize: 10200 //size limit of file 500,000 = 0.012mb
  },
  fileFilter: function(req, file, callback) {
    var ext = path.extname(file.originalname);
    if (ext !== ".png" && ext !== ".jpg" && ext !== ".gif" && ext !== ".jpeg") {
      return callback(/*res.end('Only images are allowed')*/ null, false);
    }
    callback(null, true);
  }
});
//Create new user
router.post("/register", imgUpload.single("profileImg"), function(req, res) {
  var { name, email, password, password2 } = req.body;
  let errors = [];
  //check if profile file is selected  **The ERROR function for file size is not finished
  if (req.file) {
    var profileImg = req.file.filename; //File name from multer
    if (req.file.size > 10200) {
      errors.push({ msg: "File size was too large" });
    }
  }
  // else {
  //   fs.unlink("./public/" + file.path); // unfinished
  // }

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
    User.findOne({ email: email }, function(err, user) {
      if (user) {
        //User exists
        errors.push({ msg: "Email is already registered" });
        res.render("register", { errors, name, email, password, password2 });
      } else {
        if (profileImg) {
          //check if profile image file is selected
          var userInfo = {
            name: name,
            profileImg: profileImg,
            email: email
          };
        } else {
          var userInfo = { name: name, email: email }; // , password: password
        }
        User.register(new User(userInfo), req.body.password, function(
          err,
          user
        ) {
          if (err) {
            console.log(err);
          } else {
            var userNamesInfo = { name };
            UserNames.create(userNamesInfo, function(err, userNameCreated) {
              if (err) {
                console.log("There was an error updating userNames model");
              } else {
                req.flash(
                  "success_msg",
                  "You are now registered and can log in"
                );
                res.redirect("login");
              }
            });
          }
        });
      }
    });
  }
});

//Logout Handler
router.get("/logout", function(req, res) {
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("/user/login");
});

//Global Router
module.exports = router;
