var io = require("socket.io"),
    connect = require("connect"),
    mongoose = require('mongoose'),
    db = require('./database/db.js'),
    UserSchema = require('./database/schemas/user'),
    PrivateChatSchema = require('./database/schemas/privateChat'),
    GroupChatSchema = require('./database/schemas/groupChat');
var SERVERPORT = 7777;
var chatRoom = io.listen(connect().use(connect.static('public')).listen(SERVERPORT));
var userTokens = [{username: 'razvan', token: '123456789', socket: ''}]; // save here the active users info {username, token, soketID}

 testChatEvent({username: 'razvan', token: '123456789', message: {username: 'razvan',text: 'test sendMessage event',datetime: 1397853686066, seenBy: []}, privateChatId: '53517fb27b516bd7039ed939'}, function(data){console.log(data);});

 function testChatEvent(params, responseFn){


        /*
            Received from client:
            params = {token, username, privateChatId || groupChatId, message}
            Response to client:
            Broadcast to clients: response = {privateChatId || groupChatId, message: {username, text, datetime, seenBy: []}}
        */
        // return userTokens.forEach(function(item, index, array) {
        //     if (item.token === params.token && item.username === params.username) {
               
        //         if (params.privateChatId) {
        //             return PrivateChatSchema.findOne({ '_id' : mongoose.Types.ObjectId(params.privateChatId.toString()), 'messages.datetime': params.message.datetime}, {'messages.$' : 1}, function(err, privateChat){
        //                 if (err) return handleError(err, 'database');
        //                 else if(privateChat) {
        //                     console.log(privateChat);
        //                     if(privateChat.messages[0].seenBy.indexOf(params.username)< 0){
        //                         return PrivateChatSchema.update({ '_id' : mongoose.Types.ObjectId(params.privateChatId.toString()), 'messages._id': mongoose.Types.ObjectId(privateChat.messages[0]._id.toString())}, {$push: {'messages.seenBy': params.username}}, function(err, hasUpdated){
        //                             if (err) return handleError(err, 'database');
        //                             else if(hasUpdated){
        //                                 privateChat.messages[0].seenBy.push(params.username);
        //                                 console.log(privateChat);
        //                                 //io.sockets.in(params.privateChatId.toString()).emit('messageSeenBy', {privateChatId: params.privateChatId, message: privateChat.message[0]});
        //                                 return responseFn('success - message seen');
        //                             }
        //                             else return responseFn('fail - not updated seen by');
        //                         });
        //                     }
        //                     else return responseFn('success - message already seen');
        //                 }
        //                 else return responseFn('fail - not able to send message');
        //             });
        //         }
        //         else if (params.groupChatId) {
        //             return GroupChatSchema.findOne({ '_id' : mongoose.Types.ObjectId(params.groupChatId.toString()), 'messages.datetime': params.message.datetime}, {'messages.$' : 1}, function(err, groupChat){
        //                 if (err) return handleError(err, 'database');
        //                 else if(groupChat) {
        //                     groupChat.messages[0].seenBy.push(params.username);
        //                     groupChat.save(function(err, updatedGroupChat){
        //                         if (err) return handleError(err, 'database');
        //                         else if(updatedGroupChat){
        //                             console.log(updatedGroupChat);
        //                             //io.sockets.in(params.groupChatId.toString()).emit('messageSeenBy', {groupChatId: params.groupChatId, message: message});
        //                             return responseFn('success - message received');
        //                         }
        //                         else return responseFn('fail - unable to update message');
        //                     });

        //                     console.log(groupChat);
        //                 }
        //                 else return responseFn('fail - not able to send message');
        //             });
        //         }
        //         else {
        //             return responseFn({status: 'fail - wrong chat id'});
        //         }
        //     }
        //     else{
        //         return responseFn('not authorized');
        //     }
        // });

 }

