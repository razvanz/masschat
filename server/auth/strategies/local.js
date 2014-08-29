'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
	LocalStrategy = require('passport-local')
	.Strategy,
	Authentication = require('../authentication');

module.exports = function () {
	passport.use(new LocalStrategy(function (username, password, done) {
		var authentication = new Authentication();
		authentication.authenticate({
			'username': username,
			'password': password
		}, function (err, authResult) {
			if (err) {
				return done(err);
			} else if (authResult.succes) {
				return done(null, authResult.user);
			} else {
				return done(null, false, {
					message: authResult.message
				});
			}
		});
	}));
};
