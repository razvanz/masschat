'use strict';

var auth = require('./auth');

exports.index = function (req, res) {
  if (req.isAuthenticated()) {
    return res.render('app');
  } else {
    return res.redirect('/login');
  }
};

exports.initSession = function (req, res) {
  var initVars = {
    user: req.user.toObject(),
    userRoles: ['user', 'admin', 'guest', '*']
  };

  return res.jsonp(initVars);
};
