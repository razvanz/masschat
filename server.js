'use strict';

require('./server/config/init')();

var config = require('./server/config/config'),
  dbConfig = require('./server/config/database');

// Bootstrap db connection
// Start server only if we successfully connected to database
dbConfig(config.db, function (err) {
  if (err) {
    console.error('\x1b[31m%s\x1b[0m', 'Could not connect to MongoDB: [' + err +
      ']');
  } else {

    var http = require('http'),
      app, appServer;

    // Init the express application
    app = require('./server/config/express')();

    // Bootstrap passport config
    require('./server/auth/passport')();

    // HTTP

    appServer = http.createServer(app)
      .listen(config.port);

    // HTTPS
    //
    // var https = require('https'),
    //   fs = require('fs');
    // var httpsOptions = {
    //   key: fs.readFileSync('./server/ssl/privatekey.pem'),
    //   cert: fs.readFileSync('./server/ssl/certificate.pem')
    // };
    // appServer = https.createServer(httpsOptions, app)
    //   .listen(config.port);

    // Bind socket.io to the server
    require('./server/config/sockets')(appServer);

    // Logging initialization
    console.log('MassChat on port ' + config.port + '(' + process.env.NODE_ENV +
      ')');

    // Expose app
    module.exports = exports = app;

  }
});
