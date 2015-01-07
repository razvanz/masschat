'use strict';

require('./server/config/init')();

var config = require('./server/config/config'),
  dbConfig = require('./server/config/database'),
  opbeat = require('./server/config/opbeat');

// Bootstrap db connection
// Start server only if we successfully connected to database
dbConfig(config.db, function(err) {
  if (err) {
    opbeat.captureError(err, {
      info: 'Cannot connect to MongoDB. Start-up failed!'
    });
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
    //   key: fs.readFileSync('./server/ssl/masschat.key'),
    //   cert: fs.readFileSync('./server/ssl/masschat.crt')
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
