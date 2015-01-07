'use strict';

/**
 * Module dependencies.
 */
var bodyParser = require('body-parser'),
  compress = require('compression'),
  config = require('./config'),
  consolidate = require('consolidate'),
  cookieParser = require('cookie-parser'),
  csrf = require('csurf'),
  dbConfig = require('./database'),
  errorLogger = require('../utils/errorLogger'),
  opbeat = require('./opbeat'),
  express = require('express'),
  favicon = require('serve-favicon'),
  flash = require('connect-flash'),
  helmet = require('helmet'),
  methodOverride = require('method-override'),
  morgan = require('morgan'),
  multer = require('multer'),
  passport = require('passport'),
  path = require('path'),
  session = require('express-session');

module.exports = function() {
  // Initialize express app
  var app = express();

  // Globbing model files
  // config.getGlobbedFiles('./server/models/**/*.js').forEach(function(modelPath) {
  //     require(path.resolve(modelPath));
  // });

  // Setting application local variables
  app.locals.title = config.app.title;
  app.locals.description = config.app.description;
  app.locals.keywords = config.app.keywords;
  app.locals.jsFiles = config.getJavaScriptAssets();
  app.locals.cssFiles = config.getCSSAssets();

  // Favicon
  app.use(favicon(path.resolve('server/views/favicon.ico')));

  // Passing the request url to environment locals
  app.use(function(req, res, next) {
    res.locals.url = req.protocol + ':// ' + req.headers.host + req.url;
    next();
  });

  // Should be placed before express.static
  app.use(compress({
    filter: function(req, res) {
      return (/json|text|javascript|css/)
        .test(res.getHeader('Content-Type'));
    },
    level: 9
  }));

  // Showing stack errors
  app.set('showStackError', true);

  // Set swig as the template engine
  app.engine('html', consolidate[config.templateEngine]);

  // Set views path and view engine
  app.set('view engine', 'html');
  app.set('views', './server/views');

  // Environment dependent middleware
  if (process.env.NODE_ENV === 'development') {
    // Enable logger (morgan)
    app.use(morgan('dev'));

    app.use(express.static(path.resolve('./client')));

    // Disable views cache
    app.set('view cache', false);
  } else if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve('./dist')));
    app.locals.cache = 'memory';
  }

  // Request body parsing middleware should be above methodOverride
  app.use(bodyParser.urlencoded({
    extended: true,
    limit: '25mb'
  }));
  app.use(bodyParser.json({
    limit: '25mb'
  }));
  app.use(methodOverride());

  // Enable jsonp
  app.enable('jsonp callback');

  // CookieParser should be above session
  app.use(cookieParser());

  // Express MongoDB session storage
  app.use(session({
    secret: config.session.secret,
    saveUninitialized: true,
    rolling: true,
    resave: true,
    unset: 'destroy',
    store: dbConfig.sessionStore(session, config.session)
  }));

  // Cross-site request forgery
  app.use(csrf({
    value: function(req) {
      return (req.body && req.body._csrf) ||
        (req.query && req.query._csrf) ||
        (req.headers['x-csrf-token']) ||
        (req.headers['x-xsrf-token']);
    }
  }));

  app.use(function(req, res, next) {
    res.cookie('XSRF-TOKEN', req.csrfToken());
    next();
  });

  // form with files
  app.use(multer({
    dest: './temp/'
  }));

  // use passport session
  app.use(passport.initialize());
  app.use(passport.session());

  // connect flash for flash messages
  app.use(flash());

  // Use helmet to secure Express headers
  app.use(helmet.xframe('sameorigin'));
  app.use(helmet.xssFilter());
  app.use(helmet.nosniff());
  app.use(helmet.ienoopen());
  app.disable('x-powered-by');

  // Redirect to HTTPS
  // app.use(function(req, res, next) {
  //   if (!req.secure) {
  //     return res.redirect('https://' + req.get('host') + req.url);
  //   }
  //   next();
  // });

  // Globbing routing files
  config.getGlobbedFiles('./server/routes/*.js')
    .forEach(function(routePath) {
      require(path.resolve(routePath))(app);
    });

  app.use(errorLogger({
    errFileCount: 6,
    errFilePeriod: '1w',
    level: 'error',
    name: config.app.title,
    toFile: true,
    errFilePath: path.resolve('./logs/request-errs.log')
  }));

  app.use(opbeat.middleware.express());

  app.use(function(err, req, res, next) {
    res.status(err.statusCode || 500)
      .jsonp(err);
  });

  // Assume 404 since no middleware responded
  app.use(function(req, res) {
    res.status(404)
      .render('404', {
        url: req.originalUrl,
        error: 'Not Found'
      });
  });

  return app;
};
