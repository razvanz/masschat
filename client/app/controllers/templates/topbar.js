( function () {
    'use strict';

    var topbarCtrl = function(session){
      var self = this;
      self.user = session.getUser();
      console.log(self);
    };

    topbarCtrl.$inject = ['session'];

    angular.module( 'app' ).controller( 'topbarCtrl', topbarCtrl );

} )();
