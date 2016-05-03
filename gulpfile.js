// https://css-tricks.com/gulp-for-beginners/

var gulp = require('gulp'),
    minifycss = require('gulp-clean-css'),
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    uglify = require('gulp-uglify'),
    usemin = require('gulp-usemin'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    changed = require('gulp-changed'),
    rev = require('gulp-rev'),
    browserSync = require('browser-sync'),
    del = require('del');


    gulp.task('jshint', function() {
      return gulp
        .src('src/js/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter(stylish));
    });

    // Clean
    gulp.task('clean', function() {
      return del(['dist']);
    });

    // Images
    gulp.task('imagemin', function() {
      return del(['dist/images']), gulp.src('src/img/**/*')
        .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced:
        true })))
        .pipe(gulp.dest('dist/img'))
        .pipe(notify({ message: 'Images task complete' }));
    });

    gulp.task('copyfonts', ['clean'], function() {
        gulp.src('src/bower_components/font-awesome/**/*.{ttf,woff,eof,svg}*')
        .pipe(gulp.dest('dist/'));

    });

    gulp.task('usemin', ['jshint'], function () {
      return gulp
          .src('src/**/*.html')
          .pipe(usemin({
              css1:[minifycss(),rev()],
              css2:[minifycss(),rev()],
              js1: [uglify(),rev()],
              js2: [uglify(),rev()],
              js3: [uglify(),rev()]
          }))
          .pipe(gulp.dest('dist/'));
    });


    // Default task
    gulp.task('default', ['clean'], function() {
        gulp.start('usemin', 'imagemin','copyfonts');
    });
