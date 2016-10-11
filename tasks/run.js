const gulp = require('gulp');
const fs = require('fs');
const path = require('path');
const minimist = require('minimist');

const knownOptions = {
    string: 'name',
    default: { name: process.env.NAME }
};

const options = minimist(process.argv.slice(2), knownOptions);


gulp.task('run', ['build'], function() {
    const name = options.name;
    const absolutePath = path.resolve(__dirname, '../', 'dist', 'features/', name);
    fs.exists(absolutePath, (exists) => {
        if(exists) {
            const Runner = require(`../dist/features/${name}`);
            const runner = new Runner();

            runner.execute();
        } else {
            console.log(`the file at ${absolutePath} does not exist`);
        }
    });
});