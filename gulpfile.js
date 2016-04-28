// https://css-tricks.com/gulp-for-beginners/

var gulp = require('gulp');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var watch = require('gulp-watch');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
var useref = require('gulp-useref');
var cssnano = require('gulp-cssnano');
var runSequence = require('run-sequence');

var dir_src = 'src',
    dir_dst = 'public';

var src = {
  dir: dir_src,
  html: dir_src + '/index.html',
  js: dir_src + '/js',
  css: dir_src + '/css/sass/app.sass',
  fonts: '',
  img: dir_src + '/img/**/*',
};

var dst = {
  dir: dir_dst,
  html: dir_dst + '/index.html',
  js: dir_dst + '/js',
  css: dir_dst + '/css',
  fonts: '',
  img: dir_dst + '/img',
};

// SASS compiler
gulp.task('sass', function(){
  return gulp
      .src(src.css)
      .pipe(sass())
      .pipe(gulp.dest(dst.css));
});

// Optimize js and css files
gulp.task('useref', function(){
  return gulp
      .src(src.html)
      .pipe(useref())
      // Minifies only if it's a JavaScript file
      .pipe(gulpIf('*.js', uglify()))
      // Minifies only if it's a CSS file
      .pipe(gulpIf('*.css', cssnano()))
      .pipe(gulp.dest(dst.dir))
});

// Copying Fonts to Dist
gulp.task('img', function() {
    return gulp
        .src(src.img)
        .pipe(gulp.dest(dst.img))
})

// Sync browser
gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: dst.dir,
      reloadDelay: 100
    }
  })
})


// Watch
gulp.task('watch', [ 'browserSync', 'useref', 'sass'], function (){

    gulp.watch(src.css, ['sass']);
    gulp.watch(src.html, ['useref']);

    gulp.watch(dst.html, browserSync.reload);
    gulp.watch(src.css, browserSync.reload);
});


gulp.task('default', function (callback) {
  runSequence(['img', 'sass', 'useref', 'browserSync', 'watch'],
    callback
  )
})
