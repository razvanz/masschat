'use strict';

var config = require('../config/config'),
  path = require('path');

module.exports = function (io) {
  var updates = io.of('/updates');

  updates.on('connection', function (socket) {
    socket.emit('welcome', {
      message: 'Welcome sys updates!'
    });

    config.getGlobbedFiles('./server/socket-events/updates/*.js')
      .forEach(function (socketEvent) {
        require(path.resolve(socketEvent))(socket);
      });
  });
};
