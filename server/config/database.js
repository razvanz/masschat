var mongoose = require('mongoose');
// Bootstrap db connection

GLOBAL.db = null;

module.exports = this.db = function (dbConfig, errBack) {
  if (!GLOBAL.db)
    GLOBAL.db = mongoose.connect(dbConfig, function (err) {
      if (err && !errBack && typeof errBack !== 'function') {
        throw new Error(err.toString());
      } else if (err && errBack && typeof errBack === 'function') {
        errBack(err);
      }
    });
  else {
    mongoose.connection.models = {};
  }
  return GLOBAL.db;
};
