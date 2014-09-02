'use strict';

var gulp = require('gulp'),
	connect = require('gulp-connect'),
	jshint = require('gulp-jshint'),
	sass = require('gulp-ruby-sass');

gulp.task('html', function(){
	gulp.src('./app/**/*.html')
		.pipe(connect.reload());
});

gulp.task('sass', function(){
	gulp.src('./app/styles/**/*.scss')
		.pipe(sass())
		.pipe(gulp.dest('./app/styles'))
		.pipe(connect.reload());
});

gulp.task('js', function(){
	gulp.src('./app/scripts/**/*.js')
		.pipe(jshint())
		.pipe(jshint.reporter('default'))
		.pipe(connect.reload());
});

gulp.task('serve', function(){
	connect.server({
		root: 'app',
		livereload: true
	});
});

gulp.task('watch', function(){
	gulp.watch('./app/**/*.html', ['html']);
	gulp.watch('./app/styles/**/*.scss', ['sass']);
	gulp.watch('./app/scripts/**/*.js', ['js']);
});

gulp.task('default', ['sass', 'js', 'serve', 'watch']);