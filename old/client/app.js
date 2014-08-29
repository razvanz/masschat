Date.prototype.ourFormat = function(formatString) {
    var YYYY, YY, MMMM, MMM, MM, M, DDDD, DDD, DD, D, hhh, hh, h, mm, m, ss, s, ampm, AMPM, dMod, th;
    var dateObject = this;
    YY = ((YYYY = dateObject.getFullYear()) + "").slice(-2);
    MM = (M = dateObject.getMonth() + 1) < 10 ? ('0' + M) : M;
    MMM = (MMMM = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][M - 1]).substring(0, 3);
    DD = (D = dateObject.getDate()) < 10 ? ('0' + D) : D;
    DDD = (DDDD = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dateObject.getDay()]).substring(0, 3);
    th = (D >= 10 && D <= 20) ? 'th' : ((dMod = D % 10) == 1) ? 'st' : (dMod == 2) ? 'nd' : (dMod == 3) ? 'rd' : 'th';
    formatString = formatString.replace("#YYYY#", YYYY).replace("#YY#", YY).replace("#MMMM#", MMMM).replace("#MMM#", MMM).replace("#MM#", MM).replace("#M#", M).replace("#DDDD#", DDDD).replace("#DDD#", DDD).replace("#DD#", DD).replace("#D#", D).replace("#th#", th);
    h = (hhh = dateObject.getHours());
    if (h == 0) h = 24;
    if (h > 12) h -= 12;
    hh = h < 10 ? ('0' + h) : h;
    AMPM = (ampm = hhh < 12 ? 'am' : 'pm').toUpperCase();
    mm = (m = dateObject.getMinutes()) < 10 ? ('0' + m) : m;
    ss = (s = dateObject.getSeconds()) < 10 ? ('0' + s) : s;
    return formatString.replace("#hhh#", hhh).replace("#hh#", hh).replace("#h#", h).replace("#mm#", mm).replace("#m#", m).replace("#ss#", ss).replace("#s#", s).replace("#ampm#", ampm).replace("#AMPM#", AMPM);
};
$(document).ready(function() {
    // to be loaded at login
    var cookieVars = loadCookie();
    var username = cookieVars.username;
    var user_token = cookieVars.token;
    var user = ko.observable(undefined),
        activeChat = ko.observable(undefined),
        newFriendUsername = ko.observable('');
    activeChat.subscribe(function(newValue) {
        if (newValue !== undefined) {
            $('#send-message:hidden').slideToggle('slow');
        } else {
            $('#send-message:visible').slideToggle('slow');
        }
    });
    var setActiveChat = function(data, event) {
        function loadActiveChat(responseData) {
            if (responseData.result !== 'fail') {
                activeChat(ko.mapping.fromJS(responseData));
                $('#friend-chat-list li.active, #group-chat-list li.active').removeClass('active');
                $(event.currentTarget).addClass('active');
                for (var i = user().privateChats().length - 1; i >= 0; i--) {
                    if (user().privateChats()[i].privateChatId() === responseData._id) {
                        return user().privateChats()[i].unreadMsgNr(0);
                    }
                }
                for (var i = user().groupChats().length - 1; i >= 0; i--) {
                    if (user().groupChats()[i].groupChatId() === responseData._id) {
                        return user().groupChats()[i].unreadMsgNr(0);
                    }
                }
            }
        }
        if (data.groupChatId !== undefined) {
            socket.emit('chatSelect', {
                username: username,
                token: user_token,
                groupChatId: data.groupChatId()
            }, loadActiveChat);
        } else {
            socket.emit('chatSelect', {
                username: username,
                token: user_token,
                privateChatId: data.privateChatId()
            }, loadActiveChat);
        }
    };
    var createGroupChat = function() {
        function createGroupChatCallback(data) {
            if (data.result == 'fail') {
                $("#newGroupResult").text(data.message);
            } else {
                $('#new-group-name').val('');
                var newGroupChat = ko.mapping.fromJS(data);
                user().groupChats.push(newGroupChat);
                $('#createGroupModal').modal('hide');
            }
        }
        $("#newGroupResult").text('');
        var newChatName = $('#new-group-name').val();
        return socket.emit('createGroupChat', {
            username: username,
            token: user_token,
            chatname: newChatName
        }, createGroupChatCallback);
    };
    var addFriend = function() {
        function addFriendCallback(data) {
            if (data.result == 'fail') {
                $("#addFriendResult").text(data.message);
            } else {
                $('#friend-username').val('');
                var newFriendChat = ko.mapping.fromJS(data);
                user().privateChats.push(newFriendChat);
                $('#addFriendModal').modal('hide');
            }
        }
        $("#addFriendResult").text('');
        var friendName = $('#friend-username').val();
        return socket.emit('addFriend', {
            username: username,
            token: user_token,
            friend: friendName
        }, addFriendCallback);
    };
    var addGroupUser = function() {
        function addGroupUserCallback(data) {
            if (data.result === 'fail') {
                $('#addGroupUserMessage').text(data.message);
            } else {
                $('#addGroupUserModal').modal('hide');
                $('#new-group-user').val('');
            }
        }
        if (isGroupChat()) {
            $('#addGroupUserMessage').text('');
            var newGroupUser = $('#new-group-user').val();
            return socket.emit('addGroupUser', {
                username: username,
                token: user_token,
                groupChatId: activeChat()._id().toString(),
                groupUser: newGroupUser
            }, addGroupUserCallback);
        }
    }
    var removeUser = function(usernameToRemove) {
        function removeGroupUser(data) {
            if (data.result !== 'fail') {
                return console.log('Group user has been removed!');
            } else {
                return console.log('Unable to remove group user! \n' + data.message);
            }
        }
        if (isGroupChat()) {
            socket.emit('removeGroupUser', {
                username: username,
                token: user_token,
                groupChatId: activeChat()._id(),
                groupUser: usernameToRemove
            }, removeGroupUser);
        }
    }
    var sendMessage = function() {
        function sendMessageOutcome(data) {
            if (data.result == 'fail') {
                console.log('message not send because: %s!', data.message);
            } else if (data.result == 'success') {
                $('#msg-input').val('');
            }
        }
        var text = $('#msg-input').val();
        if (activeChat().chatname !== undefined) {
            socket.emit('sendMessage', {
                username: username,
                token: user_token,
                messageText: text,
                groupChatId: activeChat()._id()
            }, sendMessageOutcome);
        } else {
            socket.emit('sendMessage', {
                username: username,
                token: user_token,
                messageText: text,
                privateChatId: activeChat()._id()
            }, sendMessageOutcome);
        }
    }
    var deleteChat = function() {
        function deleteCallback(data) {
            if (data.result !== 'fail') {
                return console.log('Chat removed!');
            } else {
                return console.log('Unable to delete chat! \n' + data.message);
            }
        }
        if (isGroupChat()) {
            socket.emit('deleteGroupChat', {
                username: username,
                token: user_token,
                groupChatId: activeChat()._id()
            }, deleteCallback);
        } else {
            var friendName = '';
            for (var i = user().privateChats().length - 1; i >= 0; i--) {
                if (user().privateChats()[i].privateChatId() == activeChat()._id()) {
                    friendName = user().privateChats()[i].username();
                }
            };
            socket.emit('deleteFriend', {
                username: username,
                token: user_token,
                friend: friendName
            }, deleteCallback);
        }
    }
    var isGroupChat = ko.computed(function() {
        if (activeChat() !== undefined) {
            if (activeChat().chatname !== undefined) return true;
        }
        return false;
    });
    var chatModel = {
        user: user,
        activeChat: activeChat,
        addFriend: addFriend,
        deleteChat: deleteChat,
        isGroupChat: isGroupChat,
        addGroupUser: addGroupUser,
        removeUser: removeUser,
        setActiveChat: setActiveChat,
        createGroupChat: createGroupChat,
        sendMessage: sendMessage,
        newFriendUsername: newFriendUsername
    };
    var socket = io.connect("https://masschat2-c9-rusell.c9.io/");
    socket.on('newMessage', function(data) {
        newMessageReceived(data);
    });
    socket.on('messageSeenBy', function(data) {
        updateSeenMessage(data);
    });
    socket.on('userRemoved', function(data) {
        // data = {groupChatId, username}
        if (user().username() == data.username) {
            for (var i = user().groupChats().length - 1; i >= 0; i--) {
                if (user().groupChats()[i].groupChatId() == data.groupChatId) {
                    user().groupChats.splice(i, 1);
                    activeChat(undefined);
                    break;
                }
            };
        } else if (activeChat()){ 
            if (activeChat()._id() == data.groupChatId) {
                for (var i = activeChat().users().length - 1; i >= 0; i--) {
                    if (activeChat().users()[i] === data.username) {
                        activeChat().users.splice(i, 1);
                    }
                };
            }
        }
    });
    socket.on('newFriendship', function(data) {
        user().privateChats.push(ko.mapping.fromJS(data));
    });
    socket.on('privateChatDeleted', function(data) {
        // data = {privateChatId}
        for (var i = user().privateChats().length - 1; i >= 0; i--) {
            if (user().privateChats()[i].privateChatId() === data.privateChatId) {
                user().privateChats.splice(i, 1);
                break;
            }
        };
        if (activeChat()._id() == data.privateChatId) {
            activeChat(undefined);
        }
    });
    socket.on('groupChatRemoved', function(data) {
        // data = {groupChatId}
        for (var i = user().groupChats().length - 1; i >= 0; i--) {
            if (user().groupChats()[i].groupChatId() === data.groupChatId) {
                user().groupChats.splice(i, 1);
                break;
            }
        };
        if (activeChat()){
            if (activeChat()._id() == data.groupChatId) {
                activeChat(undefined);
            }
        }
    });
    socket.on('newUserOnGroup', function(data) {
        //data = {groupChatId, username, chatname}
        if (data.username == user().username()) {
            user().groupChats.push(ko.mapping.fromJS({
                chatname: data.chatname,
                groupChatId: data.groupChatId
            }));
        } else if (activeChat()){ 
            if (activeChat()._id() == data.groupChatId) {
                activeChat().users.push(data.username);
            }
        }
    });
    socket.on('hasLeftChat', function(data) {
        //data = {username} 
        if (user())
            for (var i = user().privateChats().length - 1; i >= 0; i--) {
                if (user().privateChats()[i].username === data.username) return user().privateChats()[i].status('offline');
            }
    });
    socket.on('hasJoinedChat', function(data) {
        //data = {groupChatId || privateChatId, username, status}
        if (user())
            for (var i = user().privateChats().length - 1; i >= 0; i--) {
                if (user().privateChats()[i].username === data.username) return user().privateChats()[i].status('online');
            }
    });
    socket.emit('loadChat', {
        username: username,
        token: user_token
    }, loadChat);

    function loadChat(data) {
        user(ko.mapping.fromJS(data));
        ko.applyBindings(chatModel);
    }

    function newMessageReceived(data) {
        if (data.privateChatId !== undefined) {
            if (activeChat()) {
                if (activeChat()._id() === data.privateChatId) {
                    socket.emit('messageReceived', {
                        username: username,
                        token: user_token,
                        privateChatId: data.privateChatId,
                        message: data.message
                    });
                    return activeChat().messages.push(ko.mapping.fromJS(data.message));
                }
            }
            for (var i = user().privateChats().length - 1; i >= 0; i--) {
                if (user().privateChats()[i].privateChatId === data.privateChatId) {
                    return user().privateChats()[i].unreadMsgNr(user().privateChats()[i].unreadMsgNr() + 1);
                }
            };
        } else if (data.groupChatId !== undefined) {
            if (activeChat()) {
                if (activeChat()._id() === data.groupChatId) {
                    socket.emit('messageReceived', {
                        username: username,
                        token: user_token,
                        groupChatId: data.groupChatId,
                        message: data.message
                    });
                    return activeChat().messages.push(ko.mapping.fromJS(data.message));
                }
            }
            for (var i = user().groupChats().length - 1; i >= 0; i--) {
                if (user().groupChats()[i].groupChatId === data.groupChatId) {
                    return user().groupChats()[i].unreadMsgNr(user().groupChats()[i].unreadMsgNr() + 1);
                }
            };
        }
    }

    function updateSeenMessage(data) {
        if (activeChat()._id() === data.privateChatId) {
            for (var i = activeChat().messages().length - 1; i >= 0; i--) {
                if (activeChat().messages()[i]._id === data.message._id) {
                    return activeChat().messages()[i].seenBy(data.message.seenBy);
                }
            };
        }
        if (activeChat()._id() === data.groupChatId) {
            for (var i = activeChat().messages().length - 1; i >= 0; i--) {
                if (activeChat().messages()[i]._id === data.message._id) {
                    return activeChat().messages()[i].seenBy(data.message.seenBy);
                }
            };
        }
    }
    window.onbeforeunload = closingCode;

    function closingCode() {
        return 'Are you sure you want to leave the chat?';
    };

    function loadCookie() {
        var cookieVars = document.cookie.split(';');
        var result = {};
        for (var i = cookieVars.length - 1; i >= 0; i--) {
            cookieVars[i] = cookieVars[i].replace(/\s+/g, '');
            result[cookieVars[i].substring(0, cookieVars[i].indexOf('='))] = cookieVars[i].substring(cookieVars[i].indexOf('=') + 1);
        };
        return result;
    }
});