'use strict';

var config = require('../../../server/config/config'),
  database = require('../../../server/config/database')(config.db),
  PrivateChat = require('../../../server/models/privateChat'),
  User = require('../../../server/models/user');

describe('PrivateChat preconditions', function () {
  var user1 = {
      username: 'test1',
      email: 'test1@test.com',
      password: 'testPass1',
      provider: 'local',
      displayName: 'Test-user1'
    },
    user2 = {
      username: 'test2',
      email: 'test2@test.com',
      password: 'testPass2',
      provider: 'local',
      displayName: 'Test-user2'
    };
  beforeEach(function (done) {
    // console.info('Creating 2 users!');
    User.insert(user1, function (err, theUser1) {
      User.insert(user2, done);
    });
  });

  afterEach(function (done) {
    User.removeAll(done);
  });

  it('At least 2 user should be in the database', function (done) {
    User.all(function (err, users) {
      expect(users.length)
        .toBeGreaterThan(1);
      done();
    });
  });

  describe("PrivateChat Model", function () {
    var privateChat = {
        users: [],
        messages: [],
      },
      theUser1, theUser2, theChat;
    beforeEach(function (done) {
      User.all(function (err, theUsers) {
        theUser1 = theUsers[0].toObject();
        theUser2 = theUsers[1].toObject();
        privateChat.users = [theUser1._id, theUser2._id];
        PrivateChat.insert(privateChat, function (err, chat) {
          theChat = chat.toObject();
          done();
        });
      });
    });
    afterEach(function (done) {
      PrivateChat.removeAll(done);
    });

    it('should query all the private chats', function (done) {
      PrivateChat.all(function (err, theChats) {
        expect(theChats.length)
          .toBeGreaterThan(0);
        done();
      });
    });

    it('should query all the private chats based on criterias', function (
      done) {
      PrivateChat.allWithOpts({
        _id: theChat._id
      }, function (err, chats) {
        expect(chats.length)
          .toBeGreaterThan(0);
        done();
      });
    });

    it('should query one private chat', function (done) {
      PrivateChat.one({
        _id: theChat._id
      }, function (err, chat) {
        expect(chat)
          .not
          .toEqual(null);
        done();
      });
    });

    it('should query one private chat based on criterias', function (done) {
      PrivateChat.oneWithOpts({
        _id: theChat._id
      }, 'messages', function (err, chat) {
        expect(chat)
          .not
          .toEqual(null);
        done();
      });
    });

    it(
      'should throw error if trying to insert a private chat without 2 users',
      function (done) {
        var anotherChat = {
          users: [],
          messages: [],
        }
        PrivateChat.insert(anotherChat, function (err, chat) {
          expect(err)
            .not.toEqual(null);
          done();
        });
      });

    it('should insert a new private chat', function (done) {
      var anotherChat = {
        users: [theUser1._id, theUser2._id],
        messages: []
      }
      PrivateChat.insert(anotherChat, function (err, chat) {
        expect(err)
          .toEqual(null);
        done();
      });
    });

    it('should throw error if trying to update a non-existing private chat',
      function (done) {
        PrivateChat.update({
          chatname: 'not_there'
        }, {}, function (err, chat) {
          expect(chat)
            .toEqual(null);
          done();
        });
      });

    it('should update a private chat', function (done) {
      var update = {
        chatname: 'updated'
      };
      PrivateChat.update({
        _id: theChat._id
      }, update, function (err, updated) {
        expect(err)
          .toEqual(null);
        expect(updated.toObject()
          .chatname)
          .toEqual(update.chatname);
        done();
      });
    });

    it('should throw error if trying to remove a non-existing private chat',
      function (done) {
        PrivateChat.remove({
          chatname: 'not_there'
        }, function (err, chat) {
          expect(err)
            .not.toEqual(null);
          done();
        });
      });

    it('should remove a private chat', function (done) {
      PrivateChat.remove({
        _id: theChat._id
      }, function (err, chat) {
        expect(err)
          .toEqual(null);
        done();
      });
    });

    it('should remove all private chats', function (done) {
      PrivateChat.removeAll(function (err, data) {
        expect(data)
          .toEqual(true);
        done();
      });
    });

    describe('Aditional functionality', function () {

      beforeEach(function (done) {
        done();
      });

      afterEach(function (done) {
        done();
      });

      it('should push a message to a private chat', function (done) {
        var message = {
          author: theUser1._id,
          text: 'This is a test message!',
          seenBy: [theUser1._id]
        };
        PrivateChat.addMessage({
          _id: theChat._id
        }, message, function (err, chatWithMsg) {
          expect(err)
            .toEqual(null);
          expect(chatWithMsg.messages.length)
            .toBeGreaterThan(0);
          done();
        });
      });

      it('should mark a message as seen', function (done) {
        var message = {
          author: theUser1._id,
          text: 'This is a test message!',
          seenBy: [theUser1._id]
        };
        PrivateChat.addMessage({
          _id: theChat._id
        }, message, function (err, chatWithMsg) {
          var msgId = chatWithMsg.messages[0]._id;
          PrivateChat.markMsgSeen(theChat._id, new Date()
            .getTime(), theUser2._id, function (err, data) {
              expect(err)
                .toEqual(null);
              PrivateChat.oneWithOpts({
                'messages._id': msgId
              }, 'messages.seenBy', {
                $limit: 1
              }, function (err, chat) {
                expect(chat.messages[0].seenBy)
                  .toContain(theUser2._id);
                done();
              });
            });
        });
      });

      it('should mark all messages before a timestamp as seen', function (
        done) {
        var messages = [];
        for (var i = 10; i > 0; i--) {
          messages.push({
            author: theUser1._id,
            text: 'This is a test message nr ' + (11 - i),
            seenBy: [theUser1._id]
          });
        }

        PrivateChat.update({
          _id: theChat._id
        }, {
          messages: messages
        }, function (err, theUpdatedChat) {
          PrivateChat.markMsgSeen(theChat._id, new Date()
            .getTime(), theUser2._id, function (err, updatedNo) {
              expect(err)
                .toEqual(null);
              expect(updatedNo)
                .toEqual(10);
              PrivateChat.all(function (err, chats) {
                for (var i = 0, j = chats[0].messages.length; i < j; i++) {
                  expect(chats[0].messages[i].seenBy)
                    .toContain(theUser2._id);
                }
                done();
              });
            });
        });
      });

      it('should retrieve latest n messages from a private chat',
        function (done) {
          var messages = [],
            lastTmstp, n = 5;
          for (var i = 10; i > 0; i--) {
            lastTmstp = new Date()
              .getTime() + ((10 - i) * 1000);
            messages.push({
              author: theUser1._id,
              text: 'This is a test message nr ' + (11 - i),
              seenBy: [theUser1._id],
              timestamp: lastTmstp
            });
          }

          PrivateChat.update({
            _id: theChat._id
          }, {
            messages: messages
          }, function (err, theUpdatedChat) {
            PrivateChat.getLastNMsgs({
              _id: theChat._id
            }, n, function (err, msgs) {
              expect(err)
                .toEqual(null);
              expect(msgs.length)
                .toEqual(n);
              expect(msgs[0].timestamp.getTime())
                .toEqual(lastTmstp);
              done();
            });
          });
        });

      it(
        'should retrieve latest n messages before timestamp from a private chat',
        function (done) {
          var messages = [],
            lastTmstp, beforeTmstp, n = 3;
          for (var i = 10; i > 0; i--) {
            lastTmstp = new Date()
              .getTime() + ((10 - i) * 1000);
            if (i === 5) beforeTmstp = lastTmstp;
            messages.push({
              author: theUser1._id,
              text: 'This is a test message nr ' + (11 - i),
              seenBy: [theUser1._id],
              timestamp: lastTmstp
            });
          }

          PrivateChat.update({
            _id: theChat._id
          }, {
            messages: messages
          }, function (err, theUpdatedChat) {
            PrivateChat.getLastNMsgsAfterTmstp({
              _id: theChat._id
            }, n, beforeTmstp, function (err, msgs) {
              expect(err)
                .toEqual(null);
              expect(msgs.length)
                .toEqual(n);
              // we will receive msgs before that tmstp, therefore - 1000
              expect(msgs[0].timestamp.getTime())
                .toEqual((beforeTmstp - 1000));
              done();
            });
          });
        });
    });
  });
});
