// https://css-tricks.com/gulp-for-beginners/

var gulp = require('gulp'),
    gutil = require('gulp-util'),
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    uglify = require('gulp-uglify'),
    gulpIf = require('gulp-if'),
    watch = require('gulp-watch'),
    browserSync = require('browser-sync'),
    usemin = require('gulp-usemin'),
    cssnano = require('gulp-cssnano'),
    runSequence = require('run-sequence'),
    jsonServer = require('gulp-json-srv'),
    connect = require('gulp-connect'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    changed = require('gulp-changed'),
    rev = require('gulp-rev'),
    clean  = require('gulp-clean'),
    sass = require('gulp-sass');


var dir_src = 'src',
    dir_dst = 'public';

var from = {
    dir: dir_src,
    html: dir_src + '/index.html',
    js: dir_src + '/js',
    js_files: dir_src + '/js/**/*.js',
    sass: dir_src + '/css/sass/app.sass',
    sass_files: dir_src + '/css/sass/*.sass',
    css: dir_src + '/css',
    css_file: dir_src + '/css/app.css',
    fonts: dir_src + '/bower_components/font-awesome/**/*.{ttf,woff,eof,svg}*',
    img: dir_src + '/img/**/*',
    json: dir_src + '/db.json',
    jade: dir_src + '/jade/**/*.jade',
    bootstrap_sass: dir_src + '/bower_components/bootstrap/scss/bootstrap-flex.scss',
    bootstrap_css: dir_src + '/bower_components/bootstrap/dist/css',
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

    gulp.task('cleanFiles', function() {
        return gulp
            .src(from.css + '*.css', {read: false})
        		.pipe(clean());
    });

    // SASS compiler
    gulp.task('sass', ['cleanFiles'], function(){
      gulp.src('src/css/sass/app.sass')
          .pipe(sass())
          .pipe(gulp.dest('src/css'));
    });

    gulp.task('bootstrap', ['cleanFiles'], function(){
      return gulp
          .src(from.bootstrap_sass)
          .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
          .pipe(gulp.dest(from.css));
    });

    // Copying fies and images
    gulp.task('copyFiles', ['sass', 'bootstrap'], function() {
        gulp.src(from.fonts)
        .pipe(gulp.dest(to.dir));
        gulp.src(from.json)
        .pipe(gulp.dest(to.dir));

        // return del([to.img]), gulp.src(from.img)
        //   .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced:
        //   true })))
        //   .pipe(gulp.dest(to.img));
          // .pipe(notify({ message: 'Images task complete' }));
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

    gulp.task('browserSync', function() {
      browserSync.init({
        server: {
          baseDir: to.dir,
          reloadDelay: 100
        }
      })
    });

    //
    // gulp.task('jserver', function () {
    //   console.log('db:', from.json );
    // 	jsonServer.start({
    //     data: to.json,
    // 		port: 3000
    // 	});
    // });

    gulp.task('webserver', function() {
      connect.server({
        port: 3000,
        livereload: true,
        data: to.json,
      });
    });

    // Watch
    gulp.task('watch', ['browserSync'], function (){
        gulp.watch(from.sass_files, ['sass', 'usemin']);
        gulp.watch(from.js_files, ['usemin']);
        gulp.watch(from.html, ['usemin']);
        gulp.watch(to.html, browserSync.reload);
    });


    // Default task
    gulp.task('build', ['clean'], function () {
      runSequence(['copyFiles', 'usemin']);
    })

    // Default task
    gulp.task('default', ['build'], function () {
      gulp.start('browserSync', 'webserver');
    })
