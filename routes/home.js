var express = require("express");
var mongoose = require("mongoose");
var router = express.Router({ mergeParams: true });

var Project = require("../models/project"),
  User = require("../models/user"),
  Updates = require("../models/updates"),
  Task = require("../models/task"),
  auth = require("../config/auth"); // connect to auth file to authorize.

// Landing page
router.get("/", auth.userIsLogged, function(req, res) {
  Project.find({}, function(err, projects) {
    if (err) {
      console.log("Landing page error");
    } else {
      res.render("index", { projects: projects, name: req.user.name }); //get variable to output in blog.ejs page
    }
  });
});
// Landing page
router.get("/", auth.userIsLogged, function(req, res) {
  Project.find({}, function(err, projects) {
    if (err) {
      console.log("Landing page error");
    } else {
      // get all tasks as object
      Task.find({}, (err, tasks) => {
        if (err) {
          console.log("Error getting tasks");
        }
        res.render("index", {
          projectsAndTasks,
          projects,
          tasks,
          name: req.user.name
        });
      });
    }
  });
});

//New Show Post Form
router.get("/new", auth.userIsLogged, function(req, res) {
  res.render("projects/new", { user: req.user });
});

//NEW Project Create
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
  Project.create(newProject, function(err, newlyCreated) {
    if (err) {
      console.log("Trouble creating project error");
    } else {
      let newUpdate = {
        name: author.name,
        projectName: title
      };
      User.findOneAndUpdate(
        { _id: req.params.user_id },
        { $push: { updates: newUpdate } },
        { upsert: true },
        function(err, updated) {
          if (err) {
            console.log("-------------");
            console.log(err);
          } else {
            req.flash(
              "success_msg",
              "Your new project has been created, check it out!"
            );
            res.redirect("/"); //redirect back to campgrounds page
          }
        }
      );
    }
  });
});

//SHOW project page
router.get("/p/:id", auth.userIsLogged, function(req, res) {
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
router.get("/p/:id/edit", auth.checkIfOwner, function(req, res) {
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
router.put("/p/:proj_id", function(req, res) {
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
router.delete("/p/:id", auth.userIsLogged, auth.checkIfOwner, function(
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
router.get("/p/:task_id/new", auth.userIsLogged, function(req, res) {
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
router.post("/p/:proj_id", auth.userIsLogged, function(req, res) {
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
router.get("/p/:proj_id/:task_id/edit", function(req, res) {
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
router.delete("/p/:proj_id/:task_id", function(req, res, next) {
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

//     -HELPFUL NOTES
// //SHOW Blog Post
// router.get("/:id", auth.userIsLogged, function(req, res) {
//   //find the blog with ID
//   Project.findById(req.params.id, function(err, foundProject) {
//     if (err) {
//       console.log(err);
//     } else {
//       //render show template for that blog
//       res.render("projects/show", { project: foundProject });
//     }
//   });
// });

// //EDIT your BLOG Post
// router.get("/:id/edit", auth.userIsLogged, auth.checkIfOwner, function(
//   req,
//   res
// ) {
//   Blog.findById(req.params.id, function(err, foundBlog) {
//     //render edit template for that blog
//     res.render("blogs/edit", { blog: foundBlog });
//   });
// });

// // UPDATE the Blog Post
// router.put("/:id", auth.userIsLogged, auth.checkIfOwner, function(req, res) {
//   Blog.findOneAndUpdate(req.params.id, req.body.blog, function(
//     err,
//     updatedBlog
//   ) {
//     if (err) {
//       res.redirect("/");
//     } else {
//       res.redirect("/" + req.params.id);
//     }
//   });
// });

// //DESTROY Blog Post
// router.delete("/:id", auth.userIsLogged, auth.checkIfOwner, function(req, res) {
//   Blog.findOneAndDelete(req.params.id, function(err) {
//     if (err) {
//       res.redirect("/");
//     } else {
//       res.redirect("/");
//     }
//   });
// });

//Image Upload Backup for BLOG POST

// //Header Image Upload Setup W/ CLOUDINARY
// cloudinary.config({
//     cloud_name: "denilsonjvv",
//     api_key: "953329937682181",
//     api_secret: "rGY1FMRd4b_qoHPQ_0OCjZcHSm4"
// });
// const storage = cloudinaryStorage({
//     cloudinary: cloudinary,
//     folder: "blogHeader",
//     allowedFormats: ["jpg", "png"],
//     transformation: [{ width: 1000, height: 1000, crop: "limit" }]
// });
// const parser = multer({ storage: storage });

//Create Blog Post WITH IMAGE TESTING STAGE / CLOUDINARY:
// router.post("/", userIsLogged, parser.single("fileURL"), function (req, res) {
//     var title = req.body.title;
//     var fileURL = req.file.url;
//     var description = req.body.description;
//     var author = {
//         id: req.user._id,
//         name: req.user.name
//     };
//     var newBlog = { title: title, fileURL: fileURL, description: description, author: author };
//     //Create a new blog and save to database
//     Blog.create(newBlog, function (err, newlyCreated) {
//         if (err) {
//             console.log(err);
//         } else {
//             res.redirect("/"); // index.ejs
//             console.log(newlyCreated);
//         }
//     });
// });
