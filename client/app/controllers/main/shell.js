(function () {
  'use strict';

  var shellCtrl = function (chatSocket) {
    // var self = this;
    window.onbeforeunload = function () {
      chatSocket.emit('dscnct');
    };
  };

  shellCtrl.$inject = ['chatSocket'];

  angular.module('app')
    .controller('shellCtrl', shellCtrl);

})();
