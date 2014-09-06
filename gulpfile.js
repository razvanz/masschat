'use strict';

// Load gulp
var gulp = require('gulp');

// Load plugins
var autoprefixer = require('gulp-autoprefixer'),
	bowerFiles = require('main-bower-files'),
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
	shell = require('gulp-shell'),
	size = require('gulp-size'),
	tslint = require('gulp-tslint'),
	typescript = require('gulp-tsc'),
	uglify = require('gulp-uglify'),
	useref = require('gulp-useref');

var clientTestfiles = [
		'temp/lib/angular.js', // make sure angular loads first
		'temp/lib/*.*',
    'temp/scrips/*.js',
    'tests/client/**/*.js'
];

var serverTestfiles = [
    'tests/server/**/*.js',
    'server/controllers/**/*.js',
    'server/models/*.js',
    'server/utils/**/*.js'
];

/*******************************************
 ******	Common
 *******************************************/
gulp.task('mongodb', shell.task([
	// 'mongo --eval "db.getSiblingDB(\'admin\').shutdownServer()"',
	'mongod --dbpath ./db']));

gulp.task('clean', function () {
	return gulp.src(['dist', 'coverage', 'temp/*'], {
			read: false
		})
		.pipe(clean());
});

gulp.task('default', ['clean'], function () {
	gulp.start('build');
});

/*******************************************
 ******	end Common
 *******************************************/

/*******************************************
 ******	Development
 *******************************************/
gulp.task('compile-less', function () {
	return gulp.src('client/content/styles/app.less')
		.pipe(less())
		.pipe(autoprefixer('last 1 version'))
		.pipe(gulp.dest('temp/styles'))
		.pipe(size());
});

gulp.task('html', function () {
	return gulp.src('client/app/**/*.html')
		.pipe(gulp.dest('temp/layout'))
		.pipe(size());
});

gulp.task('images', function () {
	return gulp.src('client/content/images/**/*.*')
		.pipe(imagemin({
			optimizationLevel: 3,
			progressive: true,
			interlaced: true
		}))
		.pipe(gulp.dest('temp/images'))
		.pipe(size());
});

gulp.task('fonts', function () {
	return gulp.src(bowerFiles({ paths: {
			bowerDirectory: 'bower_components',
			bowerrc: '.bowerrc',
			bowerJson: 'bower.json'
		}}))
		.pipe(filter('**/*.{eot,svg,ttf,woff}'))
		.pipe(flatten())
		.pipe(gulp.dest('temp/fonts'))
		.pipe(size());
});

gulp.task('extras', function () {
	return gulp.src(['client/*.*', '!client/*.html'], {
			dot: true
		})
		.pipe(gulp.dest('temp/extras'));
});

gulp.task('bower-files', function () {
	return gulp.src(bowerFiles({ paths: {
			bowerDirectory: 'bower_components',
			bowerrc: '.bowerrc',
			bowerJson: 'bower.json'
		}}))
		.pipe(filter('*.{js,css,less}'))
		.pipe(gulp.dest('temp/lib'));
});

// inject bower components
gulp.task('wiredep', function () {
	var wiredep = require('wiredep')
		.stream;

	gulp.src('client/content/*.less')
		.pipe(wiredep({
			directory: 'temp/bower_components'
		}))
		.pipe(gulp.dest('client/content'));

	gulp.src('client/*.html')
		.pipe(wiredep({
			directory: 'temp/bower_components'
		}))
		.pipe(gulp.dest('temp'));
});

gulp.task('jshint', ['scripts'], function () {
	return gulp.src('temp/scripts/**/*.js')
		.pipe(jshint())
		.pipe(jshint.reporter(require('jshint-stylish')))
		.pipe(size());
});

gulp.task('styles', ['compile-less'], function () {
	return;
});

gulp.task('scripts', function () {
	return gulp.src('client/app/**/*.js')
		.pipe(gulp.dest('temp/scripts'))
		.pipe(size());
});

gulp.task('compile-client', ['scripts', 'bower-files', 'styles', 'html', 'fonts', 'images', 'extras']);

