(function() {
  'use strict';

  var Session = function($http) {
      var svc = this;

      svc.session = null;
      svc.user = null;
      svc.silo = null;

      svc.setSession = function(session) {
        svc.session = session;

        // a session must have a user
        svc.setUser(session.user);

        // default silo is automatically set
        if (session.silo) {
          svc.setSilo(session.silo);
        }
      };

      svc.setUser = function(user) {
        svc.user = user;
      };

      svc.getUser = function() {
        return svc.user;
      };

      svc.setSilo = function(silo) {
        svc.silo = silo;
      };

      svc.getSilo = function() {
        return svc.silo;
      };

      svc.isAuthorized = function(authorizedRoles) {
        if (!svc.session) {
          return false;
        } else if (!angular.isArray(authorizedRoles)) {
          authorizedRoles = [authorizedRoles];
        } else if (authorizedRoles.indexOf('*') !== -1) {
          return true;
        } else {
          return !!(_.intersection(authorizedRoles, svc.session.user.roles)
            .length);
        }
      };

      svc.isValid = function() {
        return !!(svc.session && svc.user);
      };

      svc.logout = function() {
        $http.post('/logout');
      };
    },
    init = function($http, $q, session) {
      this.doInit = function() {
        var deferred = $q.defer();
        deferred.resolve(
          $http.get('/initSession')
          .success(function(res) {
            session.setSession(res);
            return res;
          })
        );
        return deferred.promise;
      };
    },
    runApp = function($rootScope, $state, init) {
      navigate('loading');
      return init.doInit()
        .then(function(sessionData) {
          navigate('app.settings');
        }, function(err) {
          navigate('error');
        });

      function navigate(stateName, stateParams) {
        $state.go(stateName, stateParams, {
          location: 'replace'
        });
      }
    };

  Session.$inject = ['$http'];
  init.$inject = ['$http', '$q', 'session'];
  runApp.$inject = ['$rootScope', '$state', 'init'];

  var app = angular.module('app', [
    'ngAnimate', 'ui.router', 'ngSanitize', 'ui.bootstrap', 'debounce',
    'ngCookies', 'toaster', 'btford.socket-io', 'ui.gravatar', 'duScroll'
  ]);

  app.service('session', Session)
    .service('init', init)
    .run(runApp);
})();
