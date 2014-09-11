'use strict';

var _ = require('lodash'),
  validators = require('../utils/validators'),
  mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var sysLogSchemaOpts = {
  collection: 'SysLogs', // the collection in witch it will be saved
  safe: true, // mongodb will return errors in the callback
  strict: false, // so we can extend entities later on
  versionKey: '_ver' // the document revision prop name
};

var SysLogSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  sysLogType: {
    type: [{
      type: String,
      enum: ['login', 'register', 'recover', 'error', 'user', 'uncategorized']
    }],
    default: ['uncategorized']
  },
  sysLogDesc: {
    type: String,
    trim: true
  },
  sysLogData: {
    type: Schema.Types.Mixed
  },
  timestamp: {
    type: Date,
    default: function(){return new Date().getTime();}
  }
}, sysLogSchemaOpts);

var SysLog = mongoose.models['SysLog'] || mongoose.model('SysLog', SysLogSchema);

exports.schema = SysLogSchema;
exports.model = SysLog;

// the methods

exports.all = function (callback) {
  return SysLog.find()
    .exec(callback);
};

exports.allWithOpts = function (query, select, options, callback) {
  if (query._id) {
    query._id = mongoose.Types.ObjectId(query._id);
  }
  return SysLog.find(query, select, options)
    .exec(callback);
};

exports.one = function (query, callback) {
  if (query._id) {
    query._id = mongoose.Types.ObjectId(query._id);
  }
  return SysLog.findOne(query)
    .exec(callback);
};

exports.oneWithOpts = function (query, select, options, callback) {
  if (query._id) {
    query._id = mongoose.Types.ObjectId(query._id);
  }
  return SysLog.findOne(query, select, options)
    .exec(callback);
};

exports.insert = function (sysLog, callback) {
  var newSysLog = new SysLog(sysLog);
  return newSysLog.save(callback);
};

// needs to be updated
exports.update = function (query, extend, callback) {
  // having the id is not mandatory but we might want it to ensure integrity.
  if (query._id) {
    query._id = mongoose.Types.ObjectId(query._id);
  }
  SysLog.findOne(query, function (err, sysLog) {
    if (err)
      return callback(err);
    else if (!sysLog) {
      return callback(
        new Error('The entry to update is nonexistent!'));
    }
    sysLog = _.extend(sysLog, extend);
    sysLog.updated = new Date()
      .getTime();
    sysLog._ver = sysLog._ver + 1;
    return sysLog.save(callback);
  });
};

exports.remove = function (query, callback) {
  if (!query._id) {
    query._id = mongoose.Types.ObjectId(query._id);
  }
  SysLog.findOne(query, function (err, sysLog) {
    if (err)
      return callback(err);
    else if (!sysLog) {
      return callback(
        new Error('The entry to delete is nonexistent!'));
    }
    return sysLog.remove(callback);
  });
};
