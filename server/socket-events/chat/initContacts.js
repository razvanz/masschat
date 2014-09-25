'use strict';

var async = require('async'),
  PrivateChat = require('../../models/privateChat');

module.exports = function (socket, io) {
  socket.on('initContacts', function (user) {
    async.waterfall([
    // getting user's private chats unread msg number
      function (done) {
        return PrivateChat.unreadMsgNo(user._id, function (err, unread) {
          done(err, unread);
        });
    },
    // getting user's private chats
    function (unread, done) {
        return PrivateChat.allWithOpts({
          users: user._id
        }, '_id users', {
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
          // fix populate issue
          chats[i].users[0] = chats[i].users[0].toObject();
          chats[i].users[1] = chats[i].users[1].toObject();

          // hide what is not needed
          chats[i] = chats[i].toObject();

          // which of the 2 is the contact
          var contactIdx = chats[i].users[0]._id.toString() ===
            user._id ? 1 : 0;

          // if the user is online we add him as well;
          if (io.users[chats[i].users[contactIdx]._id.toString()]) {
            // no need to join if is already id. Should be done automaticaly
            // io.users[chats[i].users[contactIdx]._id.toString()].socket.join(chats[i]._id);
            chats[i].users[contactIdx].status = 'online';
          } else {
            chats[i].users[contactIdx].status = 'offline';
          }

          // add the contact as a special key
          chats[i].contact = chats[i].users[contactIdx];

          // adding unread messages
          chats[i].unreadNo = unread[chats[i]._id.toString()];

          // adding the socket to the chat room and mark him online;
          socket.join(chats[i]._id.toString());

          // let the others know we are online
          socket.broadcast.to(chats[i]._id.toString())
            .emit('contactOnline', user);
        }
        done(null, chats);
    }], function (err, result) {
      if (err) return socket.emit('error', {
        message: 'Unable to load contacts!'
      });
      return socket.emit('contacts', result);
    });
  });
};
