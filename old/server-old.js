var express =require('express'),
    app = express(),
    server = require('http').createServer(app),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    cons = require('consolidate'),
    bcrypt = require('bcrypt-nodejs'),
    crypto = require('crypto'),
    io = require("socket.io"),
    mongoose = require('mongoose'),
    db = require('./database/db.js'),
    UserSchema = require('./database/schemas/user'),
    PrivateChatSchema = require('./database/schemas/privateChat'),
    GroupChatSchema = require('./database/schemas/groupChat'),
    chatRoom = io.listen(server),
    SERVERPORT = process.env.PORT || 3000,
    userTokens = []; // save here the active users info {username, token, soketID}

/************************************************************************/
/************************************************************************/
/*****************************             ******************************/
/*****************************   EXPRESS   ******************************/
/*****************************             ******************************/
/************************************************************************/
/************************************************************************/
    
app.engine('html', cons.swig);
app.set('view engine', 'html');
app.set('views', __dirname + "/public");
app.use(express.static(__dirname + '/public'));
app.use(bodyParser());
app.use(cookieParser());

app.get('/', function (req, res) {
//request = req
//result = res
    res.render('main');
}); 

app.get('/chat', function (req, res) {
    if (!req.cookies.username || !req.cookies.token){
        return res.redirect('/login');
    }
    return res.render('chat');
});

app.get('/login', function (req, res) {
    res.render('login');
});

app.get('/register', function (req, res) {
   res.render('register'); 
});

app.get('*', function (req, res) {
    res.render('404');
});

app.post('/login', function (request, res) {
    var username = request.body.username;
    var password = request.body.password;

    if ((typeof username == 'undefined') || (typeof password == 'undefined')) {
        res.redirect('login');
    } else {
        //login process
        
        console.log("Looking for: " +username);
        
        UserSchema.findOne({username: username}, 'username password token', function(err, user){
            if (err) {
                handleError(err, 'database');
                res.render('login', { errors : err.message()});
            }
            else if(user){
                if (bcrypt.compareSync(password, user.password)) {
                    //generate token
                    var current_date = (new Date()).valueOf().toString();
                    var random = Math.random().toString();
                    // Insert session document
                    user.token = crypto.createHash('sha1').update(current_date + random).digest('hex');
                    user.save(function(err, updatedUser){
                        if(err) 
                            handleError(err, 'database', function(){ 
                                res.render('login', { errors : err.message()});
                            });
                        else if(updatedUser){
                            res.cookie('username', updatedUser.username);
                            res.cookie('token', updatedUser.token);
                            res.redirect('/chat');
                        }
                        else{
                            var token_not_saved = new Error("We had a problem. Please try again!");
                            handleError(token_not_saved, 'data');
                            res.render('login', { errors : token_not_saved});
                        }
                    });
                } else {
                    var invalid_password_error = new Error("Invalid password");
                    handleError(invalid_password_error, 'data');
                    res.render('login', { errors : invalid_password_error});
                }
            }
            else {
                    var no_such_user_error = new Error("User: " + username + " does not exist");
                    handleError(no_such_user_error, 'data');
                    res.render('login', { errors : no_such_user_error});
            }
        });
    }
});

