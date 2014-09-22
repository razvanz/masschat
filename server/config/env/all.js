'use strict';

module.exports = {
  app: {
    title: 'MassCaht - all',
    description: 'descr',
    keywords: ''
  },
  port: process.env.PORT || 3000,
  templateEngine: 'swig',
  sessionSecret: 'very secret',
  sessionCollection: 'Sessions',
  cssRoot: 'client',
  jsRoot: 'client',
  assets: {
    lib: {
      css: [
              'client/styles/toaster.css'
            ],
      js: [
              'client/lib/angular.js', //angular must load first
              'client/lib/*.js'
            ]
    },
    css: [
            'client/styles/app.css'
        ],
    js: [
            'client/app/**/*.js'
        ]
  }
};
