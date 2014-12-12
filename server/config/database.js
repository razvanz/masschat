'use strict';

var mongoose = require('mongoose'),
  sessionStoreCnstr = require('connect-mongo');

// Bootstrap db connection

module.exports = function (dbConfig, errBack) {
  mongoose.connect(dbConfig, function (err) {
    if (err && !errBack && typeof errBack !== 'function') {
      throw new Error(err.toString());
    } else if (err && errBack && typeof errBack === 'function') {
      errBack(err);
    } else {
      errBack(null);
    }
  });
};

module.exports.sessionStore = function (session, sessionConfig) {
  var MongoStore = sessionStoreCnstr({
    session: session
  });

  return new MongoStore({
    db: mongoose.connection.db,
    collection: sessionConfig.collection,
    cookie: sessionConfig.cookie
  });
};
