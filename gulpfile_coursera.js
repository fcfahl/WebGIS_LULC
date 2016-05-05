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
    del = require('del'),
    sass = require('gulp-sass');


    var from = {
      dir: "src"
    }

    var to = {
      dir: "build"
    }

    gulp.task('jshint', function() {
      return gulp
        .src(from.dir + 'js/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter(stylish));
    });

    // Clean
    gulp.task('clean', function() {
      return del([to.dir]);
    });

    // SASS compiler
    gulp.task('sass', function(){
      return gulp
          .src(from.dir + '/css/sass/app.sass')
          .pipe(sass())
          .pipe(gulp.dest(to.dir + '/css'));
    });

    // Images
    gulp.task('imagemin', function() {
      return del([to.dir + '/img']), gulp.src(from.dir + '/img/**/*')
        .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced:
        true })))
        .pipe(gulp.dest(to.dir + '/img'));
        // .pipe(notify({ message: 'Images task complete' }));
    });

    gulp.task('copyfonts', ['clean'], function() {
        gulp.src(from.dir + '/bower_components/font-awesome/**/*.{ttf,woff,eof,svg}*')
        .pipe(gulp.dest(to.dir));

    });

    gulp.task('usemin', ['jshint'], function () {
      return gulp
          .src('src/*.html')
          .pipe(usemin({
              css1:[minifycss(),rev()],
              css2:[minifycss(),rev()],
              js1: [uglify(),rev()],
              js2: [uglify(),rev()],
              js3: [uglify(),rev()]
          }))
          .pipe(gulp.dest(to.dir));
    });

    // Watch
    gulp.task('watch', ['browser‐sync'], function() {

        // Watch .js files
        gulp.watch('{src/js/**/*.js,src/css/**/*.sass,src/*.html}', ['usemin']);

        // Watch image files
        gulp.watch(from.dir + '/img/**/*', ['imagemin']);
        });

        gulp.task('browser‐sync', ['default'], function () {
            var files = [
                from.dir + '/css/**/*.sass',
                from.dir + '/js/*.js',
                to.dir + '/*.html'
            ];

        browserSync.init(files, {
           server: {
              baseDir: to.dir,
              index: "index.html"
           }
        });

        // Watch any files in dist/, reload on change
        gulp.watch([to.dir + '/**']).on('change', browserSync.reload);

    });

    // Default task
    gulp.task('default', ['clean'], function() {
        gulp.start('usemin', 'imagemin','copyfonts');
    });
