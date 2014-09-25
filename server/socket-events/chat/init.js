'use strict';

module.exports = function (socket, io) {
  socket.on('init', function (user) {
    user.status = 'online';
    // init
    io.users = io.users || {};
    io.sockets.connected[socket.id].user = user;
    io.users[user._id] = {
      socketId: socket.id,
      socket: io.sockets.connected[socket.id]
    };
    return socket.emit('welcome', 'Welcome to the chat!');
  });
};
