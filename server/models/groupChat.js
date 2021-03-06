'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  Message = require('./message')
  .schema;

var groupChatSchemaOpts = {
  collection: 'GroupChats', // the collection in witch it will be saved
  safe: true, // mongodb will return errors in the callback
  strict: false, // so we can extend entities later on
  versionKey: '_ver' // the document revision prop name
};

var GroupChatSchema = new Schema({
  users: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: 'Chats must have participants!'
    }
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: 'Chats must have owner!'
  },
  chatname: {
    type: 'String',
    default: 'Group chat',
    trim: true
  },
  messages: [Message],
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
}, groupChatSchemaOpts);

var GroupChat = mongoose.models['GroupChat'] || mongoose.model('GroupChat',
  GroupChatSchema);

exports.schema = GroupChatSchema;
exports.model = GroupChat;

// the methods

exports.all = function (callback) {
  return GroupChat.find()
    .exec(callback);
};

exports.allWithOpts = function (query, select, options, callback) {
  if (query._id) {
    query._id = mongoose.Types.ObjectId(query._id);
  }
  return GroupChat.find(query, select, options)
    .exec(callback);
};

exports.one = function (query, callback) {
  if (query._id) {
    query._id = mongoose.Types.ObjectId(query._id);
  }
  return GroupChat.findOne(query)
    .exec(callback);
};

exports.oneWithOpts = function (query, select, options, callback) {
  if (query._id) {
    query._id = mongoose.Types.ObjectId(query._id);
  }
  return GroupChat.findOne(query, select, options)
    .exec(callback);
};

exports.insert = function (groupChat, callback) {
  if (typeof groupChat.users === typeof []) {
    if (groupChat.users.indexOf(groupChat.owner) < 0) {
      groupChat.users.push(groupChat.owner);
    }
  } else {
    groupChat.users = [groupChat.owner];
  }
  // console.log(groupChat);
  var newGroupChat = new GroupChat(groupChat);
  return newGroupChat.save(callback);
};

// needs to be updated
exports.update = function (query, extend, callback) {
  // having the id is not mandatory but we might want it to ensure integrity.
  if (query._id) {
    query._id = mongoose.Types.ObjectId(query._id);
  }
  extend.updated = new Date()
    .getTime();
  return GroupChat.findOneAndUpdate(query, extend, callback);
};

exports.remove = function (query, callback) {
  if (query._id) {
    query._id = mongoose.Types.ObjectId(query._id);
  }
  GroupChat.findOne(query, function (err, chat) {
    if (err)
      return callback(err);
    else if (!chat) {
      return callback(
        new Error('The entry to delete is nonexistent!'));
    }
    return chat.remove(callback);
  });
};

exports.removeAll = function (callback) {
  return mongoose.connection.db.dropCollection('GroupChats', callback);
};

exports.addMessage = function (query, message, callback) {
  if (query._id) {
    query._id = mongoose.Types.ObjectId(query._id);
  }
  return GroupChat.findOne(query, function (err, chat) {
    if (err) {
      return callback(err);
    } else if (!chat) {
      return callback(new Error('Unable to find chat.'));
    } else {
      chat.messages.push(message);
      return chat.save(callback);
    }
  });
};

exports.getLastNMsgs = function (query, msgsNo, callback) {
  if (query._id) {
    query._id = mongoose.Types.ObjectId(query._id);
  }
  return GroupChat.aggregate([{
      $unwind: '$messages'
  }, {
      $sort: {
        'messages.timestamp': -1
      }
  }, {
      $limit: msgsNo
  }, {
      $project: {
        'chat_id': '$_id',
        _id: '$messages._id',
        author: '$messages.author',
        text: '$messages.text',
        timestamp: '$messages.timestamp',
        seenBy: '$messages.seenBy'
      }
  }])
    .exec(callback);
};

exports.unreadMsgNo = function (userId, callback) {
  return GroupChat.aggregate([
      {
        $unwind: '$messages'
    },
      {
        $match: {
          'messages.seenBy': {
            '$ne': userId
          }
        }
    },
      {
        $group: {
          _id: '$_id',
          count: {
            '$sum': 1
          }
        }
    },
      {
        $project: {
          msgNo: '$count'
        }
  }])
    .exec(function(err, result){
      if(err) return callback(err);
      var obj = {};
      for(var i=result.length-1; i>=0;i--){
        obj[result[i]._id] = result[i].msgNo;
      }
      return callback(err, obj);
    });
};

exports.getLastNMsgsAfterTmstp = function (query, msgsNo, tmspt, callback) {
  return GroupChat.aggregate([{
      $unwind: '$messages'
  }, {
      $sort: {
        'messages.timestamp': -1
      }
  }, {
      $match: {
        'messages.timestamp': {
          $lt: new Date(tmspt)
        }
      }
  }, {
      $limit: msgsNo
  }, {
      $project: {
        'chat_id': '$_id',
        _id: '$messages._id',
        author: '$messages.author',
        text: '$messages.text',
        timestamp: '$messages.timestamp',
        seenBy: '$messages.seenBy'
      }
  }])
    .exec(callback);
};

exports.markMsgSeen = function (chatId, tmstp, userId, callback) {
  // due to missing feature on mongodb we cannot update multiple subdocuments
  // feture request: https://jira.mongodb.org/browse/SERVER-1243

  // return GroupChat.update({
  //  '_id': chatId,
  // 	'messages.timestamp': {
  // 		$lt: tmstp
  // 	}
  // }, {
  // 	'$push': {
  // 		'messages.$.seenBy': userId
  // 	}
  // }, {
  // 	multi: true
  // }, callback);

  // for a workaround we will implement it manualy
  return GroupChat.findOne({
    _id: chatId
  }, 'messages', {
    $sort: {
      'messages.timestamp': 1
    }
  }, function (err, chat) {
    if (err) return callback(err);
    var updated = 0;
    for (var i = 0, j = chat.messages.length; i < j &&
      chat.messages[i].timestamp.getTime() < tmstp; i++) {
      if (typeof chat.messages[i].seenBy !== typeof []) {
        chat.messages[i].seenBy = [];
      }
      if (chat.messages[i].seenBy.indexOf(userId) < 0) {
        chat.messages[i].seenBy.push(userId);
        updated++;
      }
    }
    chat.save(function (err) {
      return callback(err, updated);
    });
  });
};
