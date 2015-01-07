'use strict';

var passport = require('passport'),
  User = require('../models/user');

exports.renderLogin = function(req, res, next) {
  res.render('login', {
    csrfToken: req.csrfToken()
  });
};

exports.renderRegister = function(req, res) {
  res.render('register', {
    csrfToken: req.csrfToken()
  });
};

exports.renderRecover = function(req, res) {
  res.render('recover', {
    csrfToken: req.csrfToken()
  });
};

exports.login = function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err || !user) {
      res.render('login', {
        csrfToken: req.csrfToken(),
        loginErrors: [info.message]
      });
    } else {
      req.login(user, function(err) {
        if (err) {
          res.render('login', {
            csrfToken: req.csrfToken(),
            loginErrors: [err.message]
          });
          return next(err);
        }

        req.brute.reset(function() {
          return res.redirect('/'); // logged in, send them to the home page
        });
      });
    }
  })(req, res, next);
};

exports.requiresLogin = function(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }
  next();
};

exports.logout = function(req, res) {
  req.logout();
  return res.redirect('/');
};

exports.me = function(req, res) {
  res.jsonp(req.user || null);
};

exports.register = function(req, res) {
  var newUser = req.body;
  newUser.provider = 'local';
  newUser.displayName = newUser.username;

  User.insert(newUser, function(err, user) {
    if (err) {
      
      var errorMsgs = [];
      for (var param in err.errors)
        errorMsgs.push(err.errors[param].message);

      return res.render('register', {
        csrfToken: req.csrfToken(),
        registerErrors: errorMsgs
      });
    } else if (!user) {
      return res.render('register', {
        csrfToken: req.csrfToken(),
        registerErrors: [
          new Error('Something went wrong! Please try again later!')
        ]
      });
    } else {
      req.login(user, function(err) {
        if (err) {
          return res.render('login', {
            csrfToken: req.csrfToken(),
            loginErrors: [err.message]
          });
        }
        return res.redirect('/');
      });
    }
  });
};

exports.recover = function(req, res) {
  res.redirect('/login');
};
