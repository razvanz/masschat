(function () {
  'use strict';

  var chatSocket = function (socketFactory, session) {
    var socket = socketFactory({
      // prefix: 'socket:',
      ioSocket: io.connect('/chat')
    });

    return {
      addListener: socket.addListener,
      disconnect: socket.disconnect,
      // overwriting the socket.emit to send the user with every req
      emit: function () {
        var eventName = Array.prototype.shift.call(arguments),
          args = [eventName, session.getUser()].concat(Array.prototype.slice
            .call(arguments));
        socket.emit.apply(socket, args);
      },
      forward: socket.forward,
      on: socket.on,
      once: socket.once,
      removeAllListeners: socket.removeAllListeners,
      removeListener: socket.removeListener
    };
  };

  chatSocket.$inject = ['socketFactory', 'session'];

  angular.module('app')
    .factory('chatSocket', chatSocket);
})();
