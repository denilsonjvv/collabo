var mongoose = require("mongoose");

//SCHEMA SETUP
var updatesSchema = new mongoose.Schema({
  name: String,
  projectName: String,
  projectId: String,
  taskName: String,
  taskId: String,
  isRead: {
    type: Boolean,
    default: false
  },
  lastUpdated: {
    type: Date,
    format: "%Y-%m-%d%",
    default: new Date()
  }
});

module.exports = mongoose.model("Updates", updatesSchema); // Needed evertime we require mongoose
