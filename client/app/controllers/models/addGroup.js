(function () {
  'use strict';

  var addGroupCtrl = function ($modalInstance) {
    var self = this;
    self.create = function () {
      $modalInstance.close(true);
    };
    self.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  };

  addGroupCtrl.$inject = ['$modalInstance'];

  angular.module('app')
    .controller('addGroupCtrl', addGroupCtrl);

})();
