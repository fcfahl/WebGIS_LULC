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
    clean  = require('gulp-clean'),
    data = require('gulp-data'),
    jade = require('gulp-jade'),
    fs = require('fs'),
    gutil = require('gulp-util'),
    data = require('gulp-data');

var dir_src = 'src',
    dir_dst = 'public';

var from = {
    dir: dir_src,
    html: dir_src + '/index.html',
    js: dir_src + '/js',
    js_files: dir_src + '/js/**/*.js',
    sass: dir_src + '/css/**/*.sass',
    sass_files: dir_src + '/css/**/*.sass',
    css: dir_src + '/css',
    css_file: dir_src + '/css/app.css',
    fonts: dir_src + '/bower_components/font-awesome/**/*.{ttf,woff,eof,svg}*',
    img: dir_src + '/img/**/*',
    json: dir_src + '/db.json',
    jade: dir_src + '/jade/index.jade',
    jade_files: dir_src + '/jade/**/*.jade',
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

var json_Layers = JSON.parse(fs.readFileSync("./" + from.json)),
    json_Data = json_Layers.Layers;
    // console.log('CONFIG ', json_Data);

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
gulp.task('jade', function() {
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
  runSequence(['sass', 'jshint', 'jade']);
})

// Default task
gulp.task('default', ['build'], function () {
  gulp.start('watch','webserver');
  // gulp.start('browserSync', 'watch','webserver');
})
