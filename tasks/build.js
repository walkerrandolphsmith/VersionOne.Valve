const gulp = require('gulp');
const babel = require('gulp-babel');
const config = require('../package.json');

gulp.task('build', [], function() {
    return gulp.src('src/**/*.js')
        .pipe(babel(config.babel))
        .pipe(gulp.dest('dist'))
});