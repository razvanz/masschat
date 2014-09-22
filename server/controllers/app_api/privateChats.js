'use strict';

var _ = require('lodash'),
  passport = require('passport'),
  SysLog = require('../../models/sysLog'),
  PrivateChat = require('../../models/privateChat');

exports.list = function (req, res) {
  return PrivateChat.all(function (err, chats) {
    if (err) return res.send(500, new Error(
      'Unable to retrieve private chats.'));
    return res.jsonp(chats.toObject());
  });
};

exports.chatById = function (req, res) {
  return PrivateChat.one({
    _id: req.param("id")
  }, function (err, chat) {
    if (err) return res.send(500, new Error('Unable to retrieve chat.'));
    return res.jsonp(chat.toObject());
  });
};

exports.createPrivateChat = function (req, res) {
  return PrivateChat.insert(req.body, function (err, chat) {
    if (err) {
      return res.send(500, new Error('Unable to create chat.'));
    }
    return res.jsonp(chat.toObject());
  });
};

exports.updatePrivateChat = function (req, res) {
  return PrivateChat.update({
    _id: req.param("id")
  }, req.body, function (err, chat) {
    if (err || !chat) return res.send(500, new Error(
      'Unable to update chat.'));
    return res.jsonp(chat.toObject());
  });
};

exports.deletePrivateChat = function (req, res) {
  return PrivateChat.remove({
    _id: req.param("id")
  }, function (err, chat) {
    if (err || !chat) return res.send(500, new Error(
      'Unable to remove chat.'));
    return res.jsonp(chat.toObject());
  });
};

// Complex functionality

exports.contactList = function (req, res) {
  PrivateChat.allWithOpts({
    users: {
      '$in': [req.user._id]
    }
  }, 'users', {
    populate: 'users'
  }, function (err, chats) {
    if (err || !chats) return res.send(500, new Error(
      'Unable to retrieve contacts.'));
    console.log(chats);
    return res.jsonp(chats);
  });
};
