(function () {
  'use strict';

  var updatesSocket = function (socketFactory) {
    return socketFactory({
      // prefix: 'socket:',
      ioSocket: io.connect('/updates')
    });
  };

  updatesSocket.$inject = ['socketFactory'];

  angular.module('app')
    .factory('updatesSocket', updatesSocket);
})();
