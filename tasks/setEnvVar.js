var gulp = require('gulp');
const fs = require('fs');
const path = require('path');
const minimist = require('minimist');

var knownOptions = {
    string: 'k',
    default: { k: process.env.K }
};

var options = minimist(process.argv.slice(2), knownOptions);

gulp.task('set', [], function() {
    const { k, val } = options;
    const exp = new RegExp(`${k}=.*`);
    const keyValue = `${k}=${val}`;
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