var gulp = require('gulp');
const fs = require('fs');
const path = require('path');
var nopt = require("nopt");

const knownOpts = {
    "key": String,
    "value": String
};

const shortHands = {
    "k": ["--key"],
    "val": ["--value"]
};

const options = nopt(knownOpts, shortHands, process.argv, 2);

gulp.task('set', [], function() {
    const { key, value } = options;

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