gulp.task('tdd-client', ['compile-client'], function () {
	gulp.src(clientTestfiles)
		.pipe(karma({
			configFile: './karma.conf.js',
			action: 'watch'
		}));
});

gulp.task('tdd-server', ['test-server'], function () {
	gulp.watch(serverTestfiles, ['test-server']);
});

gulp.task('connect', function () {
	nodemon({
		script: 'server.js',
		ext: 'js html',
		env: {
			'NODE_ENV': 'development'
		},
		watch: ['server/**/*.js']
	});
});

gulp.task('serve', ['connect', 'jshint'], function () {
	require('opn')('http://localhost:3000', 'google chrome');
});

gulp.task('watch', ['mongodb', 'serve', 'tdd-client', 'tdd-server'], function () {
	livereload.listen();
	// watch for changes
	gulp.watch([
				'client/**'
		])
		.on('change', livereload.changed);

	gulp.watch('client/content/**/*.less', ['styles']);
	gulp.watch('client/app/**/*.js', ['jshint']);
	gulp.watch('client/content/images/**/*.*', ['images']);
	gulp.watch('bower.json', ['wiredep']);

});

/*******************************************
 ******	end Development
 *******************************************/


/*******************************************
 ******	Test
 *******************************************/
gulp.task('test-client', ['compile-client'], function () {
	return gulp.src(clientTestfiles)
		.pipe(karma({
			configFile: './karma.conf.js',
			action: 'run'
		}))
		.on('error', function (err) {
			// Make sure failed tests cause gulp to exit non-zero
			throw err;
		});
});

gulp.task('test-server', function () {
	return gulp.src('server/**/*.js')
		.pipe(istanbul())
		.on('finish', function () {
			gulp.src(serverTestfiles)
				.pipe(jasmine({
					verbose: true
				}))
				.on('error', handleError)
				.pipe(istanbul.writeReports({
					dir: './coverage/server'
				})); // Creating the reports after tests runned
		});
});

gulp.task('test', ['mongodb', 'test-client', 'test-server']);

/*******************************************
 ******	end Test
 *******************************************/


/*******************************************
 ******	Production
 *******************************************/

gulp.task('build-styles', ['styles'], function () {
	return gulp.src('temp/styles/app.css')
		.pipe(csso())
		.pipe(gulp.dest('dist/styles'));
});

gulp.task('compress-js-app', ['scripts'], function () {
	return gulp.src('temp/scripts/**/*.js')
		.pipe(concat('app.js'))
		.pipe(uglify())
		.pipe(gulp.dest('dist/scripts'))
		.pipe(size());
});

gulp.task('compress-js-vendor', ['bower-files'], function () {
	return gulp.src('temp/lib/*.js')
		.pipe(concat('vendor.js'))
		.pipe(uglify())
		.pipe(gulp.dest('dist/scripts'))
		.pipe(size());
});

gulp.task('build-scripts', ['compress-js-app', 'compress-js-vendor'], function () {
	return;
});

gulp.task('build-html', ['html'], function () {
	return gulp.src('temp/layout/*.*')
		.pipe(gulp.dest('dist/fonts'))
		.pipe(size());
});

gulp.task('build-fonts', ['fonts'], function () {
	return gulp.src('temp/fonts/*.*')
		.pipe(gulp.dest('dist/fonts'))
		.pipe(size());
});

gulp.task('build-images', ['images'], function () {
	return gulp.src('temp/images/*.*')
		.pipe(gulp.dest('dist/images'))
		.pipe(size());
});

gulp.task('build-extras', ['extras'], function () {
	return gulp.src('temp/extras/*.*')
		.pipe(gulp.dest('dist/extras'))
		.pipe(size());
});

gulp.task('build', ['build-styles', 'build-scripts', 'build-html', 'build-fonts', 'build-images',
	'build-extras']);

/*******************************************
 ******	end Production
 *******************************************/

function handleError(err) {
	console.log(err.toString());
	gulp.emit('end');
}
