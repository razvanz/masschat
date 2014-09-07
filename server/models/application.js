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
	siloAcess: [{
		type: Schema.Types.ObjectId,
		ref: 'Silo'
  }],
	deleted: {
		type: Boolean,
		default: false
	},
	silo: {
		type: Schema.Types.ObjectId,
		ref: 'Silo'
	},
	created: {
		type: Date,
		default: function () {
			return new Date()
				.getTime();
		}
	},
	createdBy: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	modified: {
		type: Date,
		default: null
	},
	modifiedBy: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	}
}, appSchemaOpts);

var App = mongoose.model('Application', AppSchema);

exports.schema = AppSchema;
exports.model = App;

// the methods

exports.all = function (query, callback) {
	if (query._id) {
		query._id = mongoose.Types.ObjectId(query._id);
	}
	return App.find(query)
		.populate()
		.exec(callback);
};

exports.allWithOpts = function (query, select, options, callback) {
	if (query._id) {
		query._id = mongoose.Types.ObjectId(query._id);
	}
	return App.find(query, select, options)
		.populate()
		.exec(callback);
};

exports.one = function (query, callback) {
	if (!query._id)
		return callback(
			new Error('You must specify an ID for retrieving the entry!'));
	else {
		query._id = mongoose.Types.ObjectId(query._id);
	}
	return App.findOne(query)
		.populate()
		.exec(callback);
};

exports.oneWithOpts = function (query, select, options, callback) {
	if (!query._id)
		return callback(
			new Error('You must specify an ID for retrieving the entry!'));
	else {
		query._id = mongoose.Types.ObjectId(query._id);
	}
	return App.findOne(query, select, options)
		.populate()
		.exec(callback);
};

exports.insert = function (user, app, callback) {
	var newApp = new App(app);
	delete newApp._id; // just let it be generated by MongoDB
	newApp.createdBy = user._id;
	newApp.silo = user.silo._id;
	return newApp.save(callback);
};

// needs to be updated
exports.update = function (user, query, extend, callback) {
	if (!query._id)
		return callback(
			new Error('You must specify an entry to update!'));
	else {
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
		app.modified = new Date()
			.getTime();
		app.modifiedBy = user._id;
		silo._ver = silo._ver + 1;
		return app.save(callback);
	});
};

exports.remove = function (user, query, callback) {
	if (!query._id)
		return callback(
			new Error('You must specify an entry to update!'));
	else {
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