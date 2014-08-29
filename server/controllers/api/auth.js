'use strict';

var _ = require('lodash'),
	passport = require('passport'),
	log = require('../../models/log'),
	App = require('../../models/application');

exports.requiresAuthentication = function (req, res, next) {
  function validateApp (err, app) {
    if (err) {
      return res.send(500, {
        message: 'Unable to validate key!'
      });
    }
    else if(!app){
      return res.send(403, {
        message: 'Not authorized.'
      });
    }
    req.application = app;
    req.user = app.owner;
    return next();
  }

	if (!req.query.key) {
		return res.send(403, {
			message: 'Not authorized.'
		});
	}

	App.one({_id: req.query.key}, validateApp);
};
