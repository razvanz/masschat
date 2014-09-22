'use strict';

// Load gulp
var gulp = require('gulp');

// Load plugins
var autoprefixer = require('gulp-autoprefixer'),
  bowerFiles = require('main-bower-files'),
  concat = require('gulp-concat'),
  csso = require('gulp-csso'),
  flatten = require('gulp-flatten'),
  formatter = require('gulp-jsbeautifier'),
  imagemin = require('gulp-imagemin'),
  istanbul = require('gulp-istanbul'),
  jasmine = require('gulp-jasmine'),
  jshint = require('gulp-jshint'),
  karmaServer = require('karma')
  .server,
  less = require('gulp-less'),
  livereload = require('gulp-livereload'),
  nodemon = require('gulp-nodemon'),
  pngcrush = require('imagemin-pngcrush'),
  rimraf = require('gulp-rimraf'),
  runSequence = require('run-sequence'),
  shell = require('gulp-shell'),
  size = require('gulp-size'),
  testFiles = require('./server/config/env/test')
  .files,
  uglify = require('gulp-uglify');

/*******************************************
 ******	Development
 *******************************************/

gulp.task('jshint-client', function () {
  return gulp.src('./client/app/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter(require('jshint-stylish')))
    .pipe(size());
});

gulp.task('jshint-server', function () {
  return gulp.src('./server/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter(require('jshint-stylish')))
    .pipe(size());
});

gulp.task('jshint-tests', function () {
  return gulp.src('./tests/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter(require('jshint-stylish')))
    .pipe(size());
});

gulp.task('jshint', function (cb) {
  runSequence('jshint-client', 'jshint-server', 'jshint-tests', cb);
});

gulp.task('compile-less', function () {
  return gulp.src('./client/styles/app.less')
    .pipe(less())
    .pipe(autoprefixer('last 1 version'))
    .pipe(gulp.dest('./client/styles'))
    .pipe(size());
});

gulp.task('bower-scripts', function () {
  return gulp.src(bowerFiles({
      paths: {
        bowerDirectory: './bower_components',
        bowerrc: '.bowerrc',
        bowerJson: 'bower.json'
      },
      includeDev: true,
      filter: /\.js$/i
    }))
    .pipe(gulp.dest('./client/lib'));
});

gulp.task('bower-fonts', function () {
  return gulp.src(bowerFiles({
      paths: {
        bowerDirectory: './bower_components',
        bowerrc: '.bowerrc',
        bowerJson: 'bower.json'
      },
      includeDev: true,
      filter: /\.eot$|\.svg$|\.ttf$|\.woff$/i
    }))
    .pipe(gulp.dest('./client/fonts'));
});

gulp.task('bower-styles', function () {
  return gulp.src(bowerFiles({
      paths: {
        bowerDirectory: './bower_components',
        bowerrc: '.bowerrc',
        bowerJson: 'bower.json'
      },
      includeDev: true,
      filter: /\.css$/i
    }))
    .pipe(gulp.dest('./client/styles'));
});

gulp.task('bower-files', ['bower-fonts', 'bower-styles', 'bower-scripts']);

gulp.task('jshint-client', function () {
  return gulp.src('client/app/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter(require('jshint-stylish')))
    .pipe(size());
});

gulp.task('jshint-server', function () {
  return gulp.src('server/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter(require('jshint-stylish')))
    .pipe(size());
});

gulp.task('jshint', function (cb) {
  runSequence('jshint-client', 'jshint-server', cb);
});

gulp.task('demon', function () {
  return nodemon({
      script: 'server.js',
      ext: 'js html',
      env: {
        'NODE_ENV': 'development'
      },
      watch: 'server/**/*.js'
    })
    .on('config:update', function () {
      // start livereload
      livereload.listen();
      // Delay before open browser
      setTimeout(function () {
        require('opn')('http://localhost:3000', 'google chrome');
      }, 2000);
    });
});

gulp.task('serve', ['demon']);

gulp.task('watch', ['bower-files'], function () {
  // live reload the files
  gulp.watch(['./client/app/**/*.*'], function (event) {
    livereload.changed(event.path);
  });
  gulp.watch('client/styles/**/*.less', ['compile-less']);
  gulp.watch('client/app/**/*.js', ['jshint-client']);

  gulp.start(['mongodb', 'serve']);
});

/*******************************************
 ******	end Development
 *******************************************/

/*******************************************
 ******	Production
 *******************************************/

gulp.task('compress-css', ['compile-less'], function () {
  return gulp.src(['./client/styles/app.css', './client/styles/toaster.css'])
    .pipe(concat('app.css'))
    .pipe(csso())
    .pipe(gulp.dest('./dist/styles'));
});

gulp.task('compress-js-app', ['jshint-client'], function () {
  return gulp.src('./client/app/**/*.js')
    .pipe(concat('app.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./dist/app/scripts'))
    .pipe(size());
});

gulp.task('compress-js-vendor', function () {
  return gulp.src(bowerFiles({
      paths: {
        bowerDirectory: './bower_components',
        bowerrc: '.bowerrc',
        bowerJson: 'bower.json'
      },
      includeDev: false,
      filter: /\.js$/i
    }))
    .pipe(concat('vendor.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./dist/app/scripts'))
    .pipe(size());
});

gulp.task('html', function () {
  return gulp.src('./client/app/**/*.html')
    .pipe(gulp.dest('./dist/app'))
    .pipe(size());
});

gulp.task('fonts', function () {
  return gulp.src(bowerFiles({
      paths: {
        bowerDirectory: './bower_components',
        bowerrc: '.bowerrc',
        bowerJson: 'bower.json'
      },
      includeDev: false,
      filter: /\.eot$|\.svg$|\.ttf$|\.woff$/i
    }))
    .pipe(flatten())
    .pipe(gulp.dest('./dist/fonts'))
    .pipe(size());
});

gulp.task('images', function () {
  return gulp.src('./client/images/**/*.*')
    .pipe(imagemin({
      optimizationLevel: 5,
      progressive: true,
      interlaced: true,
      use: [pngcrush()]
    }))
    .pipe(gulp.dest('dist/images'))
    .pipe(size());
});

gulp.task('styles', ['compress-css']);

gulp.task('scripts', ['compress-js-app', 'compress-js-vendor']);

gulp.task('build', function (cb) {
  runSequence('scripts', 'styles', 'html', 'fonts', 'images', cb);
});

/*******************************************
 ******	end Production
 *******************************************/

/*******************************************
 ******	Test
 *******************************************/
gulp.task('test-client', ['bower-scripts'],function (cb) {
  console.log('\n\n\tTEST CLIENT: \n');
  karmaServer.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true,
    files: testFiles.client,
    exclude: testFiles.excludeClient
  }, cb);
});

gulp.task('test-server', function (cb) {
  process.env.NODE_ENV = 'test';
  console.log('\n\n\tTEST SERVER: \n');
  gulp.src('server/**/*.js')
    .pipe(istanbul())
    .on('finish', function () {
      gulp.src(testFiles.server)
        .pipe(jasmine({
          verbose: true
        }))
        .on('error', function (err) {
          logErr(err);
        })
        .pipe(istanbul.writeReports({
          dir: './coverage/server'
        })) // Creating the reports after tests runned
      .on('end', cb); //some issue with istambul
    });
});

gulp.task('test', function (cb) {
  runSequence('jshint', 'test-server', 'test-client', cb);
});

gulp.task('tdd-client', ['bower-scripts', 'jshint-client'], function (cb) {
  karmaServer.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: false,
    autoWatch: true,
    files: testFiles.client,
    exclude: testFiles.excludeClient
  }, cb);
});

gulp.task('tdd-server', ['jshint-server'], function () {
  gulp.watch(testFiles.server, ['test-server']);
  gulp.start(['test-server']);
});

gulp.task('tdd', function (cb) {
  console.log('\n\n\t START TDD: \n');
  gulp.watch('client/app/**/*.html', ['html']);
  gulp.watch('client/app/**/*.js', ['jshint', 'scripts']);

  runSequence('tdd-server', 'tdd-client', cb);
});

/*******************************************
 ******	end Test
 *******************************************/

/*******************************************
 ******	Common
 *******************************************/

gulp.task('clean', function () {
  return gulp.src(['dist', 'coverage', 'temp/*'], {
      read: false
    })
    .pipe(rimraf());
});

gulp.task('clean-all', function () {
  return gulp.src(['dist', 'coverage', 'temp/*', './bower_components',
      'node_modules'], {
      read: false
    })
    .pipe(rimraf());
});

gulp.task('default', ['clean'], function () {
  gulp.start('build');
});

gulp.task('format-client-js', function () {
  gulp.src(['./client/app/**/*.js'])
    .pipe(formatter({
      config: '.jsbeautifyrc',
      mode: 'VERIFY_AND_WRITE'
    }))
    .pipe(gulp.dest('./client/app'));
});

gulp.task('format-server-js', function () {
  gulp.src(['./server/**/*.js'])
    .pipe(formatter({
      config: '.jsbeautifyrc',
      mode: 'VERIFY_AND_WRITE'
    }))
    .pipe(gulp.dest('./server'));
});

gulp.task('format-tests-js', function () {
  gulp.src(['./tests/**/*.js'])
    .pipe(formatter({
      config: '.jsbeautifyrc',
      mode: 'VERIFY_AND_WRITE'
    }))
    .pipe(gulp.dest('./tests'));
});

gulp.task('format-client-html', function () {
  gulp.src(['./client/app/**/*.html'])
    .pipe(formatter({
      indentSize: 2
    }))
    .pipe(gulp.dest('./client/app'));
});

gulp.task('format-server-html', function () {
  gulp.src(['./server/views/*.html'])
    .pipe(formatter({
      indentSize: 2
    }))
    .pipe(gulp.dest('./server/views'));
});

gulp.task('format-js', ['format-client-js', 'format-server-js',
  'format-tests-js'
]);

gulp.task('format-html', ['format-client-html', 'format-server-html']);

gulp.task('format', ['format-js', 'format-html']);

gulp.task('mongodb', shell.task([
 // 'mongo --eval "db.getSiblingDB(\'admin\').shutdownServer()"',
 'mongod --quiet --dbpath ./db'], {
  quiet: true
}));

/*******************************************
 ******	end Common
 *******************************************/

function logErr(err) {
  console.error(err.toString());
}
