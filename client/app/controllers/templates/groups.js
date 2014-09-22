(function () {
  'use strict';

  var groupsCtrl = function (modalService) {
    var self = this;

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
  };

  groupsCtrl.$inject = ['modalService'];

  angular.module('app')
    .controller('groupsCtrl', groupsCtrl);

})();
