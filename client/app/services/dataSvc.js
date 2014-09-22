(function () {
  'use strict';

  var dataSvc = function ($http, session) {
    this.lookupUser = function (lookup) {
      return $http.get('/lookupUser', {
          params: {
            username: lookup
          }
        })
        .then(function (res) {
          return res.data;
        });
    };

    this.privateChats = function () {
      return $http.get('/privateChats', {
        userId: session.getUser()._id
      });
    };
  };

  dataSvc.$inject = ['$http', 'session'];

  angular.module('app')
    .service('dataSvc', dataSvc);
})();
