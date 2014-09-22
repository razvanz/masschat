'use strict';

var config = require('../config/config'),
  path = require('path');

module.exports = function (io) {
  var chat = io.of('/chat');

  chat.on('connection', function (socket) {
    socket.emit('welcome', {
      message: 'Welcome to the chat!'
    });

    config.getGlobbedFiles('./server/socket-events/chat/*.js')
      .forEach(function (socketEvent) {
        require(path.resolve(socketEvent))(socket);
      });
  });
};
