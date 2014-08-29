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
    cssRoot: '.tmp/',
    jsRoot: 'client/',
    assets: {
        lib: {
            css: [],
            js: [
                'client/bower_components/es5-shim/es5-shim.min.js',
                'client/bower_components/respond/src/respond.js',
                'client/bower_components/angular/angular.js',
                'client/bower_components/angular-cookies/angular-cookies.js',
                'client/bower_components/ng-debounce/angular-debounce.js',
                'client/bower_components/angular-ui-router/release/angular-ui-router.js',
                'client/bower_components/angular-sanitize/angular-sanitize.js',
                'client/bower_components/angular-resource/angular-resource.js',
                'client/bower_components/angular-animate/angular-animate.js',
                'client/bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
                'client/bower_components/lodash/dist/lodash.js'
            ]
        },
        css: [
            '.tmp/styles/*.css'
        ],
        js: [
            'client/app/**/*.js'
        ],
        tests: [
            'client/bower-components/angular-mocks/angular-mocks.js',
            'tests/client/**/*.js'
        ]
    }
};
