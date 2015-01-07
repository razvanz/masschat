'use strict';

module.exports = function(app) {
  var auth = require('../controllers/auth'),
    globalBruteforce = require('../controllers/bruteforce').globalPrevent,
    userBruteForce = require('../controllers/bruteforce').userPrevent;

  // Auth routes.
  app.route('/login')
    .get(auth.renderLogin)
    .post(globalBruteforce.prevent, userBruteForce.getMiddleware({
      key: function(req, res, next) {
        next(req.body.username);
      }
    }), auth.login);
  app.route('/logout')
    .get(auth.logout);

  app.route('/recover')
    .get(auth.renderRecover)
    .post(globalBruteforce.prevent, userBruteForce.getMiddleware({
      key: function(req, res, next) {
        next(req.body.email);
      }
    }),auth.recover);
  app.route('/register')
    .get(auth.renderRegister)
    .post(auth.register);

};
