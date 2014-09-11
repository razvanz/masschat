'use strict';

var _ = require('lodash'),
	passport = require('passport'),
	SysLog = require('../../models/sysLog'),
	User = require('../../models/user');

exports.list = function (req, res) {
	var users = User.getAllUsers();
	res.jsonp(200, users);
};

exports.userById = function (req, res) {

};

exports.createUser = function (req, res) {
	User.insert(req.body, function(err, user){
		if(err){
			return res.send(500);
		}

		return res.send(200);
	});
};

exports.updateUser = function (req, res) {

};

exports.deleteUser = function (req, res) {

};

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
				return res.send(403, {
					message: 'User is not authorized'
				});
			}
		});
	};
};