app.post('/register', function (req, res) {
   
    function validateSignup(username, password, verify, errors) {
        "use strict";
        var USER_RE = /^[a-zA-Z0-9_-]{3,20}$/;
        var PASS_RE = /^.{3,20}$/;

        errors['username_error'] = "";
        errors['password_error'] = "";
        errors['verify_error'] = "";

        if (!USER_RE.test(username)) {
            errors['username_error'] = "invalid username. try just letters and numbers";
            return false;
        }
        if (!PASS_RE.test(password)) {
            errors['password_error'] = "invalid password.";
            return false;
        }
        if (password != verify) {
            errors['verify_error'] = "password must match";
            return false;
        }
        return true;
    }   

    var email = req.body.email
    var username = req.body.username
    var password = req.body.password
    var verify = req.body.verify

    // set these up in case we have an error case
    var errors = {'username': username};

    if (validateSignup(username, password, verify, errors)) {
        var salt = bcrypt.genSaltSync();
        var password_hash = bcrypt.hashSync(password, salt);
        var newuser = new UserSchema({
            username : username,
            password : password_hash,
            token: '',
            status: 'offline'
        });
        newuser.save(function(err, user) {
            "use strict";
            if (err) {
                handleError(err, 'database');
                // this was a duplicate
                if (err.code == '11000') {
                    errors['username_error'] = "Username already in use. Please choose another";
                    return res.render("/register", errors);
                }
                // this was a different error
                else {
                    return res.render("/register", { errors : new Error('Something unexpectedly happen! Please try again!')});;
                }
            }
            else{
                return res.redirect('/login');
            }
        });
    }
    else {
        handleError(new Error('user did not validate for register'), 'data');
        return res.render("/register", errors);
    }
    
});

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
                if (user.token == params.token) {
                    return calcUnreadUserMsgs(params.username, function respond(unreadMesseges) {
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
                                groupChatId: user.groupChats[i].groupChatId.toString()
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
                            chatRoom.sockets["in"](user.privateChats[i].privateChatId.toString()).emit('hasJoinedChat', {
                                groupChatId: user.privateChats[i].privateChatId.toString(),
                                username: params.username,
                                status: 'online'
                            });
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
                    return PrivateChatSchema.findOne({
                        '_id': mongoose.Types.ObjectId(params.privateChatId.toString())
                    }, 'users messages', function(err, privateChat) {
                        if (err) return handleError(err, 'database');
                        else if (privateChat) {
                            for (var i = privateChat.messages.length - 1; i >= 0; i--) {
                                if (privateChat.messages[i].seenBy.indexOf(params.username) < 0) {
                                    privateChat.messages[i].seenBy.push(params.username);
                                }
                                if (!privateChat.messages[i].text) {
                                    privateChat.messages[i].text = '';
                                }
                            }
                            return privateChat.save(function(err, privateChat) {
                                if (err) return handleError(err, 'database');
                                else {
                                    return responseFn(privateChat);
                                }
                            });
                        } else return responseFn({
                            result: 'fail',
                            message: 'Unable to find chat!'
                        });
                    });
                } else if (params.groupChatId) {
                    return GroupChatSchema.findOne({
                        '_id': mongoose.Types.ObjectId(params.groupChatId.toString())
                    }, 'users admin chatname messages', function(err, groupChat) {
                        if (err) return handleError(err, 'database');
                        else if (groupChat) {
                            for (var i = groupChat.messages.length - 1; i >= 0; i--) {
                                if (groupChat.messages[i].seenBy.indexOf(params.username) < 0) {
                                    groupChat.messages[i].seenBy.push(params.username);
                                }
                                if (!groupChat.messages[i].text) {
                                    groupChat.messages[i].text = '';
                                }
                            }
                            return groupChat.save(function(err, groupChat) {
                                if (err) return handleError(err, 'database');
                                else {
                                    return responseFn(groupChat);
                                }
                            });
                        } else return responseFn({
                            result: 'fail',
                            message: 'Unable to find chat!'
                        });
                    });
                } else {
                    return responseFn({
                        status: 'fail'
                    });
                }
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
                    text: params.messageText,
                    datetime: Date.now(),
                    seenBy: []
                };
                if (params.privateChatId) {
                    return PrivateChatSchema.findByIdAndUpdate(mongoose.Types.ObjectId(params.privateChatId.toString()), {
                        $push: {
                            'messages': message
                        }
                    }, function(err, privateChat) {
                        if (err) return handleError(err, 'database');
                        else if (privateChat) {
                            chatRoom.sockets["in"](params.privateChatId.toString()).emit('newMessage', {
                                privateChatId: params.privateChatId,
                                message: message
                            });
                            return responseFn({
                                result: 'success',
                                message: 'message send'
                            });
                        } else return responseFn({
                            result: 'fail',
                            message: 'server not able to send message!'
                        });
                    });
                } else if (params.groupChatId) {
                    return GroupChatSchema.findByIdAndUpdate(mongoose.Types.ObjectId(params.groupChatId.toString()), {
                        $push: {
                            'messages': message
                        }
                    }, function(err, groupChat) {
                        if (err) return handleError(err, 'database');
                        else if (groupChat) {
                            chatRoom.sockets["in"](params.groupChatId.toString()).emit('newMessage', {
                                groupChatId: params.groupChatId,
                                message: message
                            });
                            return responseFn({
                                result: 'success',
                                message: 'message send'
                            });
                        } else return responseFn({
                            result: 'fail',
                            message: 'server not able to send message!'
                        });
                    });
                } else {
                    return responseFn({
                        result: 'fail',
                        message: 'Chat to send message to is unknown!'
                    });
                }
            }
        });
    });
    //Razvan
    // TO-DO Update the seenBy on the message
    socket.on('messageReceived', function(params) {
        /*
            Received from client:
            params = {token, username, privateChatId || groupChatId, message}
            Response to client:
            Broadcast to clients: response = {privateChatId || groupChatId, message: {_id, seenBy: []}}
        */
        return userTokens.forEach(function(item, index, array) {
            if (item.token === params.token && item.username === params.username) {
                params.message.seenBy.push(params.username);
                if (params.privateChatId) {
                    return PrivateChatSchema.findOne({
                        '_id': mongoose.Types.ObjectId(params.privateChatId.toString()),
                        'messages.datetime': params.message.datetime
                    }, 'messages._id messages.seenBy', function(err, privateChat) {
                        if (err) return handleError(err, 'database');
                        else if (privateChat) {
                            for (var i = privateChat.messages.length - 1; i >= 0; i--) {
                                if (privateChat.messages[i]._id === params.message._id) {
                                    privateChat.messages[i].seenBy.push(params.username);
                                    return privateChat.save(function(err, updatedChat) {
                                        if (err) return handleError(err, 'database');
                                        else {
                                            chatRoom.sockets["in"](params.privateChatId.toString()).emit('messageSeenBy', {
                                                privateChatId: params.privateChatId,
                                                message: {
                                                    _id: privateChat.messages[i]._id,
                                                    seenBy: privateChat.messages[i].seenBy
                                                }
                                            });
                                            return true;
                                        }
                                    });
                                }
                            };
                        } else return false;
                    });
                } else if (params.groupChatId) {
                    return GroupChatSchema.findOne({
                        '_id': mongoose.Types.ObjectId(params.groupChatId.toString()),
                        'messages.datetime': params.message.datetime
                    }, 'messages._id messages.seenBy', function(err, groupChat) {
                        if (err) return handleError(err, 'database');
                        else if (groupChat) {
                            for (var i = groupChat.messages.length - 1; i >= 0; i--) {
                                if (groupChat.messages[i]._id === params.message._id) {
                                    groupChat.messages[i].seenBy.push(params.username);
                                    return groupChat.save(function(err, updatedChat) {
                                        if (err) return handleError(err, 'database');
                                        else {
                                            chatRoom.sockets["in"](params.groupChatId.toString()).emit('messageSeenBy', {
                                                groupChatId: params.groupChatId,
                                                message: {
                                                    _id: groupChat.messages[i]._id,
                                                    seenBy: groupChat.messages[i].seenBy
                                                }
                                            });
                                            return true;
                                        }
                                    });
                                }
                            };
                        } else return false;
                    });
                } else {
                    return false;
                }
            }
        });
    });
    //Razvan(tested)
    socket.on('addFriend', function(params, responseFn) {
        /*
            Received from client:
            params = { username, token, friend }
            Response to client:
            response = {username, ststus, unreadMsgNr, privateChatId}
        */
        // check if request is valid (username + token)
        // checking if the friend exists
        // checking if user and friend are already friends
        // create a private chat
        // save private chat for the user
        // save private chat for the friend
        return userTokens.forEach(function(item, index, array) {
            if (item.token === params.token && item.username === params.username) {
                return UserSchema.findOne({
                    'username': params.friend
                }, 'username privateChats', function(err, friend) {
                    if (err) return handleError(err, 'database');
                    else {
                        if (friend) { // if friend does not exist in the database
                            for (var i = friend.privateChats.length - 1; i >= 0; i--) {
                                if (friend.privateChats[i].username === params.username) {
                                    return responseFn({
                                        result: 'fail',
                                        message: 'You are already friends!'
                                    });
                                }
                            }
                            var newPrivateChat = new PrivateChatSchema({
                                users: [params.username, friend.username],
                                messages: []
                            });
                            return newPrivateChat.save(function(err, createdPrivateChat) {
                                if (err) return handleError(err, 'database');
                                else if (createdPrivateChat) {
                                    var userFriendChat = {
                                        username: friend.username,
                                        privateChatId: createdPrivateChat._id
                                    };
                                    return UserSchema.update({
                                        'username': params.username
                                    }, {
                                        $push: {
                                            privateChats: userFriendChat
                                        }
                                    }, function(err, hasUpdatedUser) {
                                        if (err) return handleError(err, 'database');
                                        else if (hasUpdatedUser) {
                                            userFriendChat.username = params.username;
                                            return UserSchema.update({
                                                'username': params.friend
                                            }, {
                                                $push: {
                                                    privateChats: userFriendChat
                                                }
                                            }, function(err, hasUpdatedFriend) {
                                                if (err) return handleError(err, 'database');
                                                else if (hasUpdatedFriend) {
                                                    socket.join(createdPrivateChat._id.toString());
                                                    var friendSocket = getUserSocket(params.friend);
                                                    if (friendSocket) {
                                                        friendSocket.join(createdPrivateChat._id.toString());
                                                        friendSocket.emit('newFriendship', {
                                                            username: params.username,
                                                            unreadMsgNr: 0,
                                                            status: 'online',
                                                            privateChatId: createdPrivateChat._id.toString()
                                                        });
                                                    }
                                                    return responseFn({
                                                        username: params.friend,
                                                        unreadMsgNr: 0,
                                                        status: getUserStatus(params.friend),
                                                        privateChatId: createdPrivateChat._id.toString()
                                                    });
                                                } else return responseFn({
                                                    result: 'fail',
                                                    message: 'Unable to add friend'
                                                });
                                            });
                                        } else return responseFn({
                                            result: 'fail',
                                            message: 'Unable to add friend'
                                        });
                                    });
                                } else return responseFn({
                                    result: 'fail',
                                    message: 'Unable to create private chat'
                                });
                            });
                        } else return responseFn({
                            result: 'fail',
                            message: 'User does not exist'
                        });
                    }
                });
            }
        });
    });
    //Razvan(tested)
    socket.on('deleteFriend', function(params, responseFn) {
        /*
            Received from client:
            params = { username, token, friend }
            Response to client:
            response = {result: success|| fail [, message]}
        */
        // check if request is valid (username + token)
        // checking if the friend exists
        // check if friend has a private chat with the user
        // remove private chat on friend
        // check if user has a private chat with the friend
        // remove private chat on user
        // remove private chat
        return userTokens.forEach(function(item, index, array) {
            if (item.token === params.token && item.username === params.username) {
                return UserSchema.findOne({
                    'username': params.friend
                }, 'username privateChats', function(err, friend) {
                    if (err) return handleError(err, 'database');
                    else if (friend) { // if friend does not exist in the database
                        for (var i = friend.privateChats.length - 1; i >= 0; i--) {
                            if (friend.privateChats[i].username === params.username) {
                                var chatID = friend.privateChats[i].privateChatId.toString();
                                friend.privateChats.splice(i, 1);
                                friend.save(function(err, updatedFriend) {
                                    if (err) return handleError(err, 'database', responseFn);
                                    else {
                                        return UserSchema.findOne({
                                            'username': params.username
                                        }, 'username privateChats', function(err, user) {
                                            for (var i = user.privateChats.length - 1; i >= 0; i--) {
                                                if (user.privateChats[i].username == params.friend) {
                                                    user.privateChats.splice(i, 1);
                                                    user.save(function(err, updatedUser) {
                                                        if (err) return handleError(err, 'database', responseFn);
                                                        else {
                                                            return PrivateChatSchema.findByIdAndRemove({
                                                                _id: mongoose.Types.ObjectId(chatID)
                                                            }, function(err, removedChat) {
                                                                if (err) return handleError(err, 'database', responseFn);
                                                                else {
                                                                    chatRoom.sockets["in"](removedChat._id.toString()).emit('privateChatDeleted', {
                                                                        privateChatId: removedChat._id.toString(),
                                                                    });
                                                                    socket.leave(removedChat._id.toString());
                                                                    var friendSocket = getUserSocket(params.friend);
                                                                    if (friendSocket) {
                                                                        friendSocket.leave(removedChat._id.toString());
                                                                    }
                                                                    return responseFn({
                                                                        result: 'success'
                                                                    });
                                                                }
                                                            });
                                                        }
                                                    });
                                                }
                                            };
                                        });
                                    }
                                });
                            }
                        }
                    } else return responseFn({
                        result: 'fail',
                        message: 'Friend does not exist'
                    });
                });
            }
        });
    });
    //Razvan (tested)
    socket.on('createGroupChat', function(params, responseFn) {
        /*
            Received from client:
            params = { username, token, chatname }
            Response to client:
            response = { chatname, groupChatId, unreadMsgNr }
        */
        return userTokens.forEach(function(item, index, array) {
            if (item.token === params.token && item.username === params.username) {
                var newGroupChat = new GroupChatSchema({
                    users: [params.username],
                    admin: [params.username],
                    chatname: params.chatname,
                    messages: []
                });
                newGroupChat.save(function(err, savedGroupChat) {
                    if (err) return handleError(err, 'database', responseFn);
                    else if (savedGroupChat) {
                        var userGroupChat = {
                            chatname: savedGroupChat.chatname,
                            groupChatId: savedGroupChat._id.toString()
                        }
                        UserSchema.update({
                            username: params.username
                        }, {
                            $push: {
                                groupChats: userGroupChat
                            }
                        }, function(err, hasUpdated) {
                            if (err) return handleError(err, 'database', responseFn);
                            else if (hasUpdated) {
                                socket.join(savedGroupChat._id.toString());
                                return responseFn({
                                    chatname: savedGroupChat.chatname,
                                    groupChatId: savedGroupChat._id.toString(),
                                    unreadMsgNr: 0
                                });
                            } else return responseFn({
                                result: 'fail',
                                message: 'Unable to add user to group chat'
                            });
                        });
                    } else return responseFn({
                        result: 'fail',
                        message: 'Unable to create group chat!'
                    });
                });
            }
        });
    });
    //Razvan(tested)
    socket.on('deleteGroupChat', function(params, responseFn) {
        /*
            Received from client:
            params = { username, token, groupChatId }
            Response to client:
            response = { chatname, groupChatId, unreadMsgNr }
        */
        return userTokens.forEach(function(item, index, array) {
            if (item.token === params.token && item.username === params.username) {
                return GroupChatSchema.findByIdAndRemove(mongoose.Types.ObjectId(params.groupChatId), function(err, groupChat) {
                    if (err) return handleError(err, 'database', responseFn);
                    else if (groupChat) {
                        var nrOfUsers = groupChat.users.length;
                        UserSchema.update({
                            'groupChats.groupChatId': groupChat._id.toString()
                        }, {
                            $pull: {
                                groupChats: {
                                    groupChatId: groupChat._id.toString()
                                }
                            }
                        }, {
                            multi: true
                        }, function(err, updates) {
                            if (err) return handleError(err, 'database', responseFn);
                            else if (updates === nrOfUsers) {
                                chatRoom.sockets["in"](groupChat._id.toString()).emit('groupChatRemoved', {
                                    groupChatId: groupChat._id.toString()
                                });
                                var groupUserSockets = chatRoom.sockets.clients('room');
                                if (groupUserSockets) {
                                    for (var i = groupUserSockets.length - 1; i >= 0; i--) {
                                        groupUserSockets[i].leave(groupChat._id.toString());
                                    }
                                }
                                return responseFn({
                                    result: 'success'
                                });
                            } else return responseFn({
                                result: 'fail',
                                message: 'Unable to update all users!'
                            });
                        });
                    } else return responseFn({
                        result: 'fail',
                        message: 'Unable to find group chat!'
                    });
                });
            }
        });
    });
    //Razvan(tested)
    socket.on('addGroupUser', function(params, responseFn) {
        /*
            Received from client:
            params = {username, token, groupChatId, groupUser}
            Response to client:
            response = {success || fail}
        */
        return userTokens.forEach(function(item, index, array) {
            if (item.token === params.token && item.username === params.username) {
                return GroupChatSchema.findOne({
                    '_id': mongoose.Types.ObjectId(params.groupChatId.toString())
                }, 'users chatname', function(err, groupChat) {
                    if (err) return handleError(err, 'database');
                    else {
                        if (groupChat) {
                            var groupUsers = groupChat.users;
                            if (groupUsers.indexOf(params.groupUser.toString()) < 0) {
                                return UserSchema.findOne({
                                    username: params.groupUser
                                }, 'groupChats', function(err, user) {
                                    if (err) return handleError(err, 'database');
                                    else if (user) {
                                        user.groupChats.push({
                                            chatname: groupChat.chatname,
                                            groupChatId: groupChat._id.toString()
                                        });
                                        user.save(function(err, updatedUser) {
                                            if (err) return handleError(err, 'database');
                                            else {
                                                groupChat.users.push(params.groupUser.toString());
                                                groupChat.save(function(err, updatedGroupChat) {
                                                    if (err) return handleError(err, 'database');
                                                    else if (updatedGroupChat) {
                                                        //TO-DO the broadcast has to be tested
                                                        var newUserSocket = getUserSocket(params.groupUser);
                                                        if (newUserSocket) {
                                                            newUserSocket.join(groupChat._id.toString());
                                                        }
                                                        chatRoom.sockets["in"](groupChat._id.toString()).emit('newUserOnGroup', {
                                                            groupChatId: groupChat._id.toString(),
                                                            username: params.groupUser
                                                        });
                                                        return responseFn({
                                                            result: 'success'
                                                        });
                                                    } else {
                                                        return responseFn({
                                                            result: 'fail',
                                                            message: 'unable to update'
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    } else {
                                        return responseFn({
                                            result: 'fail',
                                            message: 'Username is not registered!'
                                        });
                                    }
                                });
                            } else {
                                return responseFn({
                                    result: 'fail',
                                    message: 'User already in the group!'
                                });
                            }
                        } else return responseFn({
                            result: 'fail',
                            message: 'No group found!'
                        });
                    }
                });
            }
        });
    });
    //Razvan(tested)
    socket.on('removeGroupUser', function(params, responseFn) {
        /*
            Received from client:
            params = {username, token, groupChatId, groupUser}
            Response to client:
            response = {success || fail}
        */
        return userTokens.forEach(function(item, index, array) {
            if (item.token === params.token && item.username === params.username) {
                return UserSchema.findOne({
                    'username': params.groupUser
                }, function(err, user) {
                    if (err) {
                        return handleError(err, 'database', responseFn)
                    } else if (user) {
                        for (var i = user.groupChats.length - 1; i >= 0; i--) {
                            if (user.groupChats[i].groupChatId == params.groupChatId) {
                                user.groupChats.splice(i, 1);
                                return user.save(function(err, updatedUser) {
                                    if (err) return handleError(err, 'database', responseFn);
                                    else {
                                        return GroupChatSchema.findById(params.groupChatId, function(err, groupChat) {
                                            if (err) return handleError(err, 'database', responseFn);
                                            else if (groupChat) {
                                                for (var i = groupChat.users.length - 1; i >= 0; i--) {
                                                    if (groupChat.users[i] === params.groupUser) {
                                                        groupChat.users.splice(i, 1);
                                                        return groupChat.save(function(err, updatedChat) {
                                                            if (err) return handleError(err, 'database', responseFn);
                                                            else {
                                                                chatRoom.sockets["in"](groupChat._id.toString()).emit('userRemoved', {
                                                                    groupChatId: groupChat._id.toString(),
                                                                    username: params.groupUser
                                                                });
                                                                var groupUserSocket = getUserSocket(params.groupUser);
                                                                if (groupUserSocket) groupUserSocket.leave(groupChat._id.toString());
                                                                return responseFn({
                                                                    result: 'success',
                                                                    groupUser: params.groupUser
                                                                });
                                                            }
                                                        });
                                                    }
                                                }
                                            } else {
                                                return responseFn({
                                                    result: 'fail',
                                                    message: 'No chat found!'
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        }
                    } else {
                        return responseFn({
                            result: 'fail',
                            message: 'Please log in again!'
                        });
                    }
                });
            }
        });
    });
    //Razvan(to be tested)
    socket.on('disconnect', function() {
        /*
            Received from client:
            params = {username, token}
            Response to client:
            success : 'ok'
        */
        userTokens.forEach(function(item, index, array) {
            if (item.socket === socket.id) {
                UserSchema.findOne({
                    'username': item.username
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
                                var userRooms = chatRoom.sockets.manager.roomClients[socket.id]
                                if (userRooms) {
                                    for (var i = userRooms.length - 1; i >= 0; i--) {
                                        // to be tested
                                        socket.broadcast.to(userRooms[i].substring(1, userRooms[i].length)).emit('hasLeftChat', {
                                            username: item.username
                                        });
                                        socket.leave(userRooms[i].substring(1, userRooms[i].length));
                                    };
                                    return true;
                                } else {
                                    console.log('No rooms for user found');
                                    return false;
                                }
                            }
                        });
                    }
                });
                console.log('\n\n***********\n %s disconnect from chat!\n***********\n\n', item.username);
                return array.splice(index, 1);
            }
        });
    });
});

function handleError(err, type, callback) {
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
    if(callback)
    return callback({
        result: 'fail',
        message: 'Database Error'
    });
    else return false;
}

function calcUnreadUserMsgs(username, callback) {
    var calculator = {
        map: function() {
            if (this.users.indexOf(username) < 0) return;
            if (this.messages.length < 1 || !this.messages) return;
            for (var index in this.messages) {
                if (this.messages[index].seenBy.indexOf(username) < 0) emit(this._id, 1);
            }
        },
        reduce: function(previous, current) {
            var count = 0;
            for (var index in current) count += current[index];
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

function getUserStatus(username) {
    for (var i = userTokens.length - 1; i >= 0; i--) {
        if (userTokens[i].username === username) {
            return userTokens[i].status;
        }
    }
    return 'offline';
}

function getUserSocket(username) {
    for (var i = userTokens.length - 1; i >= 0; i--) {
        if (userTokens[i].username === username) {
            return chatRoom.sockets.socket(userTokens[i].socket);
        }
    }
    return null;
}

server.listen(SERVERPORT);
console.log("Express server started on port %s", SERVERPORT);