var io = require("socket.io"),
    connect = require("connect"),
    db = require('./database/db.js'),
    UserSchema = require('./database/schemas/user'),
    PrivateChatSchema = require('./database/schemas/privateChat'),
    GroupChatSchema = require('./database/schemas/groupChat');
var SERVERPORT = 7777;
var chatRoom = io.listen(connect().use(connect.static('public')).listen(SERVERPORT));
// keeping the user tokens in memory
var userTokens = [];


// chatRoom.sockets.on('connection', function(socket) {
//     socket.on('loadChat', function(params, responseFn) {
//         /*
//             Received from client:
//             params = {username, token}
//             Response to client:
//             profile = {username, token, status, privateChats, groupChats }    ||     "not authorized"
//         */
//         UserSchema.findOne({
//             'username': params.username
//         }, 'username token status privateChats groupChats', function(err, user) {
//             if (err) return handleError(err, 'database');
//             else {
//                 if (user.token === token) {
//                     //adding to cache
//                     userTokens.push({
//                         username: params.username,
//                         token: params.token,
//                         status: 'online',
//                         socket: socket
//                     });
//                     //logging when an user connects
//                     console.log('\n\n***********\n %s connected to chat!\n***********\n\n', params.username);
//                     // joining the user to it's groupChats / privateChats
//                     for (var i = 0; i < privateChats.length || i < groupChats.length; i++;) {
//                         if (i < privateChats.length) {
//                             socket.join(privateChats[i].privateChatId);
//                         }
//                         if (i < groupChats.length) {
//                             socket.join(groupChats[i].groupChatId);
//                         }
//                     }
//                     //TO-DO get friend statuses
//                     //responding with the user profile
//                     return responseFn({
//                         profile: user
//                     });
//                     /*  We will need to use the implementation below to also send the unread messages per chats*/
//                     // function respond(unreadMsgs){
//                     //     user.unreadMsgs = unreadMsgs;
//                     //     responseFn({profile : user});
//                     // }
//                     // calcUnreadUserMsgs(user.username, respond);
//                 }
//                 else {
//                     return responseFn('Not authorized!');
//                 }
//             }
//         });
//     });
//     socket.on('updateStatus', function(params, responseFn) {
//         /*
//             Received from client:
//             params = {username, token, status}
//             Response to client:
//             success : 'ok'
//         */
//         userTokens.forEach(function(item, index) {
//             if (item.token === params.token && item.username === params.username) {
//                 return UserSchema.findOne({
//                     'username': params.username
//                 }, '_id username status', function(err, user) {
//                     if (err) return handleError(err, 'database');
//                     else {
//                         UserSchema.update({
//                             _id: user._id
//                         }, {
//                             $set: {
//                                 status: params.status
//                             }
//                         }, function(err, updateResult) {
//                             if (err) return handleError(err, 'database');
//                             else {
//                                 item.status = params.status;
//                                 return responseFn({
//                                     success: 'ok'
//                                 });
//                             }
//                         });
//                     }
//                 });
//             }
//         });
//         return responseFn('Not authorized!');
//     });
//     socket.on('chatSelect', function(params, responseFn) {
//         /*
//             Received from client:
//             params = { type, token, username, ChatId[, username || [username] ]}
//             Response to client:
//             response = {type, users: [username], messages: [ username, text, datetime, seenBy: [username, username,...] ] [, chatName] }
//         */
//         userTokens.forEach(function(item, index, array) {
//             if (item.token === params.token && item.username === params.username) {
//                 if (params.type = 'private') {
//                     var response = {
//                         type: 'private'
//                     };
//                     UserSchema.findOne({
//                         'username': params.username
//                     }, 'privateChats', function(err, privateChats) {
//                         privateChats.forEach(function(item, index) {
//                             if (item.privateChatId == params.chatId) {
//                                 PrivateChatSchema.findOne({
//                                     '_id': privateChatId
//                                 }).exec(function(err, privateChat) {
//                                     if (err) return handleError(err, 'database');
//                                     else {
//                                         response.users = privateChat.users;
//                                         response.messages = privateChat.messages;
//                                         return responseFn(response);
//                                     }
//                                 });
//                             }
//                         });
//                     });
//                 }
//                 else if (params.type === 'group') {
//                     var response = {
//                         type: 'group'
//                     };
//                     UserSchema.findOne({
//                         'username': params.username
//                     }, 'groupChats', function(err, groupChats) {
//                         privateChats.forEach(function(item, index) {
//                             if (item.groupChatId == params.chatId) {
//                                 GroupChatSchema.findOne({
//                                     '_id': params.chatId
//                                 }).exec(function(err, groupChat) {
//                                     if (err) return handleError(err, 'database');
//                                     else {
//                                         response.users = groupChat.users;
//                                         response.chatName = groupChat.chatName;
//                                         response.messages = groupChat.messages;
//                                         return responseFn(response);
//                                     }
//                                 });
//                             }
//                         });
//                     });
//                 }
//             }
//         });
//     });
//     socket.on('sendMessage', function(params) {});
//     socket.on('receivedMessage', function(params, responseFn) {});
//     socket.on('addFriend', function(params, responseFn) {});
//     socket.on('createGroup', function(params, responseFn) {});
//     socket.on('removeFriend', function(params, responseFn) {});
//     socket.on('leaveGroup', function(params, responseFn) {});
//     socket.on('removeGroupUser', function(params, responseFn) {});
//     socket.on('addGroupUser', function(params, responseFn) {
//         /*
//             Received from client:
//             params = {username, token, groupId, groupUser}
//             Response to client:
//             response = {success || fail} 
//         */
//         for (var i = userTokens.length - 1; i >= 0; i--) {
//             if (userTokens[i].token === params.token && userTokens[i].username === params.username) {
//                 UserSchema.findOne({
//                     'username': params.username
//                 }).select('_id groupChats').exec(function(err, user) {
//                     if (err) return handleError(err, 'database');
//                     else {
//                         for (var i = user.groupChats.length - 1; i >= 0; i--) {
//                             if (user.groupChats[i].groupChatId === params.chatId) {
//                                 user.groupChats[i].users.push({
//                                     username: params.groupUser
//                                 });
//                                 return UserSchema.update({
//                                     '_id': user._id
//                                 }, {
//                                     $set: {
//                                         groupChats: user.groupChats
//                                     }
//                                 }, function(err, userUpdateResult) {
//                                     if (err) return handleError(err, 'database');
//                                     else {
//                                         UserSchema.findOne({
//                                             'username': params.groupUser
//                                         }).select('_id groupChats').exec(function(err, newGroupUser) {
//                                             if (err) return handleError(err, 'database');
//                                             else {
//                                                 for (var i = userTokens.length - 1; i >= 0; i--) {
//                                                     if (userTokens[i].username === params.groupUser) {
//                                                         userTokens[i].socket.join(params.chatId);
//                                                     }
//                                                 };
//                                                 newGroupUser.groupChats.push(user.groupChats[i]);
//                                                 return UserSchema.update({
//                                                     '_id': newGroupUser._id
//                                                 }, {
//                                                     $set: {
//                                                         groupChats: newGroupUser.groupChats
//                                                     }
//                                                 }, function(err, newGroupUserUpdateResult) {
//                                                     if (err) return handleError(err, 'database');
//                                                     else {
//                                                         return GroupChatSchema.update({
//                                                             '_id': user.groupChats[i].groupChatId
//                                                         }, {
//                                                             $set: {
//                                                                 'users': user.groupChats[i].users
//                                                             }
//                                                         }, function(err, groupChatsUpdateResult) {
//                                                             if (err) return handleError(err, 'database');
//                                                             else {
//                                                                 responseFn({
//                                                                     success: 'ok'
//                                                                 });
//                                                             }
//                                                         });
//                                                     }
//                                                 });
//                                             }
//                                         });
//                                     }
//                                 });
//                             }
//                         };
//                     }
//                 });
//             }
//             responseFn({
//                 success: 'fail'
//             });
//         };
//     });
//     socket.on('updateUsersStatus', function(params) {
//         /*
//             Received from client:
//             params = { username, token, users: [username, username, ... ]}
//             Response to client:
//             response = [{username, status}, {username, status}, ... ]
//         */
//         userTokens.forEach(function(item, index, array) {
//             // checking if the request comes from a valid user
//             if (item.token === params.token && item.username === params.username) {
//                 var response = {};
//                 // if a connected user exists in the requested list,
//                 // we add him to the response with his status (and remove him from the list - for performance)
//                 array.forEach(function(user) {
//                     var indexOfUser = params.users.indexOf(user.username);
//                     if (indexOfUser >= 0) {
//                         response.push({
//                             username: user.username,
//                             status: user.status
//                         });
//                         params.splice(indexOfUser, 1);
//                     }
//                 });
//                 // the rest of the users that have been requested and they are not connected,
//                 // we add them to the response with the status = 'offline'
//                 params.users.forEach(function(item, index) {
//                     response.push({
//                         username: item,
//                         status: 'offline'
//                     });
//                 });
//                 return socket.emit('updateMyUsersStatus', response);
//             }
//         });
//     });
//     socket.on('disconnect', function(params, responseFn) {
//         /*
//             Received from client:
//             params = {username, token}
//             Response to client:
//             success : 'ok'
//         */
//         userTokens.forEach(function(item, index, array) {
//             if (item.token === params.token && item.username === params.username) {
//                 UserSchema.findOne({
//                     'username': params.username
//                 }, '_id status', function(err, user) {
//                     if (err) return handleError(err, 'database');
//                     else {
//                         UserSchema.update({
//                             _id: user._id
//                         }, {
//                             $set: {
//                                 status: 'offline'
//                             }
//                         }, function(err, updateResult) {
//                             if (err) return handleError(err, 'database');
//                             else {
//                                 item.status = params.status;
//                                 return responseFn({
//                                     success: 'ok'
//                                 });
//                             }
//                         });
//                     }
//                 });
//                 return array.splice(index, 1);
//             }
//         });
//         return responseFn({
//             success: 'fail'
//         });
//     });
// });


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
    PrivateChatSchema.mapReduce(calculator, function(err, privateChatResults) {
        if (err) return handleError(err, 'database');
        else {
            GroupChatSchema.mapReduce(calculator, function(err, groupChatResults) {
                if (err) return handleError(err, 'database');
                else {
                    callback({
                        privateChatsUnread: privateChatResults,
                        groupChatUnred: groupChatResults
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