var mongoose = require("mongoose");

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
  date: {
    type: Date,
    default: Date.now,
    format: "%Y-%m-%d%"
  }
});

module.exports = mongoose.model("Task", taskSchema); // Needed evertime we require mongoose
