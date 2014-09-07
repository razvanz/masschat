( function () {
    'use strict';

    var loaderCtrl = function($timeout, $state, $cookies){
      var self = this;
      self.hasTimeout = false;
      self.timeoutMessage = 'Unable to load view!';

      $timeout(function(){
        self.hasTimeout = true;

        // redirecting to last view
        $timeout(function(){
            return $state.go($cookies.lastPath, angular.fromJson($cookies.lastPathParams));
        },2500);

      },5000);

    };

    loaderCtrl.$inject = [ '$timeout', '$state', '$cookies' ];

    angular.module( 'app' ).controller( 'loaderCtrl', loaderCtrl );

} )();
