var express = require("express");
var router = express.Router({ mergeParams: true });

var Project = require("../models/project"),
  User = require("../models/user"),
  UserNames = require("../models/userNames"),
  Task = require("../models/task"),
  Updates = require("../models/updates"),
  auth = require("../config/auth"); // connect to auth file to authorize.

//Search Members route to Assign to Project
router.get("/search", function(req, res, next) {
  var q = req.query.q;
  UserNames.find(
    {
      name: {
        $regex: new RegExp(q),
        $options: "$i"
      }
    },
    {
      _id: 0,
      __v: 0
    },
    function(err, data) {
      res.json(data);
    }
  ).limit(10);
});

//Show Post Form
router.get("/new", auth.userIsLogged, function(req, res) {
  res.render("projects/new", { user: req.user });
});
//SHOW project page
router.get("/:id", auth.userIsLogged, function(req, res) {
  Project.findById(req.params.id)
    .populate("tasks")
    .exec(function(err, foundProject) {
      if (err && "") {
        res.render("errors/project", { projectID: req.params.id }); // First Error Handling Page
      } else {
        res.render("projects/show", { project: foundProject });
      }
    });
});
//CREATE new project
router.post("/", auth.userIsLogged, function(req, res) {
  var title = req.body.title;
  var description = req.body.description;
  var author = {
    id: req.user._id,
    name: req.user.name,
    profileImg: req.user.profileImg
  };
  var newProject = {
    title: title,
    description: description,
    author: author
  };
  //Create a new blog and save to database
  Project.create(newProject, function(err, newProject) {
    if (err) {
      console.log(err);
    } else {
      let newUpdate = {
        name: author.name,
        projectName: title,
        projectId: newProject._id
      };
      Updates.create(newUpdate, function(err, newlyUpdated) {
        if (err) {
          console.log("Error uploading newTask error.");
        } else {
          newlyUpdated.save();
          newProject.updates.push(newlyUpdated);
          newProject.save();
          //successfully added data to update
          // NOTE: This will need to be refactored/modified for better error handling
          req.flash(
            "success_msg",
            "Your new project has been created, check it out below!"
          );
          res.redirect("/p/" + newProject._id + "/newtask"); //redirect back to campgrounds page
        }
      });
    }
  });
});
//Assign users to project Page
router.get("/:id/assign", auth.checkIfOwner, auth.userIsLogged, function(
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
      User.find({}, function(err, foundUsers) {
        res.render("projects/assign", { project, users: foundUsers });
      });
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
router.put("/:id", auth.checkIfOwner, auth.userIsLogged, function(req, res) {
  Project.findByIdAndUpdate(req.params.id, req.body.project, function(
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
router.get("/:id/newtask", auth.userIsLogged, function(req, res) {
  Project.findById(req.params.id, function(err, foundProject) {
    if (err) {
      res.render("errors/project", { projectID: req.params.id });
    } else {
      User.find({}, function(err, foundUsers) {
        res.render("tasks/new", { project: foundProject, user: foundUsers });
      });
    }
  });
});

// Create new task
router.post("/:id", auth.userIsLogged, function(req, res) {
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
  Project.findById(req.params.id, function(err, foundProject) {
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
