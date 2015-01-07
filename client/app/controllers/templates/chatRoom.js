(function() {
  'use strict';

  var chatRoomCtrl = function() {
    var ctrl = this;

    ctrl.scrollDown = function(duration) {
      angular.element(document.getElementById('chat-room'))
        .scrollTo(angular.element(document.getElementById('last-msg')), 0,
          duration);
    };


    ctrl.scrollDown(0);
  };

  chatRoomCtrl.$inject = [];

  angular.module('app')
    .controller('chatRoomCtrl', chatRoomCtrl);

})();
