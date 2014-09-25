'use strict';

module.exports = {
  db: 'mongodb://localhost/masschat-test',
  port: process.env.PORT || 3001,
  app: {
    title: 'MassChat - test',
    description: 'descr',
    keywords: ''
  },
  files: {
    client: [
      './client/lib/angular.js',
      './client/lib/*.js',
      './client/app/**/*.js',
      'tests/client/**/*.spec.js'
    ],
    server: [
      './server/controllers/**/*.js',
      './server/models/**/*.js',
      './server/utils/**/*.js',
      'tests/server/**/*.spec.js'
    ],
    excludeClient: []
  }
};
