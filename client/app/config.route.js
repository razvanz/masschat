(function () {
	'use strict';

	var routesConfig = function ($stateProvider, $urlRouterProvider) {

		var routes = [
			{
				state: 'loading',
				config: {
					url: '/loading',
					templateUrl: 'layout/views/main/loader.html',
					controllerAs: 'loader',
					controller: 'loaderCtrl',
					settings: {
						authorize: ['*']
					}
				}
			},
			{
				state: 'main',
				config: {
					abstract: true,
					templateUrl: 'layout/views/main/shell.html',
					controllerAs: 'main',
					controller: 'shellCtrl',
					settings: {
						authorize: ['admin', 'user']
					},
					resolve: {
						// datatypes: ['$http',
						// 	function ($http) {
						// 		return $http.get('/app/main');
						// }]
					}
				}
			},
			{
				state: 'main.chat',
				config: {
					url: '/chat',
					templateUrl: 'layout/views/chat.html',
					controllerAs: 'chat',
					controller: 'chatCtrl',
					settings: {
						authorize: ['admin', 'user']
					},
					resolve: {}
				}
			},
			{
				state: 'main.settings',
				config: {
					url: '/settings',
					templateUrl: 'layout/views/settings.html',
					controllerAs: 'usrSettings',
					controller: 'settingsCtrl',
					settings: {
						nav: 1,
						content: '<i class="fa fa-money sb-menu-icon"></i>',
						authorize: ['admin', 'user']
					},
					resolve: {}
				}
			}
		];

		$urlRouterProvider.otherwise('/loading');

		for(var i = 0,j = routes.length; i < j; i++){
			$stateProvider.state(routes[i].state, routes[i].config);
		}
	};

	routesConfig.$inject = ['$stateProvider', '$urlRouterProvider'];

	angular.module('app').config(routesConfig);
})();
