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
