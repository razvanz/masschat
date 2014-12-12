'use strict';

module.exports = {
  app: {
    title: 'MassCaht - all',
    description: 'descr',
    keywords: ''
  },
  mailer: {
    from: process.env.MAILER_FROM || 'MAILER_FROM',
    options: {
      service: process.env.MAILER_SERVICE_PROVIDER || 'MAILER_SERVICE_PROVIDER',
      auth: {
        user: process.env.MAILER_EMAIL_ID || 'MAILER_EMAIL_ID',
        pass: process.env.MAILER_PASSWORD || 'MAILER_PASSWORD'
      }
    }
  },
  port: process.env.PORT || 3000,
  templateEngine: 'swig',
  session: {
    secret: 'sure it\'s secret',
    collection: 'Sessions',
    cookie: {
      maxAge: 15 * 60000 // 15 min
    }
  },
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
