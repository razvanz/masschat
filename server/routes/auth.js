'use strict';

module.exports = function(app) {
  var auth = require('../controllers/auth');

  // Auth routes.
  app.route( '/login' ).get( auth.renderLogin ).post( auth.login );
  app.route( '/logout' ).post( auth.logout );

  app.route( '/recover' ).get( auth.renderRecover ).post( auth.recover );
  app.route( '/register' ).get( auth.renderRegister ).post( auth.register );

};
