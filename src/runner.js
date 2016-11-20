const Spinner = require('cli-spinner').Spinner;
const getV1 = require('./v1');
const chalk = require('chalk');

module.exports = class Runner {
    constructor() {
        this.spinner = new Spinner('processing... %s');
        this.spinner.setSpinnerString('/-\\');
        this.startTime = undefined;

        const { url, authenticate } = getV1();
        this.authenticate = authenticate;
        this.rootUrl = url;
        console.info(`==> 💻  Connecting to the VersionOne instance: ${url}`);
    }

    authenticateAs(username, password) {
        return this.authenticate(username, password)
    }

    start() {
        this.spinner.start();
        this.startTime = Date.now()
    }

    stop() {
        const endTime = Date.now() - this.startTime;
        this.spinner.stop();
        console.log(chalk.bold.cyan(`\nFinished running commands in ${endTime} ms!`));
    }

    execute() {
        this.start();
        return this.command().then(() => {
            this.stop();
        }).catch(error => {
            console.log(chalk.bold.red('Something went wrong... For more details use try catch in your feature. Details: '), error);
            console.log(error.stack);
            this.stop();
        })
    }

    async command() {
        return new Promise.resolve();
    }
};