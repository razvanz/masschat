var mongoose = require('mongoose');

var PrivateChatSumSchema = new Schema({
	username: {type: String},
	privateChatId: {type: String}
});

var UsersScheama = new Schema({
	username: {type: String}
});

var GroupChatSumSchema = new Schema({
	users: [UsersScheama],
	groupChatId: {type: String}
});

module.exports = mongoose.model('Users', {
	username: String,
	password: String,
	token: String,
	status: String,
	privateChats: [PrivateChatSumSchema],
	groupChats: [GroupChatSumSchema]
});