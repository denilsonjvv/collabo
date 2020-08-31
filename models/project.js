var mongoose = require("mongoose");
var Task = require("./task"),
  Updates = require("./updates");

//SCHEMA SETUP
var projectSchema = new mongoose.Schema({
  title: String,
  description: String,
  members: [
    {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      name: String,
      profileImg: String
    }
  ],
  tasks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task" //Data from User model schema
    }
  ],
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User" //Data from User model schema
    },
    name: String,
    profileImg: String
  },
  date: {
    type: Date,
    default: Date.now,
    format: "%Y-%m-%d%"
  },
  //Updates
  updates: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Updates"
    }
  ]
});
projectSchema.pre("remove", async function(next) {
  try {
    await Task.deleteMany({
      _id: {
        $in: this.tasks
      }
    });
    await Updates.deleteMany({
      _id: {
        $in: this.updates
      }
    });
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("Project", projectSchema); // Needed evertime we require mongoose
