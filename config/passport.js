var LocalStrategy = require("passport-local").Strategy;
var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");

//Load user Model to passport
var User = require("../models/user");

module.exports = function(passport) {
  passport.use(
    new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
      // Match User
      User.findOne({ email: email }, function(err, user) {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, { message: "Email or password incorrect" });
        }
        bcrypt.compare(password, user.password, function(err, isMatch) {
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, {
              message: "Email or password incorrect"
            });
          }
        });
        return done(null, user);
      });
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });
};
