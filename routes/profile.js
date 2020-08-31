var express = require("express");
var router = express.Router({ mergeParams: true });
var User = require("../models/user"),
  auth = require("../config/auth"); // check if user is logged in // check if user is logged in

// landing page
router.get("/:id", auth.userIsLogged, function(req, res) {
  User.findById(req.params.id, function(err, foundProfile) {
    if (err) {
      req.flash("error_msg", "The user ID you are looking for does not exist.");
      res.redirect("/");
    } else {
      //render show template for that blog
      res.render("profile/show", { user: foundProfile });
    }
  });
});
//Edit profile page
router.get("/:id/edit", auth.userIsLogged, function(req, res) {
  User.findById(req.params.id, function(err, foundProfile) {
    if (err) {
      req.flash("error_msg", "The user ID you are looking for does no exist.");
      res.redirect("/");
    } else {
      //render show template for that blog
      res.render("profile/edit", { user: foundProfile });
    }
  });
});
// UPDATE the Profile
router.put("/:id", auth.userIsLogged, function(req, res) {
  var name = req.body.name;
  var email = req.body.email;
  User.findOneAndUpdate(
    { _id: req.params.id },
    { $set: { name: name, email: email } },
    function(err, result) {
      if (err) {
        req.flash(
          "error_msg",
          "There was a problem updating your project, try again."
        );
        res.redirect("/");
      } else {
        res.send(result); //Important for Ajax Done function to fire
      }
    }
  );
});

//Global Router
module.exports = router;
