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
    cssRoot: 'temp',
    jsRoot: 'temp',
    assets: {
        lib: {
            css: [
              // 'temp/lib/*.js',
              'temp/lib/toaster.css'
            ],
            js: [
              'temp/lib/angular.js', //angular must load first
              'temp/lib/*.js'
            ]
        },
        css: [
            'temp/styles/app.css'
        ],
        js: [
            'temp/scripts/**/*.js'
        ],
        tests: [
            'bower-components/angular-mocks/angular-mocks.js',
            'tests/client/**/*.js'
        ]
    }
};
