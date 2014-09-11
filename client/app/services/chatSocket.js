(function () {
  'use strict';

  var chatSocket = function (socketFactory) {
    return socketFactory({
      // prefix: 'socket:',
      ioSocket: io.connect('/chat')
    });
  };

  chatSocket.$inject = ['socketFactory'];

  angular.module('app')
    .factory('chatSocket', chatSocket);
})();
