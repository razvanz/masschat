(function () {
  'use strict';

  var userLookupCtrl = function (dataSvc) {
    var self = this;
      
    self.getUsers = function(username){
      return dataSvc.lookupUser(username);
    };
  };

  userLookupCtrl.$inject = ['dataSvc'];

  angular.module('app')
    .controller('userLookupCtrl', userLookupCtrl);

})();
