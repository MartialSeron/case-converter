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
const gulpSequence = require('gulp-sequence');

// clean build directory
gulp.task('clean', () => gulp.src('build/*', {read: false}).pipe(clean()));

// copy static folders to build directory
gulp.task('copy:icons', () => {
  return gulp.src('src/icons/**')
    .pipe(gulp.dest('build/icons'));
});

gulp.task('copy:locales', () => {
  return gulp.src('src/_locales/**')
    .pipe(gulp.dest('build/_locales'));
});

gulp.task('copy:manifest', () => {
  return gulp.src('src/manifest.json')
  .pipe(gulp.dest('build'));
});

// copy and compress HTML files
gulp.task('copy:html', () => gulp.src('src/*.html')
  .pipe(cleanhtml())
  .pipe(gulp.dest('build')));

// uglify all scripts, creating source maps
gulp.task('copy:scripts', (cb) => {
  pump([
    gulp.src(['src/scripts/**/*.js']),
    sourcemaps.init(),
    stripdebug(),
    uglify({ ecma : 5 }),
    sourcemaps.write(),
    gulp.dest('build/scripts')
  ], cb);
});

gulp.task('copy', ['copy:icons', 'copy:locales', 'copy:manifest', 'copy:html', 'copy:scripts']);

gulp.task('zip:map', () => {
  const manifest = require('./src/manifest');
  const mapFileName = `case-converter_v${manifest.version}-maps.zip`;

  // collect all source maps
  return gulp.src('build/scripts/**/*.map')
    .pipe(zip(mapFileName))
    .pipe(gulp.dest('dist'));
});

gulp.task('zip:dist', () => {
  const manifest = require('./src/manifest');
  const distFileName = `case-converter_v${manifest.version}.zip`;

  // build distributable extension
  return gulp.src(['build/**', '!build/scripts/**/*.map'])
  .pipe(zip(distFileName))
  .pipe(gulp.dest('dist'));
});

// build ditributable and sourcemaps after other tasks completed
gulp.task('zip', ['zip:dist', 'zip:map']);

// build ditributable and sourcemaps after other tasks completed
gulp.task('build', gulpSequence('copy', 'zip'));

//run all tasks after build directory has been cleaned
gulp.task('default', ['clean'], function() {
  gulp.start('build');
});