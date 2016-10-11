const gulp = require('gulp');
const babel = require('gulp-babel');

gulp.task('build', [], function() {
    return gulp.src('src/**/*.js')
        .pipe(babel({
            presets: [
                'stage-3',
                'stage-2',
                'stage-1',
                'stage-0',
                'es2015'
            ],
            plugins: [
                'transform-class-properties',
                'transform-runtime'
            ]
        }))
        .pipe(gulp.dest('dist'))
});