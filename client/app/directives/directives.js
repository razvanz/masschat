(function () {

  angular.module('app')
    .directive('topbar', [

      function () {
        return {
          restrict: 'A',
          templateUrl: 'layout/views/templates/topbar.html',
          scope: true,
          controller: 'topbarCtrl',
          controllerAs: 'topbar'
        };
  }])
    .directive('groups', [

      function () {
        return {
          restrict: 'A',
          templateUrl: 'layout/views/templates/groups.html',
          scope: true,
          controller: 'groupsCtrl',
          controllerAs: 'groups'
        };
 }])
    .directive('contacts', [

      function () {
        return {
          restrict: 'A',
          templateUrl: 'layout/views/templates/contacts.html',
          scope: true,
          controller: 'contactsCtrl',
          controllerAs: 'contacts'
        };
  }]);

})();
