(function () {
  'use strict';

  var groupsCtrl = function (modalService) {
    var self = this;

    self.addGroup = function () {
      var modalDefaults = {
        templateUrl: 'layout/views/modals/addGroup.html',
        controller: 'addGroupCtrl',
        resolve: {}
      };
      modalService.showModal(modalDefaults, {})
        .then(function (result) {

        });
    };
  };

  groupsCtrl.$inject = ['modalService'];

  angular.module('app')
    .controller('groupsCtrl', groupsCtrl);

})();
