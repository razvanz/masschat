(function () {
	'use strict';

	var chatCtrl = function ($rootScope, $scope, session, $cookies, chatSocket) {
		var self = this;

		chatSocket.on('welcome', function (ev, data) {
      console.log(ev);
			console.log(data);
    });

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

	chatCtrl.$inject = ['$rootScope', '$scope', 'session', '$cookies', 'chatSocket'];

	angular.module('app')
		.controller('chatCtrl', chatCtrl);

})();
