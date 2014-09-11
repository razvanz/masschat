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
	useref = require('gulp-useref'),
	path = require('path');

var clientTestFiles = [
    	'temp/!(lib)/**/*.{js,html}'
		],
	clientTestLib = [
			'temp/lib/angular.js', // make sure angular loads first
			'temp/lib/*.*'
		];

var serverTestFiles = [
    'tests/server/**/*.js',
		'server/controllers/**/*.js',
		'server/models/**/*.js',
		'server/utils/**/*.js'
];

/*******************************************
 ******	Common
 *******************************************/
gulp.task('mongodb', shell.task([
	// 'mongo --eval "db.getSiblingDB(\'admin\').shutdownServer()"',
	'mongod --quiet --dbpath ./db'], {
	quiet: true
}));

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
	return gulp.src(bowerFiles({
			paths: {
				bowerDirectory: 'bower_components',
				bowerrc: '.bowerrc',
				bowerJson: 'bower.json'
			}
		}))
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
	return gulp.src(bowerFiles({
			paths: {
				bowerDirectory: 'bower_components',
				bowerrc: '.bowerrc',
				bowerJson: 'bower.json'
			}
		}))
		.pipe(filter('*.{js,css}'))
		.pipe(gulp.dest('temp/lib'));
});

gulp.task('jshint', function () {
	return gulp.src('client/app/**/*.js')
		.pipe(jshint())
		.pipe(jshint.reporter(require('jshint-stylish')))
		.pipe(size());
});

gulp.task('scripts', function () {
	return gulp.src('client/app/**/*.js')
		.pipe(gulp.dest('temp/scripts'))
		.pipe(size());
});

gulp.task('compile-client', ['scripts', 'bower-files', 'compile-less', 'html', 'fonts', 'images',
	'extras']);

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
			}, 3000);
		});
});

gulp.task('serve', ['demon'], function () {
	gulp.start('jshint');
});

gulp.task('watch', ['compile-client'], function () {
	// live reload the files
	gulp.watch('temp/**/*.*', function (event) {
		livereload.changed(event.path);
	});
	gulp.watch('client/app/**/*.html', ['html']);
	gulp.watch('client/content/styles/**/*.less', ['compile-less']);
	gulp.watch('client/app/**/*.js', ['jshint', 'scripts']);
	gulp.watch('client/content/images/**/*.*', ['images']);
	gulp.start(['mongodb', 'serve']);
});

/*******************************************
 ******	end Development
 *******************************************/


/*******************************************
 ******	Test
 *******************************************/
gulp.task('test-client', ['compile-client'], function (cb) {
	console.log('\n\n\tTEST CLIENT: \n');
	gulp.src(clientTestLib.concat(clientTestFiles))
		.pipe(karma({
			configFile: './karma.conf.js',
			action: 'run'
		}))
		.on('error', function (err) {
			logErr(err);
		})
		.on('finish', cb);
});

gulp.task('test-server', function (cb) {
	process.env.NODE_ENV = 'test';
	console.log('\n\n\tTEST SERVER: \n');
	gulp.src('server/**/*.js')
		.pipe(istanbul())
		.on('finish', function () {
			gulp.src(serverTestFiles)
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

gulp.task('chain-test', ['test-server'], function () {
	gulp.start(['test-client']);
});

gulp.task('test', ['chain-test']);


gulp.task('tdd-client', ['compile-client'], function (cb) {
	gulp.src(clientTestLib.concat(clientTestFiles))
		.pipe(karma({
			configFile: './karma.conf.js',
			action: 'watch'
		}))
		.on('error', function (err) {
			logErr(err);
		})
		.on('end', cb);
});

gulp.task('tdd-server', ['test-server'], function () {
	gulp.watch(serverTestFiles, ['test-server']);
});

gulp.task('chain-tdd', ['tdd-server'], function () {
	gulp.watch('client/app/**/*.html', ['html']);
	gulp.watch('client/app/**/*.js', ['jshint', 'scripts']);

	gulp.start(['tdd-client']);
});

gulp.task('tdd', function () {
	console.log('\n\n\t START TDD: \n');
	gulp.start(['chain-tdd']);
});

/*******************************************
 ******	end Test
 *******************************************/


/*******************************************
 ******	Production
 *******************************************/

gulp.task('build-styles', ['compile-less'], function () {
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
	return gulp.src('temp/layout/**/*.*')
		.pipe(gulp.dest('dist/layout'))
		.pipe(size());
});

gulp.task('build-fonts', ['fonts'], function () {
	return gulp.src('temp/fonts/**/*.*')
		.pipe(gulp.dest('dist/fonts'))
		.pipe(size());
});

gulp.task('build-images', ['images'], function () {
	return gulp.src('temp/images/**/*.*')
		.pipe(gulp.dest('dist/images'))
		.pipe(size());
});

gulp.task('build-extras', ['extras'], function () {
	return gulp.src('temp/extras/**/*.*')
		.pipe(gulp.dest('dist/extras'))
		.pipe(size());
});

gulp.task('build', ['build-styles', 'build-scripts', 'build-html', 'build-fonts', 'build-images',
	'build-extras']);

/*******************************************
 ******	end Production
 *******************************************/
function logErr(err) {
	console.error(err.toString());
}

function handleError(err) {
	console.log(err.toString());
	gulp.emit('end');
}
