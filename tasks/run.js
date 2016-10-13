const gulp = require('gulp');
const fs = require('fs');
const path = require('path');
const nopt = require("nopt");

const knownOpts = {
    "feature": String,
    "name": String
};

const shortHands = {
    "f": ["--feature"],
    "n": ["--name"]
};

const options = nopt(knownOpts, shortHands, process.argv, 2);


gulp.task('run', ['build'], function() {
    const feature = options.feature;
    const name = options.name;
    const relative = `${feature}/${name || 'index'}.js`;
    const dir = path.resolve(__dirname, '../', 'dist', 'features/', relative);
    console.log('Running ' + relative);
    fs.exists(dir, (exists) => {
        if(exists) {
            const Runner = require(`../dist/features/${relative}`);
            const runner = new Runner();

            runner.execute();
        } else {
            console.log(`Nothing to run, ${dir} does not exist`);
        }
    });
});