var mongoose = require("mongoose");
var Project = require("./project");

//SCHEMA SETUP
var taskSchema = new mongoose.Schema({
  task: String,
  assigned: Array,
  priority: String,
  dueDate: String,
  createdby: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User" //Data from User model schema
    },
    name: String,
    profileImg: String
  },
  lastUpdated: {
    type: Date,
    format: "%Y-%m-%d%",
    default: new Date()
  },
  date: {
    type: Date,
    format: "%Y-%m-%d%",
    default: Date.now
  }
});

module.exports = mongoose.model("Task", taskSchema); // Needed evertime we require mongoose
