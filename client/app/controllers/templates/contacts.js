(function () {
  'use strict';

  var contactsCtrl = function (modalService, session, dataSvc, chatSocket, toastr) {
    var self = this;
    var user = session.getUser();
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
            var contc = [];
            for(var i = self.list-1;i>=0;i--){
              if(self.list[i].users[0] !== user._id){
                console.log(self.list[i].users[0]);
                contc.push({_id: self.list[i].users[0]});
              } else if(self.list[i].users[1] !== user._id){
                contc.push({_id: self.list[i].users[1]});
              }
            }
            return contc;
          }
        }
      };
      modalService.showModal(modalDefaults, {});
    };

    self.loadContacts = function(){
      return dataSvc.privateChats().then(function(res){
        self.list = res.data;
      });
    };

    self.loadContacts();

    chatSocket.on('newContact', function (newContact, cb) {
      self.list.push(newContact);
      toastr.info('User "' + newContact.username +
        '" has been added to your contacts list!');
      cb(null);
    });
  };

  contactsCtrl.$inject = ['modalService', 'session', 'dataSvc', 'chatSocket', 'toastr'];

  angular.module('app')
    .controller('contactsCtrl', contactsCtrl);

})();
