(function () {
  'use strict';

  var loaderCtrl = function ($timeout) {
    var self = this;
    self.hasTimeout = false;
    self.timeoutMessage = 'Unable to load view!';

    $timeout(function () {
      self.hasTimeout = true;
    }, 5000);

  };

  loaderCtrl.$inject = ['$timeout'];

  angular.module('app')
    .controller('loaderCtrl', loaderCtrl);

})();
