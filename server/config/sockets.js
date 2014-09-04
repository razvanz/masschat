'use strict';

var config = require('.config'),
	path = require('path'),
	http = require('http'),
	socket_io = require('socket.io');

module.exports = function (app) {
	var io = socket_io(http.Server(app));

  config.getGlobbedFiles('./server/socket-rooms/*.js')
    .forEach(function (socketRoom) {
      require(path.resolve(socketRoom))(io);
    });

	return io;
};
