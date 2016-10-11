const gulp = require('gulp');
const fs = require('fs');
const path = require('path');
const minimist = require('minimist');

var knownOptions = {
    string: 'name',
    default: { name: process.env.NAME }
};

var options = minimist(process.argv.slice(2), knownOptions);


gulp.task('template', ['build'], function() {
    const name = options.name;

    if(!name) {
        console.log('Please provide a name for the feature...');
        console.log('Doing nothing.');
        return;
    }

    const dir = path.resolve(__dirname, '../', 'src', 'features', name);
    const fileName = `${dir}/index.js`;


    const contents = `const Runner = require('./../../runner');

module.exports = class ${name} extends Runner {
    command() {
        return new Promise((resolve, reject) => {
            const v1 = this.authenticateAs('admin', 'admin');

            const results = v1.query({
                    from: 'PrimaryWorkitem',
                    select: [
                        'Name'
                    ],
                    where: {
                        ID: 'Story:8546'
                    }
                })
                .then(response => {
                    console.log(response);
                }).catch((err) => {
                    reject('error talking with V1');
                });

            resolve(results);
        });
    }
};`;

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
        fs.writeFile(fileName, contents);
    } else {
        fs.writeFile(fileName, contents);
    }
});