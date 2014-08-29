'use strict';

var _ = require('lodash'),
	passport = require('passport'),
	log = require('../../models/log'),
	User = require('../../models/user');

exports.getUsers = function (req, res) {
	var users = User.getAllUsers();
	res.jsonp(200, users);
};

exports.createUser = function (req, res) {
	User.createUser(req.body);
	log.createLog({
		eventId: 2,
		eventType: 'createUser',
		userId: req.user.id,
		eventText: 'User ' + req.user.id + ' created user ' + req.body.id + ' succesfully',
		eventTime: new Date()
	});
};

exports.insertUser = function(req, res){
	User.insert();
}


/**
* User authorizations routing middleware
*/
exports.hasAuthorization = function (roles) {
	var _this = this;

	return function (req, res, next) {
		_this.requiresLogin(req, res, function () {
			if (_.intersection(req.user.roles, roles)
				.length) {
				return next();
			} else {
				log.createLog({
					eventId: 2,
					eventType: 'authorization',
					userId: req.user.id,
					eventText: 'User failed authorization on ' + req.url,
					eventTime: new Date()
				});
				return res.send(403, {
					message: 'User is not authorized'
				});
			}
		});
	};
};
