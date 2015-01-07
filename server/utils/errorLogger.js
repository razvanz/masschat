(function() {

  'use strict';

  var bunyan = require('bunyan'),
    defaults = {
      errFileCount: 3,
      errFilePath: __dirname + '/err.log.json',
      errFilePeriod: '1w',
      level: 'error',
      name: 'Application',
      request: true,
      toConsole: false,
      toFile: true,
      errSerializer: bunyan.stdSerializers.err,
      reqSerializer: function(req) {
        if (!req || !req.connection)
          return req;
        return {
          method: req.method,
          url: req.url,
          headers: req.headers,
          params: req.params,
          body: req.body,
          remoteAddress: req.connection.remoteAddress,
          remotePort: req.connection.remotePort
        };
      }
    };

  module.exports = exports = function(options) {
    var logger,
      loggerStreams = [];

    // config options
    options = options || {};
    options.name = 'name' in options ? options.name : defaults.name;
    options.level = 'level' in options ? options.level : defaults.level;
    options.request = 'request' in options ? options.request : defaults.request;
    options.toConsole = 'toConsole' in options ? options.toConsole :
      defaults.toConsole;
    options.toFile = 'toFile' in options ? options.toFile :
      defaults.toFile;

    if (options.toConsole)
      loggerStreams.push({
        level: options.level,
        stream: process.stdout
      });

    if (options.toFile)
      loggerStreams.push({
        level: options.level,
        path: options.errFilePath || defaults.errFilePath,
        period: options.errFilePeriod || defaults.errFilePeriod,
        count: options.errFileCount || defaults.errFileCount
      });

    logger = bunyan.createLogger({
      name: options.name,
      streams: loggerStreams,
      serializers: {
        req: options.reqSerializer || defaults.reqSerializer,
        err: options.errSerializer || defaults.errSerializer
      }
    });

    function configLog(err, req) {
      var log = {
        err: err
      };
      if (options.request) log.req = req;
      return log;
    }

    return function(err, req, res, next) {
      logger.error(configLog(err, req, res));
      next(err);
    };
  };

})();
