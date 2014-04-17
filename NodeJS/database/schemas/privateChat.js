var mongoose = require('mongoose');

var Message = {
    username: {type: String},
    text: {type: String},
    datetime: {type: Number},
    seenBy: [String]
};

module.exports = mongoose.model('PrivateChat', {
    users: [String],
    messages: [Message]
});