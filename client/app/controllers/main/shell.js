(function () {
	'use strict';

	var shellCtrl = function ($rootScope, $scope, session) {
		var self = this;

		var user = session.getUser();
	};

	shellCtrl.$inject = ['$rootScope', '$scope', 'session'];

	angular.module('app')
		.controller('shellCtrl', shellCtrl);

})();
