var gulp = require('gulp');
var browserSync = require("browser-sync");
var config = require("./config");

gulp.task('dev', ['build'], function() {

    browserSync.init({
        server: config.dest,
        port: 3000
    });

    gulp.watch(config.blogPatterns, ['metalsmith']);
    gulp.watch(config.blogPatterns).on('change', browserSync.reload);

    gulp.watch(config.scripts.glob, ['scripts']);
    gulp.watch(config.scripts.glob).on('change', browserSync.reload);

    gulp.watch(config.styles.glob, ['styles']);
    gulp.watch(config.styles.glob).on('change', browserSync.reload);
});