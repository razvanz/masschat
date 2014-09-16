(function () {
  'use strict';

  var addContactCtrl = function ($modalInstance) {
    var self = this;

    self.add = function () {
      console.log('adding modal!');
      $modalInstance.close(true);
    };

    self.cancel = function () {
      console.log('adding modal!');
      $modalInstance.dismiss('cancel');
    };
  };

  addContactCtrl.$inject = ['$modalInstance'];

  angular.module('app')
    .controller('addContactCtrl', addContactCtrl);

})();
