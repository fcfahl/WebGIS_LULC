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
var jsonServer = require('gulp-json-srv');
var connect = require('gulp-connect');

var dir_src = 'src',
    dir_dst = 'public';

var src = {
  dir: dir_src,
  html: dir_src + '/index.html',
  js: dir_src + '/js',
  js_files: dir_src + '/js/**/*.js',
  sass: dir_src + '/css/sass/app.sass',
  css: dir_src + '/css',
  sass_files: dir_src + '/css/sass/*.sass',
  fonts: '',
  img: dir_src + '/img/**/*',
  json: dir_src + '/db.json',
  jade: dir_src + '/jade/**/*.jade',
  bootstrap_sass: dir_src + '/bower_components/bootstrap/scss/bootstrap-flex.scss',
  bootstrap_css: dir_src + '/bower_components/bootstrap/dist/css',
};

var dst = {
  dir: dir_dst,
  html: dir_dst + '/index.html',
  js: dir_dst + '/js',
  css: dir_dst + '/css',
  fonts: '',
  img: dir_dst + '/img',
  json: dir_dst + '/db.json'
};

// SASS compiler
gulp.task('sass', function(){
  return gulp
      .src(src.sass)
      .pipe(sass())
      .pipe(gulp.dest(src.css));
});

gulp.task('bootstrap', function(){
  return gulp
      .src(src.bootstrap_sass)
      .pipe(sass())
      .pipe(gulp.dest(src.bootstrap_css));
});

// Optimize js and css files
gulp.task('useref', function(){
  return gulp
      .src(src.html)
      .pipe(useref())
      // Minifies only if it's a JavaScript file
      // .pipe(gulpIf('*.js', uglify()))
      // Minifies only if it's a CSS file
      // .pipe(gulpIf('*.css', cssnano()))
      .pipe(gulp.dest(dst.dir))
});

// Copying fies
gulp.task('copy', function() {
    gulp
        .src(src.img)
        .pipe(gulp.dest(dst.img));
    gulp
        .src(src.json)
        .pipe(gulp.dest(dst.dir));
    gulp
        .src(src.js_files)
        .pipe(gulp.dest(dst.js))
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


gulp.task('jserver', function () {
  console.log('db:', dst.json );
	jsonServer.start({
    data: dst.json,
		port: 3000
	});
});

gulp.task('webserver', function() {
  connect.server({
    port: 3000,
    livereload: true,
    data: dst.json,
  });
});

// Watch
gulp.task('watch', [ 'sass', 'browserSync', 'useref'], function (){
    gulp.watch(src.sass_files, ['sass']);
    gulp.watch(src.sass_files, ['useref']);

    gulp.watch(src.html, ['useref']);
    gulp.watch(src.jade , ['useref']);

    gulp.watch(src.js_files , ['copy']);

    gulp.watch(dst.html, browserSync.reload);
    gulp.watch(dst.html, browserSync.reload);
});


gulp.task('default', function () {

  runSequence(['copy', 'jserver', 'sass', 'bootstrap',  'useref', 'browserSync',  'watch']
  )
})
