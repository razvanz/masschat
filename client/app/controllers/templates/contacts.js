(function () {
  'use strict';

  var contactsCtrl = function (modalService, session, dataSvc, chatSocket,
    toastr) {
    var self = this;
    self.list = [];

    self.loadContactChat = function (contactId) {
      console.log(contactId);
    };

    self.resolveStatusClass = function (userStatus) {
      switch (userStatus) {
      case 'online':
        return 'fa-circle text-success';
      case 'mobile':
        return 'fa-mobile-phone text-success';
      default:
        return 'ng-hide';
      }
    };

    self.addContact = function () {
      var modalDefaults = {
        templateUrl: 'app/views/modals/addContact.html',
        controller: 'addContactCtrl as modal',
        resolve: {
          'contacts': function () {
            // add the user so it will not be possible to add yourself
            var cntcs = [session.getUser()];
            for (var i = self.list.length - 1; i >= 0; i--) {
              cntcs.push(self.list[i].contact);
            }
            return cntcs;
          }
        }
      };
      modalService.showModal(modalDefaults, {});
    };

    chatSocket.on('contacts', function(contacts){
      self.list = contacts;
      console.log(angular.toJson(session.getUser()));
    });

    chatSocket.on('newContact', function (chat) {
      self.list.push(chat);
      toastr.info('User "' + chat.contact.displayName +
        '" has been added to your contacts list!');
    });

    chatSocket.on('addedAsContact', function (chat) {
      self.list.push(chat);
      toastr.info('User "' + chat.contact.displayName +
        '" added you as a contact!');
    });

    // update contacts status
    chatSocket.on('contactOnline', function(user) {
      for(var i=self.list.length-1; i>-1;i--){
        if(self.list[i].contact._id === user._id)
          self.list[i].contact.status = 'online';
      }
      toastr.info(user.displayName + ' has joined the chat!');
    });

    chatSocket.on('contactOffline', function(user) {
      for(var i=self.list.length-1; i>-1;i--){
        if(self.list[i].contact._id === user._id)
          self.list[i].contact.status = 'offline';
      }
      toastr.info(user.displayName + ' left the chat!');
    });

    chatSocket.emit('initContacts');
  };

  contactsCtrl.$inject = ['modalService', 'session', 'dataSvc', 'chatSocket',
    'toastr'];

  angular.module('app')
    .controller('contactsCtrl', contactsCtrl);

})();
