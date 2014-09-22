'use strict';

var config = require('../../../server/config/config'),
  database = require('../../../server/config/database')(config.db),
  User = require('../../../server/models/user');

describe('User Model', function () {
  var user = {
    username: 'test1',
    email: 'test@test.com',
    password: 'testPass',
    provider: 'local',
    displayName: 'Test-user'
  };
  beforeEach(function (done) {
    User.insert(user, done);
  });
  afterEach(function (done) {
    User.removeAll(done);
  });

  it('should query all the users', function (done) {
    User.all(function (err, theUsers) {
      expect(err)
        .toEqual(null);
      expect(theUsers.length)
        .toEqual(1);
      done();
    });
  });

  it('should query all the users based on criterias', function (done) {
    User.allWithOpts({
      provider: 'facebook'
    }, function (err, theUsers) {
      expect(err)
        .toEqual(null);
      expect(theUsers.length)
        .toEqual(0);
      done();
    });
  });

  it('should query one user', function (done) {
    User.one({
      username: user.username
    }, function (err, theUser) {
      expect(err)
        .toEqual(null);
      done();
    });
  });

  it('should query one the users based on criterias', function (done) {
    User.oneWithOpts({
      provider: 'facebook'
    }, function (err, theUser) {
      expect(err)
        .toEqual(null);
      expect(theUser)
        .toEqual(null);
      done();
    });
  });

  it('should give a hint of available usernames', function (done) {
    User.model.findUniqueUsername('test1', '', function (
      alternative) {
      expect(alternative)
        .not.toEqual(null);
      done();
    });
  });

  it('should authenticate users with right password', function (done) {
    User.oneWithOpts({
      username: user.username
    }, 'username password salt', null, function (err, theUser) {
      expect(theUser.authenticate(user.password))
        .toEqual(true);
      done();
    });
  });

  it('should not authenticate users with wrong password', function (done) {
    User.one({
      username: user.username
    }, function (err, theUser) {
      expect(theUser.authenticate(user.password + 'more'))
        .toEqual(false);
      done();
    });
  });

  it('should throw error if inserting a user with an existing username',
    function (done) {
      User.insert(user, function (err) {
        expect(err)
          .not.toEqual(null);
        // User.all(function(err, allU){
        // 	console.log(allU);
        done();
        // });
      });
    });

  it('should insert a new user', function (done) {
    var anotherUser = user;
    anotherUser.username = 'test2';

    User.insert(anotherUser, function (err, theUser) {
      expect(err)
        .toEqual(null);
      expect(theUser)
        .not.toEqual(undefined);
      done();
    });
  });

  it('should throw error if trying to update a nonexisting user', function (
    done) {
    User.update({
      username: 'not_there'
    }, {}, function (err, theUser) {
      expect(theUser)
        .toEqual(null);
      done();
    });
  });

  it('should update a user', function (done) {
    var update = {
      username: 'updated'
    };
    User.update({
      username: user.username
    }, update, function (err, updated) {
      expect(err)
        .toEqual(null);
      expect(updated.username)
        .toEqual(update.username);
      done();
    });
  });

  it('should throw error if trying to remove a nonexisting user', function (
    done) {
    User.remove({
      username: 'not_there'
    }, function (err, theUser) {
      expect(err)
        .not.toEqual(null);
      done();
    });
  });

  it('should remove a user', function (done) {
    User.remove({
      username: user.username
    }, function (err, theUser) {
      expect(err)
        .toEqual(null);
      done();
    });
  });

  it('should remove a user', function (done) {
    User.removeAll(function (err, data) {
      expect(data)
        .toEqual(true);
      done();
    });
  });

  // describe('it should do / second', function () {
  // 	var originalTimeout;
  //
  // 	beforeEach(function (done) {
  // 		// 1 second timeout
  // 		originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
  // 		jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000;
  // 		var auser = user;
  // 		auser.username = 'test2';
  // 		User.insert(auser, done);
  // 	});
  // 	afterEach(function (done) {
  // 		// timeout back
  // 		jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
  // 		User.removeAll(done);
  // 	});
  //
  // 	it('2000 get all queries', function (done) {
  // 		var err = null;
  // 		for (var i = 2000; i > 0; i--) {
  // 			User.all(function (err) {
  // 				err = err;
  // 			});
  // 		}
  // 		expect(err)
  // 			.toEqual(null);
  // 		done();
  // 	});
  //
  // 	it('2000 get one queries', function (done) {
  // 		var err = null;
  // 		for (var i = 2000; i > 0; i--) {
  // 			User.one({
  // 				username: user.username
  // 			}, function (err) {
  // 				err = err;
  // 			});
  // 		}
  // 		expect(err)
  // 			.toEqual(null);
  // 		done();
  // 	});
  //
  // 	it('5 insert queries', function (done) {
  // 		var err = null;
  // 		for (var i = 5; i > 0; i--) {
  // 			user.username = 'stress' + i;
  // 			User.insert(user, function (err) {
  // 				err = err;
  // 			});
  // 		}
  // 		expect(err)
  // 			.toEqual(null);
  // 		done();
  // 	});
  //
  // 	it('50 update queries without password update', function (done) {
  // 		var err = null;
  // 		for (var i = 50; i > 0; i--) {
  // 			User.update({
  // 				username: user.username
  // 			}, {
  // 				provider: 'test' + i
  // 			}, function (err) {
  // 				err = err;
  // 			});
  // 		}
  // 		expect(err)
  // 			.toEqual(null);
  // 		done();
  // 	});
  //
  // 	it('5 update queries with password update', function (done) {
  // 		var err = null;
  // 		for (var i = 5; i > 0; i--) {
  // 			User.update({
  // 				username: user.username
  // 			}, {
  // 				password: 'test_pass_update' + i
  // 			}, function (err) {
  // 				err = err;
  // 			});
  // 		}
  // 		expect(err).toEqual(null);
  // 		done();
  // 	});
  //
  //
  // });

});
