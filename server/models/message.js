'use strict';

var _ = require('lodash'),
  mongoose = require('mongoose'),
  validators = require('../utils/validators'),
  Schema = mongoose.Schema;

var MsgSchema = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: 'A message must have a author!'
  },
  timestamp: {
    type: Date,
    default: function () {
      return new Date()
        .getTime();
    }
  },
  text: {
    type: String,
    trim: true,
    required: 'A message must have content!'
  },
  seenBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
});

exports.schema = MsgSchema;
