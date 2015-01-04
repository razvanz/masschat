'use strict';

require('connect-flash');
var ExpressBrute = require('express-brute'),
  moment = require('moment'),
  store = new ExpressBrute.MemoryStore();

var failCallback = function(req, res, next, nextValidRequestDate) {
  res.render('serverError', {
    title: 'Error',
    message: 'Too many failed attempts. Please try again ' +
      moment(nextValidRequestDate).fromNow()
  });
};
// Start slowing requests after 5 failed attempts to do something for the user
module.exports.userPrevent = new ExpressBrute(store, {
  freeRetries: 2,
  proxyDepth: 1,
  minWait: 5 * 60 * 1000, // 5 minutes
  maxWait: 60 * 60 * 1000, // 1 hour,
  failCallback: failCallback
});

// No more than 1000 login attempts per day per IP
module.exports.globalPrevent = new ExpressBrute(store, {
  freeRetries: 1000,
  proxyDepth: 1,
  attachResetToRequest: false,
  refreshTimeoutOnRequest: false,
  minWait: 25 * 60 * 60 * 1000, // 1 day 1 hour (should never reach this time)
  maxWait: 25 * 60 * 60 * 1000, // 1 day 1 hour (should never reach this time)
  lifetime: 24 * 60 * 60, // 1 day (seconds not milliseconds)
  failCallback: failCallback
});
