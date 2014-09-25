'use strict';

var _ = require('lodash'),
  async = require('async'),
  PrivateChat = require('../../models/privateChat');

module.exports = function (socket, io) {
  socket.on('addContact', function (user, contact) {
    async.waterfall([
    // creating a chat
    function (done) {
        var newPrivateChat = {
          users: [user._id, contact._id],
          messages: []
        };
        return PrivateChat.insert(newPrivateChat, function (err, prChat) {
          if (err) {
            done(err);
          } else {
            done(err, prChat);
          }
        });
    },
      function (prChat, done) {
        return PrivateChat.oneWithOpts({
          _id: prChat._id
        }, '_id users', {
          populate: 'users'
        }, function (err, populatedChat) {
          if (err) {
            done(err);
          } else {
            done(err, populatedChat);
          }
        });
    }], function (err, prChat) {
      // manualy remove sensitive info
      prChat.users[0] = prChat.users[0].toObject();
      prChat.users[1] = prChat.users[1].toObject();
      prChat = prChat.toObject();
      // which of the 2 is the contact
      var contactIdx = prChat.users[0]._id.toString() === user._id ? 1 : 0,
        userIdx = prChat.users[0]._id.toString() === user._id ? 0 : 1;

      // prepare a chat for the other user
      var contactChat = _.cloneDeep(prChat);
      contactChat.contact = prChat.users[userIdx];
      contactChat.contact.status = 'online';
      contactChat.unreadNo = 0;

      // prepare a chat for this other user
      prChat.contact = prChat.users[contactIdx];
      prChat.unreadNo = 0;

      // if the user is online we add him as well;
      if (!!io.users[prChat.users[contactIdx]._id.toString()]) {
        prChat.contact.status = 'online';
      } else {
        prChat.contact.status = 'offline';
      }

      // joining the chat
      socket.join(prChat._id.toString(), function () {

        socket.emit('newContact', prChat);

        // something wrong with this shit
        if (!!io.users[prChat.users[contactIdx]._id.toString()]) {
          // send him the new chat
          io.sockets.connected[io.users[prChat.users[contactIdx]._id.toString()]
            .socketId].join(prChat._id.toString(), function () {
            // socket.broadcast.in(prChat._id.toString())
            //   .emit('newContact', contactChat);
            io.users[prChat.users[contactIdx]._id.toString()]
              .socket.emit('addedAsContact', contactChat);
          });
        }
      });
    });
  });
};
