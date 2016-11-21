const runSequence = require('run-sequence');
const gulp = require('gulp');
const shell = require('gulp-shell');
const del = require('del');
var less = require('gulp-less');
var rename = require('gulp-rename');
var LessAutoprefix = require('less-plugin-autoprefix');
var cleanCSS = require('gulp-clean-css');
const config = require('./config');

gulp.task('clean', () => del([ config.dest ], { force: true }));

gulp.task('assets', () => gulp.src(config.assets.src).pipe(gulp.dest(config.assets.dest)));

gulp.task('scripts', shell.task([`babel ${config.scripts.src} --out-file ${config.scripts.dest}`]));

gulp.task('styles', () => gulp
    .src(config.styles.src)
    .pipe(less({ plugins: [new LessAutoprefix(config.styles.autoprefixTarget)] }))
    .pipe(rename(config.styles.name))
    .pipe(cleanCSS({ compatibility: 'ie8' }))
    .pipe(gulp.dest(config.styles.dest))
);

gulp.task('build', callback => runSequence('clean', ['metalsmith', 'scripts', 'styles', 'assets'], callback));
