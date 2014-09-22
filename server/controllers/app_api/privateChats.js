'use strict';

var PrivateChat = require('../../models/privateChat');

exports.list = function (req, res) {
  return PrivateChat.all(function (err, chats) {
    if (err) return res.send(500,
      new Error('Unable to retrieve private chats.'));
    return res.jsonp(chats);
  });
};

exports.chatById = function (req, res) {
  return PrivateChat.one({
    _id: req.param('id')
  }, function (err, chat) {
    if (err) return res.send(500,
      new Error('Unable to retrieve chat.'));
    return res.jsonp(chat.toObject());
  });
};

exports.createChat = function (req, res) {
  return PrivateChat.insert(req.body, function (err, chat) {
    if (err) {
      return res.send(500,
        new Error('Unable to create chat.'));
    }
    return res.jsonp(chat.toObject());
  });
};

exports.updateChat = function (req, res) {
  return PrivateChat.update({
    _id: req.param('id')
  }, req.body, function (err, chat) {
    if (err || !chat) return res.send(500,
      new Error('Unable to update chat.'));
    return res.jsonp(chat.toObject());
  });
};

exports.deleteChat = function (req, res) {
  return PrivateChat.remove({
    _id: req.param('id')
  }, function (err, chat) {
    if (err || !chat) return res.send(500,
      new Error('Unable to remove chat.'));
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
    if (err || !chats) return res.send(500,
      new Error('Unable to retrieve contacts.'));
    console.log(chats);
    return res.jsonp(chats);
  });
};
