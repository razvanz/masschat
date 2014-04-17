var io = require("socket.io"),
    connect = require("connect"),
    mongoose = require('mongoose'),
    db = require('./database/db.js'),
    UserSchema = require('./database/schemas/user'),
    PrivateChatSchema = require('./database/schemas/privateChat'),
    GroupChatSchema = require('./database/schemas/groupChat');
var SERVERPORT = 7777;
var chatRoom = io.listen(connect().use(connect.static('public')).listen(SERVERPORT));
var userTokens = []; // save here the active users info {username, token, soketID}
// testLoadChat({username: 'razvan', token: '123456789'}, function(data){console.log(data);});
// function testLoadChat(params, responseFn){
// }
chatRoom.sockets.on('connection', function(socket) {
    // it is done
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
                    return PrivateChatSchema.findOne({ '_id' : mongoose.Types.ObjectId(params.privateChatId.toString())}, 'users, messages',function(err, privateChat){
                        if (err) return handleError(err, 'database');
                        else{
                            console.log(privateChat);
                            return responseFn(privateChat);
                        }
                    });
                }
                else if (params.groupChatId) {
                    return GroupChatSchema.findOne({ '_id' : mongoose.Types.ObjectId(params.groupChatId.toString())}, 'users, messages',function(err, groupChat){
                        if (err) return handleError(err, 'database');
                        else{
                            console.log(groupChat);
                            return responseFn(groupChat);
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
    socket.on('sendMessage', function(params) {});
    socket.on('receivedMessage', function(params, responseFn) {});
    socket.on('addFriend', function(params, responseFn) {});
    socket.on('createGroup', function(params, responseFn) {});
    socket.on('removeFriend', function(params, responseFn) {});
    socket.on('leaveGroup', function(params, responseFn) {});
    socket.on('removeGroupUser', function(params, responseFn) {});
    socket.on('addGroupUser', function(params, responseFn) {
        /*
            Received from client:
            params = {username, token, groupId, groupUser}
            Response to client:
            response = {success || fail}
        */
        for (var i = userTokens.length - 1; i >= 0; i--) {
            if (userTokens[i].token === params.token && userTokens[i].username === params.username) {
                UserSchema.findOne({
                    'username': params.username
                }).select('_id groupChats').exec(function(err, user) {
                    if (err) return handleError(err, 'database');
                    else {
                        for (var i = user.groupChats.length - 1; i >= 0; i--) {
                            if (user.groupChats[i].groupChatId === params.chatId) {
                                user.groupChats[i].users.push({
                                    username: params.groupUser
                                });
                                return UserSchema.update({
                                    '_id': user._id
                                }, {
                                    $set: {
                                        groupChats: user.groupChats
                                    }
                                }, function(err, userUpdateResult) {
                                    if (err) return handleError(err, 'database');
                                    else {
                                        UserSchema.findOne({
                                            'username': params.groupUser
                                        }).select('_id groupChats').exec(function(err, newGroupUser) {
                                            if (err) return handleError(err, 'database');
                                            else {
                                                for (var i = userTokens.length - 1; i >= 0; i--) {
                                                    if (userTokens[i].username === params.groupUser) {
                                                        userTokens[i].socket.join(params.chatId);
                                                    }
                                                };
                                                newGroupUser.groupChats.push(user.groupChats[i]);
                                                return UserSchema.update({
                                                    '_id': newGroupUser._id
                                                }, {
                                                    $set: {
                                                        groupChats: newGroupUser.groupChats
                                                    }
                                                }, function(err, newGroupUserUpdateResult) {
                                                    if (err) return handleError(err, 'database');
                                                    else {
                                                        return GroupChatSchema.update({
                                                            '_id': user.groupChats[i].groupChatId
                                                        }, {
                                                            $set: {
                                                                'users': user.groupChats[i].users
                                                            }
                                                        }, function(err, groupChatsUpdateResult) {
                                                            if (err) return handleError(err, 'database');
                                                            else {
                                                                responseFn({
                                                                    success: 'ok'
                                                                });
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        };
                    }
                });
            }
            responseFn({
                success: 'fail'
            });
        };
    });
    socket.on('updateUsersStatus', function(params) {
        /*
            Received from client:
            params = { username, token, users: [username, username, ... ]}
            Response to client:
            response = [{username, status}, {username, status}, ... ]
        */
        userTokens.forEach(function(item, index, array) {
            // checking if the request comes from a valid user
            if (item.token === params.token && item.username === params.username) {
                var response = {};
                // if a connected user exists in the requested list,
                // we add him to the response with his status (and remove him from the list - for performance)
                array.forEach(function(user) {
                    var indexOfUser = params.users.indexOf(user.username);
                    if (indexOfUser >= 0) {
                        response.push({
                            username: user.username,
                            status: user.status
                        });
                        params.splice(indexOfUser, 1);
                    }
                });
                // the rest of the users that have been requested and they are not connected,
                // we add them to the response with the status = 'offline'
                params.users.forEach(function(item, index) {
                    response.push({
                        username: item,
                        status: 'offline'
                    });
                });
                return socket.emit('updateMyUsersStatus', response);
            }
        });
    });
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
                        }, function(err, updateResult) {
                            if (err) return handleError(err, 'database');
                            else {
                                item.status = params.status;
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