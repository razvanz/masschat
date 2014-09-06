'use strict';
/**
 * Module dependencies.
 */

var https = require('https');
var fs = require('fs');

require('./server/config/init')();

var config = require('./server/config/config'),
    mongoose = require('mongoose');
/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

// Bootstrap db connection
var db = mongoose.connect(config.db, function(err) {
	if (err) {
		console.error('\x1b[31m', 'Could not connect to MongoDB!');
		console.log(err);
	}
});

// Init the express application
var app = require('./server/config/express')(db);

// Bootstrap passport config
require('./server/auth/passport')();

// HTTP server to be redirected from

var io = require('./server/config/sockets.js')(app);

app.listen(config.port);
// var httpsOptions = {
//   key: fs.readFileSync('./server/ssl/privatekey.pem'),
//   cert: fs.readFileSync('./server/ssl/certificate.pem')
// };
//
// https.createServer(httpsOptions, app).listen(config.port);

// Expose app
exports = module.exports = app;

// Logging initialization
console.log('MassChat on port ' + config.port + '(' + process.env.NODE_ENV + ')');
