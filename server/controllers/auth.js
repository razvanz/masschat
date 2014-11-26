'use strict';

var passport = require('passport'),
  SysLog = require('../models/sysLog'),
  Log = require('../models/log'),
  User = require('../models/user'),
  loginFailiures = {},
  // MINS5 = 60000;
  MINS5 = 300000;

exports.login = function (req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    if (err || !user) {
      registerLoginFail(req.cookies['connect.sid'],
        req.connection.remoteAddress);
      res.render('login', {
        loginErrors: [info.message]
      });
    } else {
      registerLoginSuccess(req.cookies['connect.sid'],
        req.connection.remoteAddress);
      req.login(user, function (err) {
        if (err) {
          res.render('login', {
            loginErrors: [err.message]
          });
          return next(err);
        }
        return res.redirect('/');
      });
    }
  })(req, res, next);
};

exports.logout = function (req, res) {
  SysLog.insert({
    user: req.user._id,
    sysLogType: 'logout',
    sysLogDesc: 'Successfull logout',
    sysLogData: null
  }, function (err) {
    if (err) console.log('System error: "Unable to create system log!"');
    req.logout();
    res.redirect('/');
  });
};

exports.getLogs = function (req, res) {
  SysLog.allWithOpts({
    user: req.user._id
  }, function (err, sysLogs) {
    if (!err)
      return Log.allWithOpts({
        user: req.user._id
      }, function (err, userLogs) {
        if (!err)
          return res.jsonp(sysLogs.concat(userLogs));
      });
    else {
      return res.send(500);
    }
  });
};

exports.requiresLogin = function (req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }
  next();
};

exports.me = function (req, res) {
  res.jsonp(req.user || null);
};

exports.renderLogin = function (req, res, next) {
  res.render('login');
};

exports.renderRegister = function (req, res) {
  res.render('register');
};

exports.renderRecover = function (req, res) {
  res.render('recover');
};

exports.register = function (req, res) {
  var newUser = req.body;
  newUser.provider = 'local';
  newUser.displayName = newUser.username;

  User.insert(newUser, function (err, user) {
    if (err) return res.render('register', {
      registerErrors: [err.message]
    });
    else if (!user) {
      return res.render('register', {
        registerErrors: [
        new Error('Something went wrong! Please try again!')]
      });
    } else {
      req.login(user, function (err) {
        if (err) {
          return res.render('login', {
            loginErrors: [err.message]
          });
        }
        return res.redirect('/');
      });
    }
  });
};

exports.recover = function (req, res) {
  res.render('login');
};




exports.preventBruteForce = function (req, res, next) {
  if (!blockBySession(req, res)) {
    if (!blockByIP(req, res)) {
      next();
    }
  }
};

function blockBySession(req, res) {
  var ipFail = loginFailiures[req.connection.remoteAddress];
  if (ipFail) {
    for (var i = ipFail.sessions.length - 1; i > -1; i--) {
      if (ipFail.sessions[i].sid === req.cookies['connect.sid']) {
        if (Date.now() < ipFail.sessions[i].nextTry) {
          res.render('login', {
            loginErrors: [
          'You have exceded the maximum login attempts. Please try after ' +
            new Date(ipFail.sessions[i].nextTry)
            .toUTCString() + '!']
          });
          return true;
        }
      }
    }
  }

  return false;
}

function blockByIP(req, res) {
  var ipFail = loginFailiures[req.connection.remoteAddress];

  if (ipFail && Date.now() < ipFail.nextTry) {
    res.render('login', {
      loginErrors: [
          'You have exceded the maximum login attempts. Please try after ' +
          new Date(ipFail.nextTry)
        .toUTCString() + '!']
    });
    return true;
  }

  return false;
}

function registerLoginFail(sid, ip) {
  if (loginFailiures[ip]) {

    var foundSession = false;

    for (var i = loginFailiures[ip].sessions.length - 1; i > -1; i--) {
      if (loginFailiures[ip].sessions[i].sid === sid) {
        foundSession = true;
        if (++loginFailiures[ip].sessions[i].count > 2) {
          loginFailiures[ip].sessions[i].nextTry = Date.now() + MINS5;
        }
      }
    }

    if (!foundSession) {
      loginFailiures[ip].sessions.push({
        sid: sid,
        count: 1,
        nextTry: Date.now()
      });
    }

    if (++loginFailiures[ip].count > 7) {
      loginFailiures[ip].nextTry = Date.now() + MINS5;
    }

  } else {
    loginFailiures[ip] = {
      sessions: [{
        sid: sid,
        count: 1,
        nextTry: Date.now()
      }],
      count: 1,
      nextTry: Date.now()
    };
  }
}

function registerLoginSuccess(sid, ip) {
  if (loginFailiures[ip]) {
    for (var i = loginFailiures[ip].sessions.length - 1; i > -1; i--) {
      if (loginFailiures[ip].sessions[i].sid === sid) {
        loginFailiures[ip].sessions.splice(i, 1);

        // balance the ip fails
        --loginFailiures[ip].count;
      }
    }
  }
}

// Clean up
setInterval(function () {
  for (var ip in loginFailiures) {
    for (var i = loginFailiures[ip].sessions.length - 1; i > -1; i--) {
      if (Date.now() - loginFailiures[ip].sessions[i].nextTry > MINS5) {
        loginFailiures[ip].sessions.splice(i, 1);
      }
    }

    if (!loginFailiures[ip].sessions.length && loginFailiures[ip].nextTry >
      MINS5) {
      delete loginFailiures[ip];
    }
  }

}, MINS5);
