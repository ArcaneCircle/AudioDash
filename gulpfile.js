const gulp = require('gulp');
const size = require('gulp-size');
const concat = require('gulp-concat');
const terser = require('gulp-terser');
const plumber = require('gulp-plumber');
const addsrc = require('gulp-add-src');
const archiver = require('archiver')('zip');
const fs = require('graceful-fs');
const through = require('through2');

function build() {
  return gulp.src(['src/kontra.js', 'src/wavesurfer.js', 'src/globals.js', 'src/ui.js', 'src/*.js', '!src/main.js'])
    .pipe(addsrc.append('src/main.js'))
    .pipe(concat('index.js'))
    .pipe(plumber())
    .pipe(terser())
    .pipe(plumber.stop())
    .pipe(gulp.dest('.'));
}

function dist() {
  const zip = fs.createWriteStream('AudioDash.xdc');
  archiver.pipe(zip);
  return gulp.src(['index.js', 'index.html', "manifest.toml", "icon.png"])
    .pipe(size({
      gzip: true
    }))
    .pipe(through.obj((file, encoding, cb) => {
      archiver.append(file.contents, {
        name: file.relative,
        mode: file.stat
      });
      cb(null, file);
    }, cb => {
      zip.on('finish', cb);
      archiver.finalize();
    }));
}

function watch() {
  gulp.watch('src/*.js', ['build']);
}

exports.build = build;
exports.dist = dist;
exports.default = gulp.series(build, dist);
