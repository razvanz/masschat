(function () {
  'use strict';

  var routesConfig = function ($stateProvider, $urlRouterProvider) {

    var routes = [
      {
        state: 'loading',
        config: {
          url: '/loading',
          templateUrl: 'app/views/main/loader.html',
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
          templateUrl: 'app/views/main/shell.html',
          controllerAs: 'main',
          controller: 'shellCtrl',
          settings: {
            authorize: ['admin', 'user']
          },
          resolve: {}
        }
      },
      {
        state: 'main.chat',
        config: {
          url: '/chat',
          templateUrl: 'app/views/chat.html',
          controllerAs: 'chat',
          controller: 'chatCtrl',
          settings: {
            authorize: ['admin', 'user']
          },
          resolve: {
            // 'contacts': ['$http',
            //   function ($http) {
            //     return $http.get('/contacts');
            // }],
            // 'groups': ['$http',
            //   function ($http) {
            //     return $http.get('/groups');
            // }]
          }
        }
      },
      {
        state: 'main.settings',
        config: {
          url: '/settings',
          templateUrl: 'app/views/settings.html',
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

    for (var i = 0, j = routes.length; i < j; i++) {
      $stateProvider.state(routes[i].state, routes[i].config);
    }
  };

  routesConfig.$inject = ['$stateProvider', '$urlRouterProvider'];

  angular.module('app')
    .config(routesConfig);
})();
