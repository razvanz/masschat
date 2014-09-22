'use strict';

var PrivateChat = require('../../models/privateChat'),
  GropChat = require('../../models/groupChat');

module.exports = function (socket) {
  socket.on('init', function (user) {
    socket.emit('welcome', {
      message: 'Welcome to the chat!'
    });
    user.status = 'online';
    return PrivateChat.allWithOpts({
      users: user._id
    }, '_id', function (err, prChats) {
      if (err) {
        return socket.emit('error', {
          message: 'Unable to load chat!'
        });
      }
      else {
        // joining a room for each chat
        for(var i = prChats.length-1; i>=0; i--){
          socket.join(prChats[i]._id);
          socket.to(prChats[i]._id).emit('joinedPrivateChat', user);
        }

        return GropChat.allWithOpts({
          users: user._id
        }, '_id owner chatname', function(err, grChats){
          if (err) {
            return socket.emit('error', {
              message: 'Unable to load chat!'
            });
          }
          else {
            // joining a room for each chat
            for(var j = grChats.length-1; j>=0; j--){
              socket.join(grChats[j]._id);
              socket.to(grChats[j]._id).emit('joinedGroupChat', user);
            }
          }
        });
      }
    });
  });
};
