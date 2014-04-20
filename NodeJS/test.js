var io = require("socket.io"),
    connect = require("connect"),
    mongoose = require('mongoose'),
    db = require('./database/db.js'),
    UserSchema = require('./database/schemas/user'),
    PrivateChatSchema = require('./database/schemas/privateChat'),
    GroupChatSchema = require('./database/schemas/groupChat');
    
function testCall() {    
    GroupChatSchema.findById("53528cf66137b80000cad052", function (err, doc) {
        if (err) console.log("Error: " + err);
        console.log(JSON.stringify(doc));
    });
}

console.log("Test: start");
testCall();
console.log("Test: done");