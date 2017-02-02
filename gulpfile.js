'use strict';

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
    usemin = require('gulp-usemin'),
    rev = require('gulp-rev'),
    watch = require('gulp-watch'),
    browserSync = require('browser-sync'),
    clean  = require('gulp-clean'),
    data = require('gulp-data'),
    jade = require('gulp-jade'),
    fs = require('fs'),
    gutil = require('gulp-util'),
    merge = require('gulp-merge-json'),
    Flickr = require('flickrapi');

var dir_src = 'src',
    dir_dst = '/var/www/html/public/';

var from = {
    dir: dir_src,
    html: dir_src + '/index.html',
    js: dir_src + '/js',
    js_files: dir_src + '/js/**/*.js',
    libs: dir_src + '/libs/**/*',
    sass: dir_src + '/css/**/*.sass',
    sass_files: dir_src + '/css/**/*.sass',
    css: dir_src + '/css',
    css_file: dir_src + '/css/**/*.css',
    fonts: dir_src + '/bower_components/font-awesome/**/*.{ttf,woff,eof,svg}*',
    img: dir_src + '/img/**/*',
    json_files: dir_src + '/json/**/*.json',
    json: dir_src + '/db.json',
    jade: dir_src + '/jade/index.jade',
    jade_files: dir_src + '/jade/**/*.jade',
    bootstrap_sass: dir_src + '/bower_components/bootstrap/scss/bootstrap-flex.scss',
    bootstrap_css: dir_src + '/bower_components/bootstrap/dist/css',
    bower: dir_src + '/bower_components/**/*'
};

var to = {
    dir: dir_dst,
    html: dir_dst + '/index.html',
    js: dir_dst + '/js',
    libs: dir_dst + '/libs',
    css: dir_dst + '/css',
    fonts: '',
    img: dir_dst + '/img',
    json: dir_dst + '/db.json',
    bower: dir_dst + '/bower_components'
};


gulp.task('copyFiles', function() {
  // copy any html files in source/ to public/
  gulp.src(from.html).pipe(gulp.dest(to.dir));
  gulp.src(from.json).pipe(gulp.dest(to.dir));
  gulp.src(from.js_files).pipe(gulp.dest(to.js));
  gulp.src(from.css_file).pipe(gulp.dest(to.css));
  gulp.src(from.img).pipe(gulp.dest(to.img));
  gulp.src(from.bower).pipe(gulp.dest(to.bower));
  gulp.src(from.libs).pipe(gulp.dest(to.libs));
});


gulp.task('merge_json', function(){
  gulp.src(from.json_files)
      .pipe(merge('db.json'))
      .pipe(gulp.dest("./" + from.dir))


      // var json_Layers = JSON.parse(fs.readFileSync("./" + from.json)),
      // json_Data = json_Layers.Layers;
      // console.log('CONFIG ', json_Data);

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

// Jade compiler + Load json
// https://codepen.io/hoichi/post/json-to-jade-in-gulp
// http://stackoverflow.com/questions/31614931/how-to-parse-the-external-json-in-gulp-jade
gulp.task('jade',  function() {
    gulp.src(from.jade)
        // .pipe(data(function(file) {
        //           return require('./src/db.json');
        //         } ))
        .pipe(jade({
            pretty: true,
            locals: JSON.parse(fs.readFileSync("./" + from.json, { encoding: 'utf8' }) )
        }).on('error', gutil.log))
        .pipe(gulp.dest("./" + from.dir))
});


gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: from.dir,
      reloadDelay: 100
    }
  })
});

gulp.task('webserver', function() {
  connect.server({
    port: 3000,
    livereload: true,
    data: from.json,
  });
});

// Watch
gulp.task('watch', function (){
// gulp.task('watch', ['browserSync'], function (){
    gulp.watch(from.sass_files, ['sass']);
    gulp.watch(from.js_files, ['jshint']);
    gulp.watch(from.jade_files, ['jade']);
    gulp.watch(to.html, browserSync.reload);
});

// Default task
gulp.task('build', function () {
  runSequence(['merge_json', 'sass', 'jshint', 'jade']);
})

// Default task
gulp.task('default', ['build'], function () {
  gulp.start('watch','webserver', 'copyFiles');
  // gulp.start('browserSync', 'watch','webserver');
})
