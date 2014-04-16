var io = require("socket.io"),
    connect = require("connect");
var SERVERPORT = 7777;
var chatRoom = io.listen(connect().use(connect.static('public')).listen(SERVERPORT));

chatRoom.sockets.on('connection', function(socket) {
    console.log(socket);
    chatRoom.sockets.emit('entrance', {
        message: " Someone has joined ! "
    });
});

console.log(" Listening on port " + SERVERPORT + " !");