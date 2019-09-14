var express = require("express");
var router = express.Router({ mergeParams: true });

var Project = require("../models/project"),
  User = require("../models/user"),
  Task = require("../models/task"),
  auth = require("../config/auth"); // connect to auth file to authorize.

//SHOW project page
router.get("/:id", auth.userIsLogged, function(req, res) {
  Project.findById(req.params.id)
    .populate("tasks")
    .exec(function(err, foundProject) {
      if (err) {
        res.render("errors/project", { projectID: req.params.id }); // First Error Handling Page
      } else {
        res.render("projects/show", { project: foundProject });
      }
    });
});
//Edit project page
router.get("/:id/edit", auth.checkIfOwner, auth.userIsLogged, function(
  req,
  res
) {
  Project.findById(req.params.id, function(err, project) {
    if (err) {
      req.flash(
        "info_msg",
        "There was a problem accessing your project, try again."
      );
      res.redirect("/");
    } else {
      res.render("projects/edit", { project });
    }
  });
});
//UPDATE project page
router.put("/:proj_id", auth.checkIfOwner, auth.userIsLogged, function(
  req,
  res
) {
  Project.findByIdAndUpdate(req.params.proj_id, req.body.project, function(
    err,
    project
  ) {
    if (err) {
      req.flash(
        "info_msg",
        "There was a problem updating your project, try again."
      );
      res.redirect("back");
    } else {
      res.redirect("/p/" + project._id);
    }
  });
});
//DESTROY project page
router.delete("/:id", auth.userIsLogged, auth.checkIfOwner, function(
  req,
  res,
  next
) {
  Project.findById(req.params.id, function(err, project) {
    if (err) return next(err);
    project.delete();
    // Need to add flash message for deletion confirmation
    res.redirect("/");
  });
});

// New task page
router.get("/:task_id/new", auth.userIsLogged, function(req, res) {
  Project.findById(req.params.task_id, function(err, foundProject) {
    if (err) {
      res.render("errors/project", { projectID: req.params.task_id });
    } else {
      User.find({}, function(err, foundUsers) {
        res.render("tasks/new", { project: foundProject, user: foundUsers });
      });
    }
  });
});

// Create new task
router.post("/:proj_id", auth.userIsLogged, function(req, res) {
  var task = req.body.task;
  var assigned = req.body.assigned;
  var priority = req.body.priority;
  var dueDate = req.body.dueDate;
  var project = {
    id: req.params.id
  };
  var createdby = {
    id: req.user._id,
    name: req.user.name,
    profileImg: req.user.profileImg
  };
  var newTask = {
    task: task,
    assigned: assigned,
    priority: priority,
    dueDate: dueDate,
    project: project,
    createdby: createdby
  };
  Project.findById(req.params.proj_id, function(err, foundProject) {
    if (err) {
      console.log("project ID not found error.");
      res.redirect("/");
    } else {
      Task.create(newTask, function(err, foundTask) {
        if (err) {
          console.log("Task not found error.");
        } else {
          foundTask.save();
          foundProject.tasks.push(foundTask);
          foundProject.save();
          res.redirect("/p/" + foundProject._id); //redirect back to campgrounds page
        }
      });
    }
  });
});
//Edit task page
router.get("/:proj_id/:task_id/edit", function(req, res) {
  Project.findById(req.params.proj_id, function(err, project) {
    if (err) {
      req.flash(
        "info_msg",
        "There was a problem accessing this project ID, try again."
      );
      res.redirect("/");
    } else {
      Task.findById(req.params.task_id, function(err, task) {
        if (err) {
        } else {
          User.find({}, function(err, foundUsers) {
            res.render("tasks/edit", { task, project, user: foundUsers });
          });
        }
      });
    }
  });
});
//DELETE task
router.delete("/:proj_id/:task_id", function(req, res, next) {
  Project.findById(req.params.proj_id, function(err, foundProject) {
    if (err) {
      console.log("project ID not found error.");
      res.redirect("/");
    } else {
      //findbyIDandRemove
      Task.findById(req.params.task_id, function(err, foundTask) {
        if (err) {
          // error handler needed
          res.redirect("back");
        } else {
          foundProject.tasks.remove(foundTask);
          foundProject.save();
          foundTask.remove();
          res.redirect("/p/" + req.params.proj_id);
        }
      });
    }
  });
});

//Global Router
module.exports = router;
