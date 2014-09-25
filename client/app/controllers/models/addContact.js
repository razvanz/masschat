(function () {
  'use strict';

  var addContactCtrl = function ($modalInstance, chatSocket, toastr, contacts) {
    var self = this;
    self.newContact = undefined;
    self.contacts = contacts;
    console.log(contacts);

    self.add = function (newContact) {
      if(newContact){
        chatSocket.emit('addContact', newContact);
        return $modalInstance.close();
      }
      else{
        return toastr.err('Please select a registered user!');
      }
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
