(function () {
  'use strict';

  angular.module('app')
    .directive('topbar', [

      function () {
        return {
          restrict: 'A',
          templateUrl: 'app/views/templates/topbar.html',
          scope: true,
          controller: 'topbarCtrl',
          controllerAs: 'topbar'
        };
  }])
    .directive('groups', [

      function () {
        return {
          restrict: 'A',
          templateUrl: 'app/views/templates/groups.html',
          scope: true,
          controller: 'groupsCtrl',
          controllerAs: 'groups'
        };
 }])
    .directive('contacts', [

      function () {
        return {
          restrict: 'A',
          templateUrl: 'app/views/templates/contacts.html',
          scope: true,
          controller: 'contactsCtrl',
          controllerAs: 'contacts'
        };
  }])
    .directive('userLookup', [
      function () {
        return {
          restrict: 'A',
          templateUrl: 'app/views/templates/userLookup.html',
          scope: {
            userLookup: '=',
            excluded: '='
          },
          controller: 'userLookupCtrl',
          controllerAs: 'lookup'
        };
  }]);

})();
