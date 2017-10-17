/*eslint-env node*/

'use strict';

const gulp = require('gulp');
const clean = require('gulp-clean');
const cleanhtml = require('gulp-cleanhtml');
const stripdebug = require('gulp-strip-debug');
const uglify = require('gulp-uglify-es').default;
const zip = require('gulp-zip');
const pump = require('pump');
const sourcemaps = require('gulp-sourcemaps');

// clean build directory
gulp.task('clean', () => gulp.src('build/*', {read: false}).pipe(clean()));

// copy static folders to build directory
gulp.task('copy', () => {
  gulp.src('src/icons/**')
    .pipe(gulp.dest('build/icons'));
  gulp.src('src/_locales/**')
    .pipe(gulp.dest('build/_locales'));
  return gulp.src('src/manifest.json')
    .pipe(gulp.dest('build'));
});

// copy and compress HTML files
gulp.task('html', () => gulp.src('src/*.html')
  .pipe(cleanhtml())
  .pipe(gulp.dest('build')));

// uglify all scripts, creating source maps
gulp.task('scripts', (cb) => {
  pump([
    gulp.src(['src/scripts/**/*.js']),
    sourcemaps.init(),
    stripdebug(),
    uglify({ ecma : 5 }),
    sourcemaps.write(),
    gulp.dest('build/scripts')
  ], cb);
}); 

// build ditributable and sourcemaps after other tasks completed
gulp.task('zip', ['html', 'scripts', 'copy'], () => {
  const manifest = require('./src/manifest');

  const distFileName = `case-converter_v${manifest.version}.zip`;
  const mapFileName = `case-converter_v${manifest.version}-maps.zip`;

  // collect all source maps
  gulp.src('build/scripts/**/*.map')
    .pipe(zip(mapFileName))
    .pipe(gulp.dest('dist'));
  // build distributable extension
  return gulp.src(['build/**', '!build/scripts/**/*.map'])
    .pipe(zip(distFileName))
    .pipe(gulp.dest('dist'));
});

//run all tasks after build directory has been cleaned
gulp.task('default', ['clean'], function() {
  gulp.start('zip');
});