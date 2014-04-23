var mongoose = require('mongoose');

// var options = {
// 	db: 'masschat',
// 	user: '',
// 	password: ''
// };
// var uri = 'http://localhost:27017/';
// mongoose.connect(uri, options);

mongoose.connect('mongodb://localhost:27017/masschat');

//mongoose.connect('mongodb://test:masschat@ds035338.mongolab.com:35338/masschat');

module.exports = mongoose.connection;