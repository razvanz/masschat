'use strict';

var passport = require('passport'),
  path = require('path'),
  config = require('../config/config'),
  User = require('../models/user');

module.exports = function () {

  // Serialize sessions
  passport.serializeUser(function (user, done) {
    done(null, user._id);
  });

  // Deserialize sessions
  passport.deserializeUser(function (userId, done) {
    var user = User.one({
      _id: userId
    }, function (err, user) {
      if (err) {
        // log error
        return;
      } else if (!user) {
        //something is very wrong
        return;
      }
      return done(null, user);
    });
  });

  // Initialize strategies
  config.getGlobbedFiles('./server/auth/strategies/**/*.js')
    .forEach(function (strategy) {
      require(path.resolve(strategy))();
    });
};
