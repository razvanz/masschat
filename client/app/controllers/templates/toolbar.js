(function () {
  'use strict';

  var toolbarCtrl = function () {
    var self = this;
    // just for lint errors
    self.name ='toolbar';
  };

  toolbarCtrl.$inject = [];

  angular.module('app')
    .controller('toolbarCtrl', toolbarCtrl);

})();
