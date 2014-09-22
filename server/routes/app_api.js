'use strict';

module.exports = function (app) {
  var auth = require('../controllers/auth'),
    users = require('../controllers/app_api/users'),
    privateChats = require('../controllers/app_api/privateChats'),
    groupChats = require('../controllers/app_api/groupChats');

  // GET /app/entity/ — Gets all entities
  // GET /app/entity/1 — Gets the entity with ID 1
  // POST /app/entity/ — Creates a new entity
  // PUT /app/entity/1 — Update entity with ID 1
  // DELETE /app/entity/1 — Delete entity with ID 1

  app.route('/user')
    .get(auth.requiresLogin, users.list)
    .post(auth.requiresLogin, users.createUser);
  app.route('/user/:id')
    .get(auth.requiresLogin, users.userById)
    .put(auth.requiresLogin, users.updateUser)
    .delete(auth.requiresLogin, users.deleteUser);

  app.route('/privateChats')
    .get(auth.requiresLogin, privateChats.list)
    .post(auth.requiresLogin, privateChats.createChat);
  app.route('/privateChats/:id')
    .get(auth.requiresLogin, privateChats.chatById)
    .put(auth.requiresLogin, privateChats.updateChat)
    .delete(auth.requiresLogin, privateChats.deleteChat);

  // Complex
  app.route('/contacts')
    .get(auth.requiresLogin, privateChats.contactList);
  app.route('/groups')
    .get(auth.requiresLogin, groupChats.groupList);
  app.route('/lookupUser')
    .get(auth.requiresLogin, users.lookupUser);
};
