(function () {
  'use strict';

  var Session = function ($http) {
      this.session = null;

      this.setSession = function (ses) {
        this.session = ses;
        return this.session;
      };

      this.getUser = function () {
        return this.session.user;
      };

      this.logout = function () {
        $http.post('/logout');
      };
    },
    init = function ($http, $q, session) {
      this.doInit = function () {
        var deferred = $q.defer();
        deferred.resolve(
          $http.get('/initSession')
          .success(function (res) {
            session.setSession(res);
            return res;
          })
        );
        return deferred.promise;
      };
    },
    runApp = function ($rootScope, $state, init, $cookies, toastr) {
      return init.doInit()
        .then(function (res) {
          var lastPath = ($cookies.lastPath !== undefined && typeof $cookies
              .lastPath === 'string') ?
            $cookies.lastPath : 'main.chat',
            lastPathParam = ($cookies.lastPathParams !== undefined &&
              typeof $cookies.lastPathParams ===
              'string') ?
            $cookies.lastPathParams : undefined;

          // when user comes back he is redirected to his last view
          $rootScope.$on('$stateChangeSuccess', function (event, toState,
            toParams) {
            if (toState.name !== 'loading') {
              // the state params need to be added to the route
              $cookies.lastPath = toState.name;
              $cookies.lastPathParams = angular.toJson(toParams);
            }
          });
          toastr.info('', 'Welcome to the chat!');
          return $state.go(lastPath, angular.fromJson(lastPathParam));
        }, function (err) {
          // do something
        });
    };

  Session.$inject = ['$http'];
  init.$inject = ['$http', '$q', 'session'];
  runApp.$inject = ['$rootScope', '$state', 'init', '$cookies', 'toastr'];

  var app = angular.module('app', [
  'ngAnimate', 'ui.router', 'ngSanitize', 'ui.bootstrap', 'debounce',
    'ngCookies', 'toaster', 'btford.socket-io', 'ui.gravatar'
  ]);

  app.service('session', Session)
    .service('init', init)
    .run(runApp);
})();
