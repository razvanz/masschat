'use strict';

var Log = function(args) {
  this.eventId = args.eventId;
  this.eventType = args.eventType;
  this.userId = args.userId;
  this.eventText = args.eventText;
  this.eventTime = args.eventTime;
};

var logs = [];

exports.createLog = function(args) {
  var log = new Log(args);
  logs.push(log);
};

exports.getAllLogs = function() {
  return logs;
};
