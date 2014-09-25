(function () {
  'use strict';

  var chatCtrl = function (toastr, chatSocket) {
    var self = this;
    self.panes = [
      {
        title: 'Welcome',
        content: 'app/views/templates/welcome.html',
        active: true
    }];

    chatSocket.on('welcome', function(welcomeMsg){
      toastr.info(welcomeMsg);
    });
  };

  chatCtrl.$inject = ['toastr', 'chatSocket'];

  angular.module('app')
    .controller('chatCtrl', chatCtrl);

})();
