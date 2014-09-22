(function () {

  'use strict';

  var excludeUsers = function ($filter) {
    return function (array, contacts) {
      return $filter('filter')(array, function (item) {
        for (var i = contacts.length - 1; i >= 0; i--) {
          if (item._id === contacts[i]._id) return false;
        }
        return true;
      });
    };
  };

  excludeUsers.$inject = ['$filter'];

  angular.module('app')
    .filter('excludeUsers', excludeUsers);
})();
