const gulp = require('gulp');
const {series} = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;
const eslint = require('gulp-eslint');
const jasmineBrowser = require('gulp-jasmine-browser');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const imagemin = require('gulp-imagemin');
const imageminPngquant = require('imagemin-pngquant');


function watch() {
  gulp.watch('sass/**/*.scss', gulp.parallel(styles));
  gulp.watch('sass/**/*.scss').on('change', reload);
  gulp.watch('index.html', gulp.series(copyHtml));
  gulp.watch('*.html').on('change', reload);
  gulp.watch('img', gulp.series(copyImages));
  gulp.watch('img/*').on('change', reload);
  gulp.watch('js/**/*.js', gulp.series(lint, scripts));
  gulp.watch('js/**/*.js').on('change', reload);
  browserSync.init({
    server: './dist',
  });
}


function styles(cb) {
  gulp.src('sass/**/*.scss')
      .pipe(sass({outputStyle: 'compressed'}))
      .on('error', sass.logError)
      .pipe(
          autoprefixer({
            browserlist: ['last 2 versions'],
          }))
      .pipe(gulp.dest('dist/css'))
      .pipe(browserSync.stream());
  cb();
}


function copyHtml(cb) {
  gulp.src('index.html')
      .pipe(gulp.dest('dist'));
  cb();
}


function copyImages() {
  return gulp.src('img/*')
      .pipe(imagemin({
        progressive: true,
        use: imageminPngquant(),
      }))
      .pipe(gulp.dest('dist/img'));
}


function lint(cb) {
  gulp.src(['js/**/*.js'])
      .pipe(eslint())
      .pipe(eslint.format())
      .pipe(eslint.failAfterError());
  cb();
}

function jasmine() {
  return gulp.src(['js/**/*.js', 'spec/**/*_spec.js'])
      .pipe(jasmineBrowser.specRunner())
      .pipe(jasmineBrowser.server({port: 8888}));
}

function scripts() {
  return gulp.src('js/**/*.js')
      .pipe(sourcemaps.init())
      .pipe(babel())
      .pipe(concat('all.js'))
      .pipe(sourcemaps.write())
      .pipe(gulp.dest('dist/js'));
}

function scriptsDist() {
  return gulp.src('js/**/*.js')
      .pipe(sourcemaps.init())
      .pipe(concat('all.js'))
      .pipe(babel())
      .pipe(uglify())
      .pipe(sourcemaps.write())
      .pipe(gulp.dest('dist/js'));
}

function dist(cb) {
  series(copyHtml, copyImages, styles, lint, scriptsDist);
  cb();
}

exports.dist= dist;
exports.styles= styles;
exports.scripts= scripts;
exports.copyHtml= copyHtml;
exports.copyImages= copyImages;
exports.default= series(styles, lint, jasmine, scripts,
    copyHtml, copyImages, watch);
