(function () {
  'use strict';

  var addContactCtrl = function ($modalInstance, chatSocket, toastr,
    contacts) {
    var self = this;
    self.newContact = undefined;
    self.contacts = contacts;

    self.add = function (newContact) {
      return chatSocket.emit('addContact', newContact,
        function (err, result) {
          if (err) toastr.err('', err.message);
          return $modalInstance.close(result);
        });
    };

    self.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  };

  addContactCtrl.$inject = ['$modalInstance', 'chatSocket', 'toastr',
    'contacts'];

  angular.module('app')
    .controller('addContactCtrl', addContactCtrl);

})();
