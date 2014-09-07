'use strict';

var events = require('events');
var util = require('util');
var bcrypt = require('bcrypt-nodejs');
var log = require('../models/log');
var User = require('../models/user');

var AuthResult = function(credentials) {
  var result = {credentials: credentials, message: null, success: false, user: null};
  return result;
};

var Authentication = function(db) {
  var self = this;
  var continueWith;
  events.EventEmitter.call(self);

  var validateCredentials = function(authResult) {
    if(authResult.credentials.username && authResult.credentials.password) {
      self.emit('credentials-ok', authResult);
    } else {
      if (!authResult.credentials.username){
        authResult.message = 'Missing username';
      }
      else{
        authResult.message = 'Missing password';
      }
      self.emit('invalid', authResult);
    }
  };

  var findUser = function(authResult) {
    var criteria = (authResult.credentials.username.indexOf('@') === -1) ? {username: authResult.credentials.username} : {email: authResult.credentials.username};
    User.oneWithOpts(criteria, null, null, function(err, user){
      if(err){
        console.log(err);
        // log error
        authResult.message = 'Unable to find user. Internal error.';
        return self.emit('invalid', authResult);
      } else if(!user){
        authResult.message = 'No user found with this username or email address.';
        return self.emit('invalid', authResult);
      }
      authResult.user = user;
      return self.emit('user-found', authResult);
    });
  };

  var comparePassword = function(authResult) {
    var matched = authResult.user.authenticate(authResult.credentials.password);
    if(matched) {
      self.emit('password-accepted', authResult);
    } else {
      authResult.message = 'Wrong password.';
      self.emit('invalid', authResult);
    }
  };

  var authOk = function(authResult) {
    authResult.succes = true;
    authResult.message = 'User logged in succesfully';
    log.createLog({eventId: 1, eventType: 'login', userId: authResult.user._id, eventText: authResult.message, eventTime: new Date()});
    self.emit('authenticated', authResult);
    self.emit('completed', authResult);
    if(continueWith) {
      continueWith(null, authResult);
    }
  };

  var authNotOk = function(authResult) {
    authResult.success = false;
    if(!authResult.user) {
      authResult.user = {_id: -1};
    }
    log.createLog({eventId: 1, eventType: 'login', userId: authResult.user._id, eventText: authResult.message, eventTime: new Date()});
    self.emit('not-authenticated', authResult);
    self.emit('completed', authResult);
    if(continueWith) {
      continueWith(null, authResult);
    }
  };

  self.on('login-received', validateCredentials);
  self.on('credentials-ok', findUser);
  self.on('user-found', comparePassword);
  self.on('password-accepted', authOk);

  self.on('invalid', authNotOk);

  self.authenticate = function(credentials, next) {
    var authResult = new AuthResult(credentials);
    continueWith = next;
    self.emit('login-received', authResult);
  };

  return self;
};

util.inherits(Authentication, events.EventEmitter);

module.exports = Authentication;
