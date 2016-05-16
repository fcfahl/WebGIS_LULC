var gulp = require('gulp'),
    sass = require('gulp-ruby-sass'),
    imagemin = require('gulp-imagemin'),
    cache = require('gulp-cache'),
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    uglify = require('gulp-uglify'),
    cssnano = require('gulp-cssnano'),
    runSequence = require('run-sequence'),
    // jsonServer = require('gulp-json-srv'),
    connect = require('gulp-connect'),
    imagemin = require('gulp-imagemin'),
    usemin = require('gulp-usemin'),
    rev = require('gulp-rev'),
    watch = require('gulp-watch'),
    browserSync = require('browser-sync'),
    clean  = require('gulp-clean');

var dir_src = 'src',
    dir_dst = 'public';

var from = {
    dir: dir_src,
    html: dir_src + '/index.html',
    js: dir_src + '/js',
    js_files: dir_src + '/js/**/*.js',
    sass: dir_src + '/css/sass/app.sass',
    sass_files: dir_src + '/css/**/*.sass',
    css: dir_src + '/css',
    css_file: dir_src + '/css/app.css',
    fonts: dir_src + '/bower_components/font-awesome/**/*.{ttf,woff,eof,svg}*',
    img: dir_src + '/img/**/*',
    json: dir_src + '/db.json',
    jade: dir_src + '/jade/**/*.jade',
    bootstrap_sass: dir_src + '/bower_components/bootstrap/scss/bootstrap-flex.scss',
    bootstrap_css: dir_src + '/bower_components/bootstrap/dist/css'
};

var to = {
    dir: dir_dst,
    html: dir_dst + '/index.html',
    js: dir_dst + '/js',
    css: dir_dst + '/css',
    css_file: dir_dst + '/css',
    fonts: '',
    img: dir_dst + '/img',
    json: dir_dst + '/db.json'
};

// Clean
gulp.task('clean', function() {
  return gulp
      .src(to.dir, {read: false})
      .pipe(clean());
});

// Copying fies and images
gulp.task('copyFiles', ['clean'], function() {
    gulp.src(from.fonts)
    .pipe(gulp.dest(to.dir));
    gulp.src(from.json)
    .pipe(gulp.dest(to.dir));
    gulp.src(from.img)
      .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
      .pipe(gulp.dest(to.img));
      // .pipe(notify({ message: 'Images task complete' }));
});

gulp.task('copyCSS', ['clean'], function() {
    gulp.src(from.css_file)
      .pipe(gulp.dest(to.css_file));
});

// SASS compiler
gulp.task('sass', function(){
      sass(from.sass)
          .on('error', sass.logError)
          .pipe(gulp.dest(from.css));
      sass(from.bootstrap_sass)
          .on('error', sass.logError)
          .pipe(gulp.dest(from.css));
});

// JS Debug
gulp.task('jshint', function() {
  return gulp
    .src(from.js_files)
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

gulp.task('usemin', ['jshint'], function () {
  return gulp
      .src(from.html)
      .pipe(usemin({
          css1:[cssnano(),rev()],
        //   css2:[rev()],
        //   css2:[cssnano(),rev()],
          js1: [uglify(),rev()],
          js2: [uglify(),rev()],
          js3: [uglify(),rev()]
      }))
      .pipe(gulp.dest(to.dir));
});

gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: to.dir,
      reloadDelay: 100
    }
  })
});

gulp.task('webserver', function() {
  connect.server({
    port: 3000,
    livereload: true,
    data: to.json,
  });
});

// Watch
gulp.task('watch', function (){
// gulp.task('watch', ['browserSync'], function (){
    gulp.watch(from.sass_files, ['sass', 'copyCSS']);
    gulp.watch(from.js_files, ['usemin']);
    gulp.watch(from.html, ['usemin']);
    gulp.watch(to.html, browserSync.reload);
});

// Default task
gulp.task('build', ['clean'], function () {
  runSequence(['copyFiles', 'sass', 'copyCSS', 'usemin']);
})

// Default task
gulp.task('default', ['build'], function () {
  gulp.start('watch','webserver');
  // gulp.start('browserSync', 'watch','webserver');
})
