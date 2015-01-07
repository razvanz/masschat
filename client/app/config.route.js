(function() {
  'use strict';

  var routesConfig = function($stateProvider, $urlRouterProvider) {

    var routes = [{
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
    }, {
      state: 'error',
      config: {
        url: '/error',
        templateUrl: 'app/views/templates/error.html',
        controllerAs: 'error',
        controller: 'errorCtrl',
        settings: {
          authorize: ['*']
        }
      }
    }, {
      state: 'app',
      config: {
        abstract: true,
        templateUrl: 'app/views/main/shell.html',
        controllerAs: 'shell',
        controller: 'shellCtrl',
        settings: {
          authorize: ['*']
        },
        resolve: {
          'validSession': ['$q', 'session', function($q, session) {
            console.log('check valid session: ' + session.isValid());
            var deferred = $q.defer();
            if (session.isValid()) {
              deferred.resolve(session);
            } else {
              deferred.reject(
                new Error('Session has not been initialized!'));
            }
            return deferred.promise;
          }],
          'contacts': ['$http',
            function ($http) {
              return $http.get('/contacts');
          }],
          // 'groups': ['$http',
          //   function ($http) {
          //     return $http.get('/groups');
          // }]
        }
      }
    }, {
      state: 'app.chat',
      config: {
        url: '/chat/:id',
        templateUrl: 'app/views/templates/chatRoom.html',
        controllerAs: 'chat',
        controller: 'chatRoomCtrl',
        title: 'CHAT',
        settings: {
          authorize: ['*']
        },
        resolve: {}
      }
    }, {
      state: 'app.settings',
      config: {
        url: '/settings',
        templateUrl: 'app/views/templates/settings.html',
        controllerAs: 'settings',
        controller: 'settingsCtrl',
        title: 'SETTINGS',
        settings: {
          authorize: ['*']
        },
        resolve: {}
      }
    }];

    $urlRouterProvider.otherwise('/loading');

    for (var i = 0, j = routes.length; i < j; i++) {
      $stateProvider.state(routes[i].state, routes[i].config);
    }
  };

  routesConfig.$inject = ['$stateProvider', '$urlRouterProvider'];

  angular.module('app')
    .config(routesConfig);
})();
