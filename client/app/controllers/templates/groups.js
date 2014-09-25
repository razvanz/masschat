(function () {
  'use strict';

  var groupsCtrl = function (modalService, chatSocket, toastr) {
    var self = this;
    self.list = [];
    self.loadGroupChat = function (contactId) {
      console.log(contactId);
    };

    self.resolveStatusClass = function () {
      return 'ng-hide';
    };

    self.addGroup = function () {
      var modalDefaults = {
        templateUrl: 'app/views/modals/addGroup.html',
        controller: 'addGroupCtrl as modal',
        resolve: {}
      };
      modalService.showModal(modalDefaults, {})
        .then(function (result) {
          console.log(result);
        });
    };

    chatSocket.on('newGroup', function (group) {
      self.list.push(group);
      toastr.info('A new group "' + group.chatname +
        '" has been created!');
      console.log(group);
    });

    chatSocket.emit('initGroups');

    chatSocket.on('groups', function(groups){
      self.list = groups;
    });
  };

  groupsCtrl.$inject = ['modalService', 'chatSocket', 'toastr'];

  angular.module('app')
    .controller('groupsCtrl', groupsCtrl);

})();
