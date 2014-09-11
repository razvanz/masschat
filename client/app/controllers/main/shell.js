(function () {
	'use strict';

	var shellCtrl = function ($rootScope, $scope, session, $timeout, toastr) {
		var self = this;

    $timeout(function(){
      toastr.success('', 'Successfuly logged in');
    }, 500);
	};

	shellCtrl.$inject = ['$rootScope', '$scope', 'session', '$timeout', 'toastr'];

	angular.module('app')
		.controller('shellCtrl', shellCtrl);

})();
