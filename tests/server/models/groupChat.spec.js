'use strict';

var config = require('../../../server/config/config'),
  database = require('../../../server/config/database')(config.db),
  GroupChat = require('../../../server/models/groupChat'),
  User = require('../../../server/models/user');

describe('GroupChat preconditions', function () {
  var user1 = {
      username: 'test1',
      email: 'test1@test.com',
      password: 'testPass1',
      provider: 'local',
      displayName: 'Test-user1'
    },
    theUser1;
  beforeEach(function (done) {
    User.insert(user1, function (err, theUser) {
      theUser1 = theUser.toObject();
      done();
    });
  });

  afterEach(function (done) {
    User.removeAll(done);
  });

  it('At least a user should be in the database', function (done) {
    User.all(function (err, users) {
      expect(users.length)
        .toBeGreaterThan(0);
      done();
    });
  });

  describe('GroupChat Model', function () {
    var groupChat = {
        // owner: theUser1._id,
        // users: [theUser1._id],
        messages: [],
        chatname: 'TestChat'
      },
      theChat;
    beforeEach(function (done) {
      groupChat.owner = theUser1._id;
      groupChat.users = [theUser1._id];
      GroupChat.insert(groupChat, function (err, chat) {
        theChat = chat.toObject();
        done();
      });
    });
    afterEach(function (done) {
      GroupChat.removeAll(done);
    });

    it('should query all the group chats', function (done) {
      GroupChat.all(function (err, chats) {
        expect(chats.length)
          .toBeGreaterThan(0);
        done();
      });
    });

    it('should query all the group chats based on criterias', function (
      done) {
      GroupChat.allWithOpts({
        owner: theUser1._id
      }, function (err, chats) {
        expect(chats.length)
          .toBeGreaterThan(0);
        done();
      });
    });

    it('should query one group chat', function (done) {
      GroupChat.one({
        owner: theUser1._id
      }, function (err, chat) {
        expect(theChat)
          .not
          .toEqual(null);
        expect(chat)
          .not.toEqual(undefined);
        done();
      });
    });

    it('should query one group chat based on criterias', function (done) {
      GroupChat.oneWithOpts({
        owner: theUser1._id
      }, 'messages owner', function (err, chat) {
        expect(theChat)
          .not
          .toEqual(null);
        expect(chat)
          .not.toEqual(undefined);
        done();
      });
    });

    it('should throw error if trying to insert a group chat without owner',
      function (done) {
        var anotherChat = {
          users: [],
          messages: [],
          chatname: 'Another Test Chat'
        };
        GroupChat.insert(anotherChat, function (err, aChat) {
          expect(err)
            .not.toEqual(null);
          expect(aChat)
            .toEqual(undefined);
          done();
        });
      });

    it('should insert a new new group chat', function (done) {
      var anotherChat = {
        owner: theUser1._id,
        users: [theUser1._id],
        messages: [],
        chatname: 'Another Test Chat'
      };
      GroupChat.insert(anotherChat, function (err, aChat) {
        expect(err)
          .toEqual(null);
        expect(aChat)
          .not.toEqual(undefined);
        done();
      });
    });

    it('should throw error if trying to update a nonexisting group chat',
      function (done) {
        GroupChat.update({
          chatname: 'not_there'
        }, {}, function (err, chat) {
          expect(err)
            .toEqual(null);
          expect(chat)
            .toEqual(null);
          done();
        });
      });

    it('should update a group chat', function (done) {
      var update = {
        chatname: 'updated'
      };
      GroupChat.update({
        chatname: theChat.chatname
      }, update, function (err, updated) {
        expect(err)
          .toEqual(null);
        expect(updated.toObject()
          .chatname)
          .toEqual(update.chatname);
        done();
      });
    });

    it('should throw error if trying to remove a nonexisting group chat',
      function (done) {
        GroupChat.remove({
          chatname: 'not_there'
        }, function (err, chat) {
          expect(err)
            .not.toEqual(null);
          expect(chat)
            .toEqual(undefined);
          done();
        });
      });

    it('should remove a group chat', function (done) {
      GroupChat.remove({
        chatname: theChat.chatname
      }, function (err, chat) {
        expect(err)
          .toEqual(null);
        expect(chat)
          .not.toEqual(undefined);
        done();
      });
    });

    it('should remove all group chats', function (done) {
      GroupChat.removeAll(function (err, result) {
        expect(result)
          .toEqual(true);
        done();
      });
    });

    describe('Aditional functionality', function () {
      var anotherUser = {
          username: 'another',
          email: 'test@test.com',
          password: 'testPass',
          provider: 'local',
          displayName: 'Another-user'
        },
        theUser2;

      beforeEach(function (done) {
        User.insert(anotherUser, function (err, user2) {
          theUser2 = user2.toObject();
          done();
        });
      });

      afterEach(function (done) {
        User.removeAll(done);
      });

      it('should add a user to the group chat', function (done) {
        GroupChat.update({
          _id: theChat._id
        }, {
          $push: {
            'users': theUser2._id
          }
        }, function (err, updated) {
          expect(err)
            .toEqual(null);
          // expect(updated.toObject()
          // 	.users)
          // 	.toContain(theUser2._id);
          done();
        });
      });

      it('should remove a user from the group chat', function (done) {
        GroupChat.update({
          _id: theChat._id
        }, {
          $push: {
            'users': theUser2._id
          }
        }, function (err, updated) {
          GroupChat.update({
            _id: theChat._id
          }, {
            $pull: {
              'users': theUser2._id
            }
          }, function (err, updated2) {
            expect(err)
              .toEqual(null);
            // expect(updated2.toObject()
            // 	.users)
            // 	.not.toContain(theUser2._id);
            done();
          });
        });
      });

      it('should push a message to a group chat', function (done) {
        var message = {
          author: theUser1._id,
          text: 'This is a test message!',
          seenBy: [theUser1._id]
        };
        GroupChat.addMessage({
          _id: theChat._id
        }, message, function (err, chatWithMsg) {
          expect(err)
            .toEqual(null);
          expect(chatWithMsg.toObject()
            .messages.length)
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
        GroupChat.addMessage({
          _id: theChat._id
        }, message, function (err, chatWithMsg) {
          var msgId = chatWithMsg.messages[0]._id;
          GroupChat.markMsgSeen(theChat._id, new Date()
            .getTime(), theUser2._id, function (err, data) {
              expect(err)
                .toEqual(null);
              GroupChat.oneWithOpts({
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

        GroupChat.update({
          _id: theChat._id
        }, {
          messages: messages
        }, function (err, theUpdatedChat) {
          GroupChat.markMsgSeen(theChat._id, new Date()
            .getTime(), theUser2._id, function (err, updatedNo) {
              expect(err)
                .toEqual(null);
              expect(updatedNo)
                .toEqual(10);
              GroupChat.all(function (err, chats) {
                for (var i = 0, j = chats[0].messages.length; i < j; i++) {
                  expect(chats[0].messages[i].seenBy)
                    .toContain(theUser2._id);
                }
                done();
              });
            });
        });
      });

      it('should retrieve latest n messages from a group chat', function (
        done) {
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

        GroupChat.update({
          _id: theChat._id
        }, {
          messages: messages
        }, function (err, theUpdatedChat) {
          GroupChat.getLastNMsgs({
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

      it('should retrieve number of unread messages', function (done) {
        var messages = [];
        for (var i = 10; i > 0; i--) {
          messages.push({
            author: theUser1._id,
            text: 'This is a test message nr ' + (11 - i),
            timestamp: new Date()
              .getTime(),
            seenBy: i > 5 ? [] : [theUser1._id]
          });
        }

        GroupChat.update({
          _id: theChat._id
        }, {
          messages: messages
        }, function (err, updatedChat) {
          GroupChat.unreadMsgNo(theUser1._id, function (err, res) {
            expect(err)
              .toEqual(null);
            expect(res[updatedChat._id])
                .toEqual(5);
            done();
          });
        });
      });

      it(
        'should retrieve latest n messages before timestamp from a group chat',
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

          GroupChat.update({
            _id: theChat._id
          }, {
            messages: messages
          }, function (err, theUpdatedChat) {
            GroupChat.getLastNMsgsAfterTmstp({
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
