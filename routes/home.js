var express = require("express");
var mongoose = require("mongoose");
var router = express.Router({ mergeParams: true });

var Project = require("../models/project"),
  auth = require("../config/auth"); // connect to auth file to authorize.

// Landing page
router.get("/", auth.userIsLogged, async function(req, res) {
  try {
    Project.find({})
      .populate({
        path: "updates",
        options: { sort: { _id: -1 } }
      }) // null, { isRead: false } //shows if isRead is false
      .exec(async function(err, allProjects) {
        if (err) {
          console.log("Landing page error");
        } else {
          res.render("index", {
            projects: allProjects,
            name: req.user.name
          });
        }
      });
  } catch (err) {
    res.redirect("back");
  }
});

//Global Router
module.exports = router;
