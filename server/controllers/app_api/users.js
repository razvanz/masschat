'use strict';

var User = require('../../models/user');

exports.list = function (req, res) {
  return User.all(function (err, users) {
    if (err) return res.send(500, new Error('Unable to retrieve users.'));
    return res.jsonp(users.toObject());
  });
};

exports.userById = function (req, res) {
  return User.one({
    _id: req.param('id')
  }, function (err, user) {
    if (err) return res.send(500, new Error('Unable to retrieve user.'));
    return res.jsonp(user.toObject());
  });
};

exports.createUser = function (req, res) {
  User.insert(req.body, function (err, user) {
    if (err) {
      return res.send(500, new Error('Unable to create user.'));
    }
    return res.jsonp(user.toObject());
  });
};

exports.updateUser = function (req, res) {
  return User.update({
    _id: req.param('id')
  }, req.body, function (err, user) {
    if (err || !user) return res.send(500, new Error(
      'Unable to update user.'));
    return res.jsonp(user.toObject());
  });
};

exports.deleteUser = function (req, res) {
  return User.remove({
    _id: req.param('id')
  }, function (err, user) {
    if (err || !user) return res.send(500, new Error(
      'Unable to remove user.'));
    return res.jsonp(user.toObject());
  });
};

exports.lookupUser = function (req, res) {
  return User.allWithOpts({
    username: new RegExp(req.query.username, 'i'),
    _id: {
      $ne: req.user._id
    }
  }, '_id username email displayName', function (err, users) {
    if (err || !users) return res.send(500,
      new Error('Unable to retrieve users.'));
    return res.jsonp(users);
  });
};
