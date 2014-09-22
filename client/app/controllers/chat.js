(function () {
  'use strict';

  var chatCtrl = function ($rootScope, $scope, session,
    $cookies, chatSocket, toastr) {
    var self = this;
    self.panes = [
      {
        title: 'Welcome',
        content: 'app/views/templates/welcome.html',
        active: true
    }];
  };

  chatCtrl.$inject = ['$rootScope', '$scope', 'session',
    '$cookies', 'chatSocket', 'toastr'];

  angular.module('app')
    .controller('chatCtrl', chatCtrl);

})();
