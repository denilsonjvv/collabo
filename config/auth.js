var Project = require("../models/project");
middlewareObj = {};

middlewareObj.userIsLogged = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash("info_msg", "Please log in to view this resource");
    res.redirect("/user/login");
  }
};

middlewareObj.checkIfOwner = function(req, res, next) {
  if (req.isAuthenticated()) {
    //find the Project with ID
    Project.findById(req.params.id, function(err, foundProject) {
      if (err) {
        res.redirect("back");
        req.flash("info_msg", "You must be logged in to access this page.");
      } else {
        if (foundProject.author.id.equals(req.user._id)) {
          next();
        } else {
          req.flash(
            "info_msg",
            "You are not the authorized owner of this post."
          );
          res.redirect("back");
        }
      }
    });
  } else {
    req.flash("info_msg", "You must be logged in to access this page.");
    res.redirect("back");
  }
};

module.exports = middlewareObj;
