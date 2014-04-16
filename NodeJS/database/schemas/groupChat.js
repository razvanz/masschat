var mongoose = require('mongoose');


var UsersScheama = new Schema({
    username: {type: String}
});

var MessageSchema = new Schema({
    username: {type: String},
    text: {type: String},
    datetime: {type: Number},
    seenBy: [UsersScheama]
});

module.exports = mongoose.model('GroupChat', {
    users: [UsersScheama],
    admin: [UsersScheama],
    chatname: {type: String},
    messages: [MessageSchema]
});