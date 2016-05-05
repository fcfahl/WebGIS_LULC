var gulp = require('gulp'),
    sass = require('gulp-ruby-sass'),
    imagemin = require('gulp-imagemin'),
    cache = require('gulp-cache'),
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    uglify = require('gulp-uglify'),
    cssnano = require('gulp-cssnano'),
    runSequence = require('run-sequence'),
    jsonServer = require('gulp-json-srv'),
    connect = require('gulp-connect'),
    imagemin = require('gulp-imagemin'),
    clean  = require('gulp-clean');

var dir_src = 'src',
    dir_dst = 'public';

var from = {
    dir: dir_src,
    html: dir_src + '/index.html',
    js: dir_src + '/js',
    js_files: dir_src + '/js/**/*.js',
    sass: dir_src + '/css/sass/app.sass',
    sass_files: dir_src + '/css/sass/*.scss',
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

// SASS compiler
gulp.task('sass', ['copyFiles'], function(){
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
          css2:[cssnano(),rev()],
          js1: [uglify(),rev()],
          js2: [uglify(),rev()],
          js3: [uglify(),rev()]
      }))
      .pipe(gulp.dest(to.dir));
});


// Default task
gulp.task('default', function () {
  console.log('from.bootstrap_sass: ', from.bootstrap_sass);
  console.log('from.css: ', from.css);
  gulp.start('bootstrap');
})
