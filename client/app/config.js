(function () {
  'use strict';

  var config = function (gravatarServiceProvider) {
    gravatarServiceProvider.defaults = {
      "default": 'mm' // Mystery man as default for missing avatars
    };
    // Use https endpoint
    gravatarServiceProvider.secure = true;
  };

  config.$inject = ['gravatarServiceProvider'];

  angular.module('ui.gravatar')
    .config(config);

})();
