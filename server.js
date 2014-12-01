'use strict';
/**
 * Module dependencies.
 */

var https = require('https'),
	// http = require('http'),
	fs = require('fs'),
	db, app, appServer;

require('./server/config/init')();

var config = require('./server/config/config'),
	database = require('./server/config/database');
/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

// Bootstrap db connection
db = database(config.db, function (err) {
	if (err) {
		console.error('\x1b[31m%s\x1b[0m', 'Could not connect to MongoDB: [' + err + ']');
	}
});

// Init the express application
app = require('./server/config/express')(db);

// Bootstrap passport config
require('./server/auth/passport')();

// HTTP

// appServer = http.createServer(app)
// 	.listen(config.port);

// HTTPS

var httpsOptions = {
  key: fs.readFileSync('./server/ssl/masschat.key'),
  cert: fs.readFileSync('./server/ssl/masschat.crt')
};
appServer = https.createServer(httpsOptions, app).listen(config.port);

// Bind socket.io to the server
require('./server/config/sockets')(appServer);

// Logging initialization
console.log('MassChat on port ' + config.port + '(' + process.env.NODE_ENV + ')');

// Expose app
exports = module.exports = app;
