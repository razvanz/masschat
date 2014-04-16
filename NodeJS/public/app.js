$(document).ready(function() {

	var user = ko.observable({
            username: ko.observable('razvan'),
            token: ko.observable('123123123'),
            status: ko.observable('active'),
            friendList: ko.observableArray([{
                username: ko.observable('Imaginary friend'),
                privateChatID: ko.observable('privatechatid'),
                newMsgNr: ko.observable(2)
            }]),
            groupChats: ko.observableArray([{
                groupname: ko.observable('The best group'),
                groupChatID: ko.observable('groupchatid'),
                newMsgNr: ko.observable(2)
            }])
        });

	var activeChat = ko.observable({
            users: ko.observableArray(["razvan", "Imaginary friend"]),
            messages: ko.observableArray([{
                username: "razvan",
                text: "hello there",
                datetime: ko.observable(new Date()),
                seenBy: ko.observableArray(["razvan"])
            }]),
            chatInfo: ko.observable({
                admins: ko.observableArray(["razvan"]),
                chatname: "Cool Chat"
            })
        });

	var testFunction = function(){
        	console.log("test test");
        };

    var setActiveChat = function(data){
    	console.log(data);
    }

    var ChatModel = {
        user: user,
        activeChat: activeChat,
        testFunction: testFunction,
        setActiveChat: setActiveChat
    };

    ko.applyBindings(ChatModel);

    var socket = io.connect("http://localhost:7777");
    socket.on("entrance", function (data) {
    	// sensorModel.value(data.value);
    	// sensorModel.status(data.status);
    	console.log(data);
    });
});