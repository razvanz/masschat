'use strict';

var _ = require('lodash'),
	validators = require('../utils/validators'),
	mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	crypto = require('crypto');

var userSchemaOpts = {
	collection: 'Users', // the collection in witch it will be saved
	safe: true, // mongodb will return errors in the callback
	strict: false, // so we can extend entities later on
	versionKey: '_ver' // the document revision prop name
};

var UserSchema = new Schema({
	displayName: {
		type: String,
		trim: true
	},
	email: {
		type: String,
		trim: true,
		default: '',
		validate: [validators.validateLocalStrategyProperty, 'Please fill in your email'],
		match: [/.+\@.+\..+/, 'Please fill a valid email address']
	},
	username: {
		type: String,
		unique: true,
		required: 'Please fill in a username',
		trim: true
	},
	password: {
		type: String,
		default: '',
		validate: [validators.validateLocalStrategyPassword, 'Password should be longer']
	},
	salt: {
		type: String
	},
	provider: {
		type: String,
		required: 'Provider is required'
	},
	providerData: {},
	additionalProvidersData: {},
	created: {
		type: Date,
		default: function(){return new Date().getTime();}
	},
	updated: {
		type: Date
	},
	/* For reset password */
	resetPasswordToken: {
		type: String
	},
	resetPasswordExpires: {
		type: Date
	}
}, userSchemaOpts);

/**
 * Hook a pre save method to hash the password
 */
UserSchema.pre('save', function (next) {
	if (this.password && this.password.length > 4) {
		this.salt = new Buffer(crypto.randomBytes(16)
			.toString('base64'), 'base64');
		this.password = this.hashPassword(this.password);
	}
	next();
});

/**
 * Create instance method for hashing a password
 */
UserSchema.methods.hashPassword = function (password) {
	if (this.salt && password) {
		return crypto.pbkdf2Sync(password, this.salt, 10000, 64)
			.toString('base64');
	} else {
		return password;
	}
};

/**
 * Create instance method for authenticating user
 */
UserSchema.methods.authenticate = function (password) {
	return this.password === this.hashPassword(password);
};

/**
 * Find possible not used username
 */
exports.findUniqueUsername = UserSchema.statics.findUniqueUsername = function (username, suffix, callback) {
	var possibleUsername = username + (suffix || '');

	User.findOne({
		username: possibleUsername
	}, function (err, user) {
		if (!err) {
			if (!user) {
				callback(possibleUsername);
			} else {
				return User.findUniqueUsername(username, (suffix || 0) + 1, callback);
			}
		} else {
			callback(null);
		}
	});
};

var User = mongoose.models['User'] || mongoose.model('User', UserSchema);

exports.schema = UserSchema;
exports.model = User;

// the methods

exports.all = function (callback) {
	return User.find()
		.exec(callback);
};

exports.allWithOpts = function (query, select, options, callback) {
	if (query._id) {
		query._id = mongoose.Types.ObjectId(query._id);
	}
	return User.find(query, select, options)
		.exec(callback);
};

exports.one = function (query, callback) {
	if (query._id) {
		query._id = mongoose.Types.ObjectId(query._id);
	}
	return User.findOne(query)
		.exec(callback);
};

exports.oneWithOpts = function (query, select, options, callback) {
	if (query._id) {
		query._id = mongoose.Types.ObjectId(query._id);
	}
	return User.findOne(query, select, options)
		.exec(callback);
};

exports.insert = function (user, callback) {
	var newUser = new User(user);
	return newUser.save(callback);
};

// needs to be updated
exports.update = function (query, extend, callback) {
	// having the id is not mandatory but we might want it to ensure integrity.
	if (query._id) {
		query._id = mongoose.Types.ObjectId(query._id);
	}
	extend.updated = new Date()
		.getTime();
	User.findOneAndUpdate(query, extend, callback);
};

exports.remove = function (query, callback) {
	if (query._id) {
		query._id = mongoose.Types.ObjectId(query._id);
	}
	User.findOne(query, function (err, user) {
		if (err)
			return callback(err);
		else if (!user) {
			return callback(
				new Error('The entry to delete is nonexistent!'));
		}
		return user.remove(callback);
	});
};

exports.removeAll = function (callback) {
	return mongoose.connection.db.dropCollection('Users', callback);
};
