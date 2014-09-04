'use strict';

// Load gulp
var gulp = require('gulp');

// Load plugins
var autoprefixer = require('gulp-autoprefixer'),
    bowerFiles = require('gulp-bower-files'),
    cache = require('gulp-cache'),
    clean = require('gulp-clean'),
    csso = require('gulp-csso'),
    filter = require('gulp-filter'),
    flatten = require('gulp-flatten'),
    imagemin = require('gulp-imagemin'),
    istanbul = require('gulp-istanbul'),
    jasmine = require('gulp-jasmine'),
    jshint = require('gulp-jshint'),
    karma = require('gulp-karma'),
    less = require('gulp-less'),
    livereload = require('gulp-livereload'),
    concat = require('gulp-concat'),
    nodemon = require('gulp-nodemon'),
    size = require('gulp-size'),
    tslint = require('gulp-tslint'),
    typescript = require('gulp-tsc'),
    uglify = require('gulp-uglify'),
    useref = require('gulp-useref');

var vendorScripts = require('./server/config/env/all').assets.lib.js;

var clientTestfiles = [
    'client/bower_components/angular/angular.js',
    'client/bower_components/angular-ui-router/release/angular-ui-router.js',
    'client/bower_components/angular-sanitize/angular-sanitize.js',
    'client/bower_components/angular-resource/angular-resource.js',
    'client/bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
    'client/bower_components/angular-animate/angular-animate.js',
    'client/bower_components/angular-mocks/angular-mocks.js',
    'client/app/**/*.js',
    'tests/client/**/*.js'
];

var serverTestfiles = [
    'tests/server/**/*.js',
    'server/controllers/**/*.js',
    'server/models/*.js',
    'server/routes/*.js',
    'server/utils/**/*.js'
];

gulp.task('compile-less', function () {
    return gulp.src('client/content/app.less')
        .pipe(less())
        .pipe(autoprefixer('last 1 version'))
        .pipe(gulp.dest('client/content/styles'))
        .pipe(size());
});

gulp.task('compress-css', ['compile-less'],function() {
    return gulp.src('client/**/*.css')
        .pipe(csso())
        .pipe(gulp.dest('dist/styles'));

});

gulp.task('styles', ['compile-less', 'compress-css'], function() {});

gulp.task('styles', function() {
    return;
});

gulp.task('jshint', function() {
    return gulp.src('client/app/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter(require('jshint-stylish')))
        .pipe(size());
});

gulp.task('compress-js-app', ['jshint'], function() {
    return gulp.src('client/app/**/*.js')
        .pipe(concat('app.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist/scripts'))
        .pipe(size());
});

gulp.task('compress-js-vendor', function() {
    return gulp.src(vendorScripts)
        .pipe(concat('vendor.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist/scripts'))
        .pipe(size());
});

gulp.task('scripts', ['jshint', 'compress-js-app', 'compress-js-vendor'], function () {

});

gulp.task('html', ['styles', 'scripts'], function () {
    return gulp.src('client/**/*.html')
    .pipe(gulp.dest('dist'))
    .pipe(size());
});

gulp.task('images', function () {
    return gulp.src('client/content/images/**/*')
        .pipe(cache(imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest('dist/content/images'))
        .pipe(size());
});

gulp.task('fonts', function () {
    return bowerFiles()
        .pipe(filter('**/*.{eot,svg,ttf,woff}'))
        .pipe(flatten())
        .pipe(gulp.dest('dist/fonts'))
        .pipe(size());
});

gulp.task('extras', function () {
    return gulp.src(['client/*.*', '!client/*.html'], { dot: true })
        .pipe(gulp.dest('dist'));
});

gulp.task('test-client', function() {
    return gulp.src(clientTestfiles)
    .pipe(karma({
      configFile: 'karma.conf.js',
        action: 'run'
    }))
    .on('error', function(err) {
        // Make sure failed tests cause gulp to exit non-zero
        throw err;
    });
});

gulp.task('test-server', function() {
    return gulp.src('server/**/*.js')
    .pipe(istanbul())
    .on('finish', function () {
      gulp.src(serverTestfiles)
        .pipe(jasmine({verbose:true}))
        .on('error', handleError)
        .pipe(istanbul.writeReports({
            dir: './coverage/server'
        })); // Creating the reports after tests runned
    });
});

gulp.task('test', ['test-client', 'test-server']);

gulp.task('clean', function () {
    return gulp.src(['dist', 'coverage'], { read: false }).pipe(clean());
});

gulp.task('build', ['html', 'images', 'fonts', 'extras', 'test']);

gulp.task('default', ['clean'], function () {
    gulp.start('build');
});

gulp.task('connect', function () {
    nodemon({
        script: 'server.js',
        ext: 'js html',
        env: { 'NODE_ENV': 'development' },
        watch: ['server/**/*.js']
    });
});

gulp.task('mongodb', function(){
  require('child_process')
    .exec('mongod --dbpath ./db',
    function(err, stdout, stderr){
      if(err){
        handleError(err);
      }
      console.log(stdout);
      console.log(stderr);
    });
});

gulp.task('serve', ['connect', 'styles', 'fonts'], function () {
    require('opn')('http://localhost:3000', 'google chrome');
});

// inject bower components
gulp.task('wiredep', function () {
    var wiredep = require('wiredep').stream;

    gulp.src('client/content/*.less')
        .pipe(wiredep({
            directory: 'client/bower_components'
        }))
        .pipe(gulp.dest('client/content'));

    gulp.src('client/*.html')
        .pipe(wiredep({
            directory: 'client/bower_components'
        }))
        .pipe(gulp.dest('client'));
});

gulp.task('tdd-client', function() {
    gulp.src(clientTestfiles)
        .pipe(karma({
            configFile: 'karma.conf.js',
            action: 'watch'
    }));
});

gulp.task('tdd-server', ['test-server'], function() {
    gulp.watch(serverTestfiles, ['test-server']);
});

gulp.task('watch', ['mongodb', 'connect', 'serve', 'tdd-client', 'tdd-server'], function () {
    var server = livereload();
    // watch for changes
     gulp.watch([
        'client/**/*.html',
        'client/app/**/*.js',
        'client/content/images/**/*'
    ]).on('change', function (file) {
        server.changed(file.path);
    });

    gulp.watch('client/content/**/*.less', ['styles']);
    gulp.watch('client/app/**/*.js', ['jshint']);
    gulp.watch('client/content/images/**/*', ['images']);
    gulp.watch('bower.json', ['wiredep']);

});


function handleError(err) {
  console.log(err.toString());
  this.emit('end');
}
