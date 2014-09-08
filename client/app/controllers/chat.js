(function () {
	'use strict';

	var chatCtrl = function ($rootScope, $scope, session, $cookies) {
		var self = this;

		self.panes = [
			{
				title: 'Room 1',
				content: 'layout/views/templates/chatRoom.html',
				active: true
			},
			{
				title: 'Room 2',
				content: 'layout/views/templates/chatRoom.html'
			},
			{
				title: 'Room 3',
				content: 'layout/views/templates/chatRoom.html'
			},
			{
				title: 'Room 4',
				content: 'layout/views/templates/chatRoom.html'
			}
      ];
	};

	chatCtrl.$inject = ['$rootScope', '$scope', 'session', '$cookies'];

	angular.module('app')
		.controller('chatCtrl', chatCtrl);

})();
