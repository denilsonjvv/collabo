var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

// USER SCHEMA SETUP
var UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  profileImg: {
    type: String,
    default: "defaultProImage.png"
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  },
  //Updates
  updates: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Updates"
    }
  ]
});

UserSchema.plugin(passportLocalMongoose, {
  usernameField: "email" //takes Email as login username
});

module.exports = mongoose.model("User", UserSchema); // Needed evertime we require mongoose
