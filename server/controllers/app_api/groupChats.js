'use strict';

var _ = require('lodash'),
	passport = require('passport'),
	SysLog = require('../../models/sysLog'),
	GroupChat = require('../../models/groupChat');

exports.list = function (req, res) {
	return GroupChat.all(function (err, chats) {
		if (err) return res.send(500, new Error('Unable to retrieve group chats.'));
		return res.jsonp(chats.toObject());
	});
};

exports.chatById = function (req, res) {
	return GroupChat.one({
		_id: req.param("id")
	}, function (err, chat) {
		if (err) return res.send(500, new Error('Unable to retrieve chat.'));
		return res.jsonp(chat.toObject());
	});
};

exports.createGroupChat = function (req, res) {
	return GroupChat.insert(req.body, function (err, chat) {
		if (err) {
			return res.send(500, new Error('Unable to create chat.'));
		}
		return res.jsonp(chat.toObject());
	});
};

exports.updateGroupChat = function (req, res) {
	return GroupChat.update({
		_id: req.param("id")
	}, req.body, function (err, chat) {
		if (err || !chat) return res.send(500, new Error('Unable to update chat.'));
		return res.jsonp(chat.toObject());
	});
};

exports.deleteGroupChat = function (req, res) {
	return GroupChat.remove({
		_id: req.param("id")
	}, function (err, chat) {
		if (err || !chat) return res.send(500, new Error('Unable to remove chat.'));
		return res.jsonp(chat.toObject());
	});
};


// Complex functionality

exports.groupList = function (req, res) {
	GroupChat.allWithOpts({
		users: {
			'$in': [req.user._id]
		}
	}, 'users chatname owner', {
		populate: 'users owner'
	}, function (err, chats) {
    if (err || !chats) return res.send(500, new Error('Unable to retrieve group chats.'));
    console.log(chats);
    return res.jsonp(chats);
	});
};
