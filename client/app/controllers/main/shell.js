(function () {
  'use strict';

  var shellCtrl = function (toastr, chatSocket) {
    var ctrl = this;
    ctrl.tabs = [];

    chatSocket.on('welcome', function(welcomeMsg){
      toastr.info(welcomeMsg);
    });

    window.onbeforeunload = function () {
      chatSocket.emit('dscnct');
    };
  };

  shellCtrl.$inject = ['toastr', 'chatSocket'];

  angular.module('app')
    .controller('shellCtrl', shellCtrl);

})();
