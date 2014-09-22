(function () {
  'use strict';

  var topbarCtrl = function ($http, session) {
    var self = this;
    self.user = session.getUser();
    self.loadUsageReports = function(){
      return;
    };
    self.loadProfileSettings = function(){
      return;
    };
  };

  topbarCtrl.$inject = ['$http', 'session'];

  angular.module('app')
    .controller('topbarCtrl', topbarCtrl);

})();
