'use strict';

var _ = require('lodash'),
  mongoose = require('mongoose'),
  validators = require('../utils/validators'),
  Schema = mongoose.Schema;

var appSchemaOpts = {
  collection: 'Applications', // the collection in witch it will be saved
  safe: true, // mongodb will return errors in the callback
  strict: false, // so we can extend entities later on
  versionKey: '_ver' // the document revision prop name
};

var AppSchema = new Schema({
  name: {
    type: String,
    trim: true,
    required: 'Applications must have a name!'
  },
  description: {
    type: String,
    default: 'none',
    trim: true
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: 'Applications must have a owner!'
  },
  // the key can just be the _id
  key: {
    type: String
  },
  created: {
    type: Date,
    default: function () {
      return new Date()
        .getTime();
    }
  },
  updated: {
    type: Date
  }
}, appSchemaOpts);

var App = mongoose.models['Application'] || mongoose.model('Application',
  AppSchema);

exports.schema = AppSchema;
exports.model = App;

// the methods

exports.all = function (query, callback) {
  if (query._id) {
    query._id = mongoose.Types.ObjectId(query._id);
  }
  return App.find(query)
    .exec(callback);
};

exports.allWithOpts = function (query, select, options, callback) {
  if (query._id) {
    query._id = mongoose.Types.ObjectId(query._id);
  }
  return App.find(query, select, options)
    .exec(callback);
};

exports.one = function (query, callback) {
  if (query._id) {
    query._id = mongoose.Types.ObjectId(query._id);
  }
  return App.findOne(query)
    .exec(callback);
};

exports.oneWithOpts = function (query, select, options, callback) {
  if (query._id) {
    query._id = mongoose.Types.ObjectId(query._id);
  }
  return App.findOne(query, select, options)
    .exec(callback);
};

exports.insert = function (app, callback) {
  var newApp = new App(app);
  return newApp.save(callback);
};

// needs to be updated
exports.update = function (query, extend, callback) {
  if (query._id) {
    query._id = mongoose.Types.ObjectId(query._id);
  }
  App.findOne(query, function (err, app) {
    if (err)
      return callback(err);
    else if (!app) {
      return callback(
        new Error('The entry to update is nonexistent!'));
    }
    app = _.extend(app, extend);
    app.updated = new Date()
      .getTime();
    app._ver = app._ver + 1;
    return app.save(callback);
  });
};

exports.remove = function (query, callback) {
  if (query._id) {
    query._id = mongoose.Types.ObjectId(query._id);
  }
  App.findOne(query, function (err, app) {
    if (err)
      return callback(err);
    else if (!app) {
      return callback(
        new Error('The entry to delete is nonexistent!'));
    }
    return app.remove(callback);
  });
};
