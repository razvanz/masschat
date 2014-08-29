'use strict';

var _ = require('lodash'),
	passport = require('passport'),
	log = require('../models/log');


exports.renderLogin = function(req, res, next){
	res.render('login');
};

exports.login = function (req, res, next) {
	passport.authenticate('local', function (err, user, info) {
		if (err || !user) {
			res.render('login', {loginErrors: [info.message]});
		} else {
			req.login(user, function(err) {
			  if (err) {
					res.render('login', {loginErrors: [err.message]});
					return next(err);
				}
				return res.redirect('/');
			});
		}
	})(req, res, next);
};

exports.logout = function (req, res) {
	log.createLog({
		eventId: 2,
		eventType: 'logout',
		userId: req.user._id,
		eventText: 'User logged out succesfully',
		eventTime: new Date()
	});
	req.logout();
	res.redirect('/');
};

exports.getLogs = function (req, res) {
	var logs = log.getAllLogs();
	res.jsonp(200, logs);
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

exports.renderRegister = function(req, res){
	res.render('register');
};

exports.renderRecover = function(req, res){
	res.render('register');
};

exports.register = function(req, res){
	res.render('login');
};

exports.recover = function(req, res){
	res.render('login');
};