chatRoom.sockets.on('connection', function(socket) {
    
    //Razvan
    socket.on('loadChat', function(params, responseFn) {
        /*
            Received from client:
            params = {username, token}
            Response to client:
            profile = {username, token, status, privateChats: [ {username, status, privateChatId , unreadMsgNr}], groupChats: [ {chatname, groupChatId, unreadMsgNr }] }    ||     "not authorized"
        */
        UserSchema.findOne({
            'username': params.username
        }, 'username token privateChats groupChats', function(err, user) {
            if (err) return handleError(err, 'database');
            else {
                console.log(user);
                if (user.token == params.token) {
                    return calcUnreadUserMsgs(params.username, function respond(unreadMesseges) {
                        console.log(unreadMesseges)
                        var profile = {
                            username: user.username,
                            token: user.token,
                            privateChats: [],
                            groupChats: []
                        };
                        for (var i = 0; i < user.groupChats.length; i++) {
                            profile.groupChats[i] = {
                                chatname: user.groupChats[i].chatname,
                                unreadMsgNr: 0,
                                groupchatId: user.groupChats[i].groupChatId.toString()
                            };
                            socket.join(user.groupChats[i].groupChatId.toString()); // joining the user socket to it's group chats
                            //  adding unread msgs nunber per group chat
                            for (var j = unreadMesseges.groupChatUnread.length - 1; j >= 0; j--) {
                                if (user.groupChats[i].groupChatId.toString() == unreadMesseges.groupChatUnread[j]._id.toString()) {
                                    profile.groupChats[i].unreadMsgNr = unreadMesseges.groupChatUnread[j].value;
                                    break;
                                }
                            };
                        }
                        // getting the status of the friends
                        for (var i = user.privateChats.length - 1; i >= 0; i--) {
                            profile.privateChats[i] = {
                                username: user.privateChats[i].username,
                                status: 'offline',
                                unreadMsgNr: 0,
                                privateChatId: user.privateChats[i].privateChatId.toString()
                            };
                            socket.join(user.privateChats[i].privateChatId.toString()); // joining the user socket to it's private chats
                            for (var j = userTokens.length - 1; j >= 0; j--) {
                                if (user.privateChats[i].username === userTokens[j].username) {
                                    profile.privateChats[i].status = 'online';
                                    break;
                                }
                            };
                            for (var j = unreadMesseges.privateChatsUnread.length - 1; j >= 0; j--) {
                                if (unreadMesseges.privateChatsUnread[j]._id.toString() == user.privateChats[i].privateChatId.toString()) {
                                    profile.privateChats[i].unreadMsgNr = unreadMesseges.privateChatsUnread[j].value;
                                    break;
                                }
                            };
                        };
                        //adding to cache
                        userTokens.push({
                            username: params.username,
                            token: params.token,
                            socket: socket.id
                        });
                        //logging when an user connects
                        console.log('\n\n***********\n %s connected to chat!\n***********\n\n', params.username);
                        return responseFn(profile);
                    });
                }
                else {
                    return responseFn('Not authorized!');
                }
            }
        });
    });
    //Razvan
    socket.on('chatSelect', function(params, responseFn) {
        /*
            Received from client:
            params = {token, username, privateChatId || groupChatId}
            Response to client:
            response = {users: [username], messages: [ username, text, datetime, seenBy: [username, username,...] ] [, admin:[username, ...], chatname] }
        */

        return userTokens.forEach(function(item, index, array) {
            if (item.token === params.token && item.username === params.username) {

                if (params.privateChatId) {
                    return PrivateChatSchema.findOne({ '_id' : mongoose.Types.ObjectId(params.privateChatId.toString())}, 'users messages',function(err, privateChat){
                        if (err) return handleError(err, 'database');
                        else{
                            for (var i = privateChat.messages.length - 1; i >= 0; i--) {
                                if(privateChat.messages[i].seenBy.indexOf(params.username) < 0){
                                    privateChat.messages[i].seenBy.push(params.username);
                                }
                            }
                            return privateChat.save(function(err, privateChat){
                                if (err) return handleError(err, 'database');
                                else{
                                    return responseFn(privateChat);
                                }
                            });
                        }
                    });
                }
                else if (params.groupChatId) {
                    return GroupChatSchema.findOne({ '_id' : mongoose.Types.ObjectId(params.groupChatId.toString())}, 'users admin chatname messages',function(err, groupChat){
                        if (err) return handleError(err, 'database');
                        else{
                            for (var i = groupChat.messages.length - 1; i >= 0; i--) {
                                if(groupChat.messages[i].seenBy.indexOf(params.username) < 0){
                                    groupChat.messages[i].seenBy.push(params.username);
                                }
                            }
                            return groupChat.save(function(err, groupChat){
                                if (err) return handleError(err, 'database');
                                else{
                                    return responseFn(groupChat);
                                }
                            });
                        }
                    });
                }
                else {
                    return responseFn({status: 'fail'});
                }
            }
            else{
                return responseFn('not authorized');
            }
        });
    });
    //Razvan
    socket.on('sendMessage', function(params, responseFn) {
        /*
            Received from client:
            params = {token, username, messageText, privateChatId || groupChatId}
            Response:
                emmiting the message to all the chat users 
                {privateChatId || groupChatId, message: {username, text, datetime, seenBy: []}}
        */
        return userTokens.forEach(function(item, index, array) {
            if (item.token === params.token && item.username === params.username) {

                var message = {
                    username: params.username,
                    text: params.text,
                    datetime: Date.now(),
                    seenBy: []
                };

                if (params.privateChatId) {
                    return PrivateChatSchema.findByIdAndUpdate(mongoose.Types.ObjectId(params.privateChatId.toString()), {$push: {'messages': message}}, function(err, privateChat){
                        if (err) return handleError(err, 'database');
                        else if(privateChat) {
                            io.sockets.in(params.privateChatId.toString()).emit('newMessage', {privateChatId: params.privateChatId, message: message});
                            return responseFn('success - message send');
                        }
                        else return responseFn('fail - not able to send message');
                    });
                }
                else if (params.groupChatId) {
                    return GroupChatSchema.findByIdAndUpdate(mongoose.Types.ObjectId(params.groupChatId.toString()), {$push: {'messages': message}}, function(err, groupChat){
                        if (err) return handleError(err, 'database');
                        else if(groupChat) {
                            io.sockets.in(params.groupChatId.toString()).emit('newMessage', {groupChatId: params.groupChatId, message: message});
                            return responseFn('success - message send');
                        }
                        else return responseFn('fail - not able to send message');
                    });
                }
                else {
                    return responseFn({status: 'fail - wrong chat id'});
                }
            }
            else{
                return responseFn('not authorized');
            }
        });
    });
    //Razvan
    // TO-DO Update the seenBy on the message
    socket.on('messageReceived', function(params, responseFn) {
        /*
            Received from client:
            params = {token, username, privateChatId || groupChatId, message}
            Response to client:
            Broadcast to clients: response = {privateChatId || groupChatId, message: {username, text, datetime, seenBy: []}}
        */
        return userTokens.forEach(function(item, index, array) {
            if (item.token === params.token && item.username === params.username) {

                params.message.seenBy.push(username);

                if (params.privateChatId) {
                    return PrivateChatSchema.findOne({ '_id' : mongoose.Types.ObjectId(params.privateChatId.toString()), 'messages.datetime': params.message.datetime}, 'messages.seenBy', function(err, privateChat){
                        if (err) return handleError(err, 'database');
                        else if(privateChat) {
                            console.log(privateChat);

                            //io.sockets.in(params.privateChatId.toString()).emit('messageSeenBy', {privateChatId: params.privateChatId, message: message});
                            return responseFn('success - message received');
                        }
                        else return responseFn('fail - not able to send message');
                    });
                }
                else if (params.groupChatId) {
                    return GroupChatSchema.findOne({ '_id' : mongoose.Types.ObjectId(params.privateChatId.toString()), 'messages.datetime': params.message.datetime}, 'messages.seenBy', function(err, groupChat){
                        if (err) return handleError(err, 'database');
                        else if(groupChat) {
                            console.log(groupChat);

                            //io.sockets.in(params.groupChatId.toString()).emit('newMessage', {groupChatId: params.groupChatId, message: message});
                            return responseFn('success - message received');
                        }
                        else return responseFn('fail - not able to send message');
                    });
                }
                else {
                    return responseFn({status: 'fail - wrong chat id'});
                }
            }
            else{
                return responseFn('not authorized');
            }
        });
    });
    //Razvan
    socket.on('addFriend', function(params, responseFn) {
        /*
            Received from client:
            params = { username, token, friend }
            Response to client:
            response = {username, privateChatId}
        */


        // check if request is valid (username + token)
        // checking if the friend exists
        // checking if user and friend are already friends
        // create a private chat
        // save private chat for the user
        // save private chat for the friend

        return userTokens.forEach(function(item, index, array) {
            if (item.token === params.token && item.username === params.username) {
                return UserSchema.findOne({'username' : params.friend}, 'username privateChats', function(err, friend){
                    if (err) return handleError(err, 'database');
                    else{
                        if(friend){ // if friend does not exist in the database
                            for (var i = friend.privateChats.length - 1; i >= 0; i--) {
                                 if (friend.privateChats[i].username === params.username){
                                    return responseFn('fail - you are already friends');
                                 }
                            };
                            var newPrivateChat = new PrivateChatSchema({
                                users: [params.username, friend.username],
                                messages: []
                            });
                            return newPrivateChat.save(function(err, createdPrivateChat){
                                if(err) return handleError(err, 'database');
                                else if(createdPrivateChat){
                                    var userFriendChat = {
                                        username: friend.username,
                                        privateChatId: createdPrivateChat._id
                                    };
                                    return UserSchema.update({'username': params.username}, {$push: {privateChats: userFriendChat}},function(err, hasUpdatedUser){
                                        if(err) return handleError(err, 'database');
                                        else if(hasUpdatedUser){
                                            userFriendChat.username = params.username;
                                            return UserSchema.update({'username': params.friend}, {$push: {privateChats: userFriendChat}},function(err, hasUpdatedFriend){
                                                if(err) return handleError(err, 'database');
                                                else if(hasUpdatedFriend){
                                                    socket.join(createdPrivateChat._id.toString());
                                                    //emmit to friend that you have connected join him to the room
                                                    return responseFn({username: params.friend, privateChatId: createdPrivateChat._id.toString()});   
                                                }
                                                else return responseFn('fail - unable to add to friend');
                                            });
                                        }
                                        else return responseFn('fail - unable to add friend');
                                    });
                                }
                                else return responseFn('fail - unable to create private chat');
                            });
                        }
                        else return responseFn('fail - user does not exists');
                    }
                })
            }
            else{
                return responseFn('not authorized');
            }
        });
    });
    //Razvan
    socket.on('confirmChatJoin', function(params, responseFn) {
        /*
            Received from client:
            params = {token, username, privateChatId || groupChatId}
            Response to client:
            response = success || fail
        */

        return userTokens.forEach(function(item, index, array) {
            if (item.token === params.token && item.username === params.username) {

                if (params.privateChatId) {
                    socket.join(params.privateChatId.toString());
                    return responseFn('success - joined privateChat');
                }
                else if (params.groupChatId) {
                    socket.join(params.groupChatId.toString());
                    io.sockets.in(params.groupChatId.toString()).emit('newUserJoined', {groupChatId: params.groupChatId, username: params.username});
                    return responseFn('success - joined groupChat');
                }
                else {
                    return responseFn({status: 'fail'});
                }
            }
            else{
                return responseFn('not authorized');
            }
        });
    });
    //Ruslans
    socket.on('deleteFriend', function(params, responseFn) {});
    //Ruslans
    socket.on('createGroupChat', function(params, responseFn) {});
    //Ruslans
    socket.on('deleteGroupChat', function(params, responseFn) {});
    //Razvan
    socket.on('addGroupUser', function(params, responseFn) {
        /*
            Received from client:
            params = {username, token, groupChatId, groupUser}
            Response to client:
            response = {success || fail}
        */

        return userTokens.forEach(function(item, index, array) {
            if (item.token === params.token && item.username === params.username) {
                return GroupChatSchema.findOne({ '_id' : mongoose.Types.ObjectId(params.groupChatId.toString())}, 'users chatname',function(err, groupChat){
                        if (err) return handleError(err, 'database');
                        else{
                            if(groupChat){
                                var groupUsers = groupChat.users;
                                if(groupUsers.indexOf(params.groupUser.toString()) < 0){
                                    return UserSchema.findOne({'username': params.groupUser.toString()}, 'groupChats', function(err, user){
                                        if(err) return handleError(err, 'database');
                                        else if(user){
                                            user.groupChats.push({chatname: groupChat.chatname, groupChatId: groupChat._id});
                                            user.save(function(err, updatedUser){
                                                if(err) return handleError(err, 'database');
                                                else{
                                                    groupUsers.push(params.groupUser.toString());
                                                    return GroupChatSchema.update({ '_id' : mongoose.Types.ObjectId(params.groupChatId.toString())}, {$set: { 'users' : groupUsers }}, function(err, hasUpdated){
                                                        if(err) return handleError(err, 'database');
                                                        else if(hasUpdated){
                                                            //TO-DO the broadcast has to be tested
                                                            socket.broadcast.to(groupChat._id.toString()).emit('newUserOnGroup', { groupChatId : groupChat._id.toString()});
                                                            return responseFn('success');
                                                        }
                                                        else{
                                                            return responseFn('fail - unable to update');
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                        else{
                                            return responseFn('fail - user not found!');
                                        }
                                    });
                                }
                                else{
                                    return responseFn('fail - user already in the group');
                                }
                            }
                            else return responseFn('fail - no group chat found');
                        }
                    });
            }
            else{
                return responseFn('not authorized');
            }
        });
    });
    //Ruslans
    socket.on('removeGroupUser', function(params, responseFn) {});
    //Razvan
    socket.on('disconnect', function(params, responseFn) {
        /*
            Received from client:
            params = {username, token}
            Response to client:
            success : 'ok'
        */
        userTokens.forEach(function(item, index, array) {
            if (item.token === params.token && item.username === params.username) {
                UserSchema.findOne({
                    'username': params.username
                }, '_id status', function(err, user) {
                    if (err) return handleError(err, 'database');
                    else {
                        UserSchema.update({
                            _id: user._id
                        }, {
                            $set: {
                                status: 'offline'
                            }
                        }, function(err, hasUpdated) {
                            if (err) return handleError(err, 'database');
                            else {
                                var userRooms = io.sockets.manager.roomClients[item.socket];
                                for (var i = userRooms.length - 1; i >= 0; i--) {
                                    socket.broadcast.to(userRooms[i].substring(1, userRooms[i].length)).emit('hasLeftChat', { username: params.username });
                                };
                                return responseFn({
                                    success: 'ok'
                                });
                            }
                        });
                    }
                });
                return array.splice(index, 1);
            }
        });
        return responseFn({
            success: 'fail'
        });
    });
});



function handleError(err, type) {
    switch (type) {
        case 'database':
            console.error('\nERROR (database): - ' + err);
            //log them in a file as well;
            break;
        case 'socket':
            console.error('\nERROR (socket): - ' + err);
            //log them in a file as well;
            break;
        case 'data':
            console.error('\nERROR (data): - ' + err);
            //log them in a file as well;
            break;
        default:
            console.error('\nERROR (other): - ' + err);
            //log them in a file as well;
            break;
    }
    return false;
}

function calcUnreadUserMsgs(username, callback) {
    var calculator = {
        map: function() {
            if (this.users.indexOf(username) < 0) return;
            if (this.messages.length < 1 || !this.messages) return;
            for (index in this.messages) {
                if (this.messages[index].seenBy.indexOf(username) < 0) emit(this._id, 1);
            }
        },
        reduce: function(previous, current) {
            var count = 0;
            for (index in current) count += current[index];
            return count;
        },
        scope: {
            username: username
        }
    };
    return PrivateChatSchema.mapReduce(calculator, function(err, privateChatResults) {
        if (err) return handleError(err, 'database');
        else {
            return GroupChatSchema.mapReduce(calculator, function(err, groupChatResults) {
                if (err) return handleError(err, 'database');
                else {
                    return callback({
                        privateChatsUnread: privateChatResults,
                        groupChatUnread: groupChatResults
                    });
                }
            });
        }
    });
}
console.log(" Listening on port %s !", SERVERPORT);
//var io = require('socket.io').listen(80);
// io.sockets.on('connection', function (socket) {
//   socket.join('justin bieber fans'); // put socket in a channel
//   socket.broadcast.to('justin bieber fans').emit('new fan'); // broadcast a message to a channel
//   io.sockets.in('rammstein fans').emit('new non-fan'); // to another channel
// });