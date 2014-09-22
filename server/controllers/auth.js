'use strict';

var _ = require('lodash'),
  passport = require('passport'),
  SysLog = require('../models/sysLog'),
  Log = require('../models/log');

exports.login = function (req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    if (err || !user) {
      res.render('login', {
        loginErrors: [info.message]
      });
    } else {
      req.login(user, function (err) {
        if (err) {
          res.render('login', {
            loginErrors: [err.message]
          });
          return next(err);
        }
        return res.redirect('/');
      });
    }
  })(req, res, next);
};

exports.logout = function (req, res) {
  SysLog.insert({
    user: req.user._id,
    sysLogType: 'logout',
    sysLogDesc: 'Successfull logout',
    sysLogData: null
  });
  req.logout();
  res.redirect('/');
};

exports.getLogs = function (req, res) {
  SysLog.allWithOpts({
    user: req.user._id
  }, function (err, sysLogs) {
    if (!err)
      return Log.allWithOpts({
        user: req.user._id
      }, function (err, userLogs) {
        if (!err)
          return res.jsonp(sysLogs.concat(userLogs));
      })
    else
      return res.send(500);
  });
};

exports.requiresLogin = function (req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }
  next();
};

exports.me = function (req, res) {
  res.jsonp(req.user || null);
};

exports.renderLogin = function (req, res, next) {
  res.render('login');
};

exports.renderRegister = function (req, res) {
  res.render('register');
};

exports.renderRecover = function (req, res) {
  res.render('recover');
};

exports.register = function (req, res) {
  res.render('login');
};

exports.recover = function (req, res) {
  res.render('login');
};
