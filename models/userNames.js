var mongoose = require("mongoose");

// USER SCHEMA SETUP
var UserNamesSchema = new mongoose.Schema({
  name: {
    type: String
  }
});

module.exports = mongoose.model("UserNames", UserNamesSchema); // Needed evertime we require mongoose
