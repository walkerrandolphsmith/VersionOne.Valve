const fs = require('fs');
const chalk = require('chalk');

module.exports = (env, options) => {
    const feature = options.feature;
    const name = options.name;
    if(!feature) {
        console.log(chalk.bold.red('Aborting, No feature was provided'), 'Try template -f my-feature');
        return;
    }

    const dir = path.resolve(env.configBase, 'src', 'features', feature);
    const fileName = `${dir}/${name || 'index'}.js`;

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    fs.readFile(fileName, 'utf8', (err, contents) => {
        if(err) {
            fs.writeFile(fileName, newContents);
        } else {
            console.log(chalk.bold.red('Aborting, a feature with that name already exists.'));
        }
    })
}


const newContents = `
import throttler from './../../common/throttler';
import times from './../../common/times';
const Runner = require('./../../runner');

module.exports = class ValveRunner extends Runner {
    constructor(options) {
        super(options);
        /*
         *
         * Options are passed in from the command line.
         * Enrich your feature by providing command line options
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
            /*
            *
            * Get a reference to the V1 SDK as a user
            *
            */
            const v1 = this.authenticateAs('admin', 'admin');

            /*
            *
            * Visit the V1 SDK docs for more about using the SDK
            *
            */
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
                    //axios stores the results you want in response.data
                    console.log(response.data);
                }).catch((err) => {
                    reject('error talking with V1');
                });
                
            /*
            *
            * Only so many HTTP requests can be handled by IIS at once so throttle them!
            *
            */
            const promisesInFlight = 25;
            const promises = times(1000).map(i => () => Promise.resolve(i));
            const resolvedValues = await throttler(promises, promisesInFlight);   
                
            resolve(resolvedValues);
        });
    }
};`;