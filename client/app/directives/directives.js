(function () {
	angular.module('app')
		.directive('topbar', [
		function () {
				return {
					restrict: 'A',
					templateUrl: 'layout/views/templates/topbar.html',
					scope: {},
					controller: 'topbarCtrl'
				};
	}])

	.directive('toolbar', [
		function () {
			return {
				restrict: 'A',
				templateUrl: 'layout/views/templates/toolbar.html',
				scope: {},
				controller: 'toolbarCtrl'
			};
	}])

	.directive('groups', [
		function () {
			return {
				restrict: 'A',
				templateUrl: 'layout/views/templates/groups.html',
				scope: {},
				controller: 'groupsCtrl'
			};
	}])

  .directive('contacts', [
    function () {
      return {
        restrict: 'A',
        templateUrl: 'layout/views/templates/contacts.html',
        scope: {},
        controller: 'contactsCtrl'
      };
  }]);

})();
