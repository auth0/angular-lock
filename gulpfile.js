var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    ngAnnotate = require('gulp-ng-annotate'),
    injectVersion = require('gulp-inject-version'),
    sourceFiles = [
      'angular-lock.js'
    ];

gulp.task('build', function() {
  gulp.src(sourceFiles)
    .pipe(injectVersion({
      prepend: '',
      replace: /%%PACKAGE_VERSION%%/g
    }))
    .pipe(concat('angular-lock.js'))
    .pipe(ngAnnotate())
    .pipe(gulp.dest('./dist/'))
    .pipe(uglify())
    .pipe(rename('angular-lock.min.js'))
    .pipe(gulp.dest('./dist'))
});

gulp.task('default', ['build']);
