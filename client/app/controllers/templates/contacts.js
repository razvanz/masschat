(function () {
  'use strict';

  var contactsCtrl = function (modalService) {
    var self = this;

    self.list = [{
      _id: '123123123123123123',
      username: 'mama',
      displayName: 'Mama user',
      email: 'razvan@sharkcell.dk'
    }];

    self.loadContactChat = function (contactId) {
      console.log(contactId);
    };

    self.resolveStatusClass = function (userStatus) {
      return '';
    };

    self.addContact = function () {
      var modalDefaults = {
        templateUrl: 'layout/views/modals/addContact.html',
        controller: 'addContactCtrl',
        // controllerAs: 'addContact',
        resolve: {}
      };
      modalService.showModal(modalDefaults, {})
        .then(function (result) {

        });
    };
  };

  contactsCtrl.$inject = ['modalService'];

  angular.module('app')
    .controller('contactsCtrl', contactsCtrl);

})();
