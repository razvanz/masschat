'use strict';

var _ = require('lodash'),
  validators = require('../utils/validators'),
  mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var logSchemaOpts = {
  collection: 'Logs', // the collection in witch it will be saved
  safe: true, // mongodb will return errors in the callback
  strict: false, // so we can extend entities later on
  versionKey: '_ver' // the document revision prop name
};

var LogSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: 'Logs must be based on a user!'
  },
  logType: {
    type: [{
      type: String,
      enum: ['create', 'read', 'update', 'delete', 'uncategorized']
  }],
    default: ['uncategorized']
  },
  logDesc: {
    type: String,
    trim: true
  },
  logData: {
    type: Schema.Types.Mixed
  },
  timestamp: {
    type: Date,
    default: function () {
      return new Date()
        .getTime();
    }
  }
}, logSchemaOpts);

var Log = mongoose.models['Log'] || mongoose.model('Log', LogSchema);

exports.schema = LogSchema;
exports.model = Log;

// the methods

exports.all = function (callback) {
  return Log.find()
    .exec(callback);
};

exports.allWithOpts = function (query, select, options, callback) {
  if (query._id) {
    query._id = mongoose.Types.ObjectId(query._id);
  }
  return Log.find(query, select, options)
    .exec(callback);
};

exports.one = function (query, callback) {
  if (query._id) {
    query._id = mongoose.Types.ObjectId(query._id);
  }
  return Log.findOne(query)
    .exec(callback);
};

exports.oneWithOpts = function (query, select, options, callback) {
  if (query._id) {
    query._id = mongoose.Types.ObjectId(query._id);
  }
  return Log.findOne(query, select, options)
    .exec(callback);
};

exports.insert = function (log, callback) {
  var newLog = new Log(log);
  return newLog.save(callback);
};

// needs to be updated
exports.update = function (query, extend, callback) {
  // having the id is not mandatory but we might want it to ensure integrity.
  if (query._id) {
    query._id = mongoose.Types.ObjectId(query._id);
  }
  Log.findOne(query, function (err, log) {
    if (err)
      return callback(err);
    else if (!log) {
      return callback(
        new Error('The entry to update is nonexistent!'));
    }
    log = _.extend(log, extend);
    log.updated = new Date()
      .getTime();
    log._ver = log._ver + 1;
    return log.save(callback);
  });
};

exports.remove = function (query, callback) {
  if (!query._id) {
    query._id = mongoose.Types.ObjectId(query._id);
  }
  Log.findOne(query, function (err, log) {
    if (err)
      return callback(err);
    else if (!log) {
      return callback(
        new Error('The entry to delete is nonexistent!'));
    }
    return log.remove(callback);
  });
};
