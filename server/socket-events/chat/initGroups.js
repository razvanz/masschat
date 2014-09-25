'use strict';

var async = require('async'),
  GropChat = require('../../models/groupChat');

module.exports = function (socket, io) {
  socket.on('initGroups', function (user) {
    async.waterfall([
    // getting user's group chats unread msg number
      function (done) {
        return GropChat.unreadMsgNo(user._id, function (err, unread) {
          done(err, unread);
        });
    },
    // getting user's group chats
    function (unread, done) {
        return GropChat.allWithOpts({
          users: user._id
        }, '_id users owner chatname', {
          populate: 'users'
        }, function (err, chats) {
          if (err) {
            done(err);
          } else {
            done(err, unread, chats);
          }
        });
    },
    // application logic
      function (unread, chats, done) {
        for (var i = chats.length - 1; i > -1; i--) {
          // hide what is not needed
          chats[i] = chats[i].toObject();

          // adding unread messages
          chats[i].unreadNo = unread[chats[i]._id.toString()];

          for (var j = chats[i].users.length - 1; j > -1; j--) {
            // fix populate issue
            chats[i].users[j] = chats[i].users[j].toObject();

            if (io.users[chats[i].users[j]._id.toString()]) {
              chats[i].users[j].status = 'online';
            } else {
              chats[i].users[j].status = 'offline';
            }
          }
          // adding the socket to the chat room and mark him online;
          socket.join(chats[i]._id.toString());

          // let the others know we are online
          socket.broadcast.to(chats[i]._id.toString())
            .emit('contactOnline', user);
        }
        done(null, chats);
    }], function (err, result) {
      if (err) return socket.emit('error', {
        message: 'Unable to load groups!'
      });
      return socket.emit('groups', result);
    });
  });
};
