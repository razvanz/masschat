'use strict';

module.exports = function (app) {
  var root = require('../controllers/_root');

  // Root
  app.route('/')
    .get(root.index);

  // Initializing the client
  app.route('/initSession')
    .get(root.initSession);
};
