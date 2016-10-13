const gulp = require('gulp');
const fs = require('fs');
const path = require('path');
const nopt = require("nopt");
const opts = require('./opts');

const options = nopt(opts.knownOpts, opts.shortHands, process.argv, 2);

gulp.task('template', ['build'], function() {
    const feature = options.feature;
    const name = options.name;
    if(!feature) {
        console.log('No feature was provided');
        console.log('gulp template -f my-feature');
        return;
    }

    const dir = path.resolve(__dirname, '../', 'src', 'features', feature);
    const fileName = `${dir}/${name || 'index'}.js`;

    const newContents = `const Runner = require('./../../runner');

module.exports = class ValveRunner extends Runner {
    constructor(options) {
        super(options);
        /*
         *
         * Options are passed in from the command line.
         * Enrich your feature by providing command line options in ./tasks/opts.js
         * Example of usage in ./src/features/member/index.js
         *
         */
    }

    /*
     * Command must be marked as async to use await within its scope
     */
    async command() {
        /*
        *
        * This function must return a Promise!
        *
        */
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
    }

    fs.readFile(fileName, 'utf8', (err, contents) => {
        if(err) {
            fs.writeFile(fileName, newContents);
        } else {
            console.log('A feature with that name already exists.');
        }
    })
});