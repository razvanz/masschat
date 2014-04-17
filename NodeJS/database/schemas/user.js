var mongoose = require('mongoose');

var ObjectId = mongoose.Schema.Types.ObjectId;

var PrivateChat = {
	username: {type: String},
	privateChatId: ObjectId
};

var GroupChat = {
	chatname : {type: String},
	groupChatId: ObjectId
};

module.exports = mongoose.model('User', {
	username: String,
	password: String,
	token: String,
	status: String,
	privateChats: [PrivateChat],
	groupChats: [GroupChat]
});