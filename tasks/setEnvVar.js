var gulp = require('gulp');
const fs = require('fs');
const path = require('path');
var nopt = require("nopt");
const opts = require('./opts');

const options = nopt(opts.knownOpts, opts.shortHands, process.argv, 2);

gulp.task('set', [], function() {
    const key = options.key;
    const value = options.value;

    const exp = new RegExp(`${key}=.*`);
    const keyValue = `${key}=${value}`;

    const dir = path.resolve(__dirname, '../');
    const fileName = `${dir}/.env`;

    fs.readFile(fileName, 'utf8', (err, contents) => {
        if(err) {
            fs.writeFile(fileName, keyValue);
            return;
        }
        const matches = contents.match(exp);
        const newContent = matches
            ? contents.replace(matches[0], keyValue)
            : `${contents}\n${keyValue}`;

        fs.writeFile(fileName, newContent);
    });
});