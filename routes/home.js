var express = require("express");
var router = express.Router({ mergeParams: true });

var Project = require("../models/project"),
  User = require("../models/user"),
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

//New Show Post Form
router.get("/new", auth.userIsLogged, function(req, res) {
  res.render("projects/new");
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
      res.redirect("/"); //redirect back to campgrounds page
    }
  });
});

//SHOW project page
router.get("/p/:id", auth.userIsLogged, function(req, res) {
  Project.findById(req.params.id)
    .populate("tasks")
    .exec(function(err, foundProject) {
      if (err) {
        console.log("Show project page error.");
      } else {
        res.render("projects/show", { project: foundProject });
      }
    });
});

// New task page
router.get("/p/:id/new", auth.userIsLogged, function(req, res) {
  Project.findById(req.params.id, function(err, foundProject) {
    if (err) {
      console.log("Take back with err msg");
    } else {
      User.find({}, function(err, foundUsers) {
        res.render("tasks/new", { project: foundProject, user: foundUsers });
      });
    }
  });
});

// Create new task
router.post("/p/:id", auth.userIsLogged, function(req, res) {
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
          foundProject.tasks.push(foundTask);
          foundProject.save();
          console.log(foundTask);
          res.redirect("/p/" + foundProject._id); //redirect back to campgrounds page
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
