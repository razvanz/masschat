'use strict';

module.exports = function (socket, io) {
  socket.on('dscnct', function () {
    var user = io.sockets.connected[socket.id].user;
    if(user){
      delete io.users[user._id];
    }
    for(var i=socket.rooms.length-1; i>-1; i--){
      socket.to(socket.rooms[i]).emit('contactOffline', user);
    }
  });
};
