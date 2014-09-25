(function () {

  'use strict';

  var excludeUsers = function ($filter, $parse) {
    return function (array, contacts) {
      return $filter('filter')(array, function (item) {
        for (var i = contacts.length - 1; i > -1; i--) {
          if ($parse('username')(item) === contacts[i].username) return false;
        }
        return true;
      });
    };
  };

  excludeUsers.$inject = ['$filter', '$parse'];

  angular.module('app')
    .filter('excludeUsers', excludeUsers);
})();
