'use strict';

var User = require('../../models/user'),
    PrivateChat = require('../../models/privateChat');

module.exports = function (socket, io) {
  socket.on('addContact', function (contact, cb) {
    cb('asdasd');
    console.log(socket.request);
    // PrivateChat.insert({
    //   users: [socket.user._id, contact._id],
    //   messages: []
    // }, function(err, chat){
    //   if(err || !chat) return {message: 'Unable to add contact!'};
    //   else {
    //     socket.join(chat._id);
    //     for(var sck in io.sockets){
    //       console.log(sck.user);
    //     }
    //   }
    // });
  });
};
