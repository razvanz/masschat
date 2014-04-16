var mongoose = require('mongoose');

// var options = {
// 	db: 'masschat',
// 	user: '',
// 	password: ''
// };
// var uri = 'http://localhost:27017/';
// mongoose.connect(uri, options);

mongoose.connect('mongodb://localhost:27017/masschat');

module.exports = mongoose.connection;