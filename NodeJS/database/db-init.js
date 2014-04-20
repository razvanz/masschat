// var db = require('./db.js');
var UserSchema = require('./schemas/user'),
    PrivateChatSchema = require('./schemas/privateChat'),
    GroupChatSchema = require('./schemas/groupChat');

var initDB = function() {
    var razvan = new UserSchema({
        username: 'razvan',
        password: '123456',
        token: '123456789',
        status: 'offline',
        privateChats: [],
        groupChats: []
    });
    razvan.save(function(err, razvanUser) {
        if (err) return handleError(err, 'database');
        else {
            console.log(razvanUser);
            var george = new UserSchema({
                username: 'george',
                password: '654321',
                token: '123123123',
                status: 'offline',
                privateChats: [],
                groupChats: []
            });
            return george.save(function(err, georgeUser) {
                if (err) return handleError(err, 'database');
                else {
                    console.log(georgeUser);
                    var ruslan = new UserSchema({
                        username: 'ruslan',
                        password: '123123',
                        token: '321321312',
                        status: 'offline',
                        privateChats: [],
                        groupChats: []
                    });
                    return ruslan.save(function(err, ruslanUser) {
                        if (err) return handleError(err, 'database');
                        else {
                            console.log(ruslanUser);
                            //creating private chats
                            var razvan_george = new PrivateChatSchema({
                                users: [razvanUser.username, georgeUser.username],
                                messages: [{
                                    username: razvanUser.username,
                                    text: 'hello George',
                                    datetime: Date.now(),
                                    seenBy: [razvanUser.username, georgeUser.username]
                                }, {
                                    username: georgeUser.username,
                                    text: 'hello razvan',
                                    datetime: Date.now(),
                                    seenBy: [georgeUser.username]
                                }, {
                                    username: georgeUser.username,
                                    text: 'hello razvan',
                                    datetime: Date.now(),
                                    seenBy: [georgeUser.username]
                                }, {
                                    username: georgeUser.username,
                                    text: 'hello razvan',
                                    datetime: Date.now(),
                                    seenBy: [georgeUser.username]
                                }, {
                                    username: georgeUser.username,
                                    text: 'hello razvan',
                                    datetime: Date.now(),
                                    seenBy: [georgeUser.username]
                                }]
                            });
                            return razvan_george.save(function(err, razvan_george_PrivateChat) {
                                if (err) return handleError(err, 'database');
                                else {
                                    console.log(razvan_george_PrivateChat);
                                    var r_privateChats = [];
                                    r_privateChats.push({
                                        username: georgeUser.username,
                                        privateChatId: razvan_george_PrivateChat._id
                                    });
                                    return UserSchema.update({
                                        '_id': razvanUser._id
                                    }, {
                                        $set: {
                                            'privateChats': r_privateChats
                                        }
                                    }, function(err, hasBeenUpdated) {
                                        if (err) return handleError(err, 'database');
                                        else {
                                            console.log('updated razvan user ?');
                                            console.log(hasBeenUpdated);
                                            var g_privateChats = [];
                                            g_privateChats.push({
                                                username: razvanUser.username,
                                                privateChatId: razvan_george_PrivateChat._id
                                            });
                                            return UserSchema.update({
                                                '_id': georgeUser._id
                                            }, {
                                                $set: {
                                                    'privateChats': g_privateChats
                                                }
                                            }, function(err, hasBeenUpdated) {
                                                if (err) return handleError(err, 'database');
                                                else {
                                                    console.log('updated george user ?');
                                                    console.log(hasBeenUpdated);
                                                    // create group chat
                                                    var razvan_george_ruslan = new GroupChatSchema({
                                                        users: [razvanUser.username, georgeUser.username, ruslanUser.username],
                                                        admin: [razvanUser.username],
                                                        chatname: 'Awesome Chat',
                                                        messages: [{
                                                            username: razvanUser.username,
                                                            text: 'hello George',
                                                            datetime: Date.now(),
                                                            seenBy: [razvanUser.username, georgeUser.username, ruslanUser.username]
                                                        }, {
                                                            username: georgeUser.username,
                                                            text: 'hello razvan',
                                                            datetime: Date.now(),
                                                            seenBy: [ruslanUser.username, georgeUser.username]
                                                        }, {
                                                            username: ruslanUser.username,
                                                            text: 'hello guys',
                                                            datetime: Date.now(),
                                                            seenBy: [ruslanUser.username]
                                                        }, {
                                                            username: ruslanUser.username,
                                                            text: 'what are you up to?',
                                                            datetime: Date.now(),
                                                            seenBy: [ruslanUser.username]
                                                        }, {
                                                            username: ruslanUser.username,
                                                            text: 'how is the project',
                                                            datetime: Date.now(),
                                                            seenBy: [ruslanUser.username]
                                                        }, {
                                                            username: ruslanUser.username,
                                                            text: 'why are you not answering',
                                                            datetime: Date.now(),
                                                            seenBy: [ruslanUser.username]
                                                        }, {
                                                            username: ruslanUser.username,
                                                            text: 'what\'s up?',
                                                            datetime: Date.now(),
                                                            seenBy: [ruslanUser.username]
                                                        }]
                                                    });
                                                    return razvan_george_ruslan.save(function(err, groupChat) {
                                                        if (err) return handleError(err, 'database');
                                                        else {
                                                            console.log(groupChat);
                                                            var r_groupChats = [];
                                                            r_groupChats.push({
                                                                chatname: groupChat.chatname,
                                                                groupChatId: groupChat._id
                                                            });
                                                            return UserSchema.update({
                                                                '_id': razvanUser._id
                                                            }, {
                                                                $set: {
                                                                    'groupChats': r_groupChats
                                                                }
                                                            }, function(err, hasBeenUpdated) {
                                                                if (err) return handleError(err, 'database');
                                                                else {
                                                                    console.log('second update razvan user ?');
                                                                    console.log(hasBeenUpdated);
                                                                    var g_groupChats = [];
                                                                    g_groupChats.push({
                                                                        chatname: groupChat.chatname,
                                                                        groupChatId: groupChat._id
                                                                    });
                                                                    return UserSchema.update({
                                                                        '_id': georgeUser._id
                                                                    }, {
                                                                        $set: {
                                                                            'groupChats': g_groupChats
                                                                        }
                                                                    }, function(err, hasBeenUpdated) {
                                                                        if (err) return handleError(err, 'database');
                                                                        else {
                                                                            console.log('second update george user ?');
                                                                            console.log(hasBeenUpdated);
                                                                            var ru_groupChats = [];
                                                                            ru_groupChats.push({
                                                                                chatname: groupChat.chatname,
                                                                                groupChatId: groupChat._id
                                                                            });
                                                                            return UserSchema.update({
                                                                                '_id': ruslanUser._id
                                                                            }, {
                                                                                $set: {
                                                                                    'groupChats': ru_groupChats
                                                                                }
                                                                            }, function(err, hasBeenUpdated) {
                                                                                if (err) return handleError(err, 'database');
                                                                                else {
                                                                                    console.log('updated ruslan user ?');
                                                                                    console.log(hasBeenUpdated);
                                                                                    console.log('\n\nFINISH\n\n');
                                                                                    return true;
                                                                                }
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
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
};

// initDB();
module.exports = initDB;