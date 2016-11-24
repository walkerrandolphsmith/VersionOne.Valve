const Spinner = require('cli-spinner').Spinner;
const getV1 = require('./v1');
const chalk = require('chalk');
const moment = require('moment');

module.exports = class Runner {
    constructor(options) {
        this.spinner = new Spinner('processing... %s');
        this.spinner.setSpinnerString('/-\\');
        this.options = options;
        this.startTime = undefined;
        this.endTime = undefined;

        const { url, authenticate } = getV1();
        this.authenticate = authenticate;
        this.rootUrl = url;

    }

    authenticateAs(username, password) {
        return this.authenticate(username, password)
    }

    start() {
        this.spinner.start();
        this.startTime = Date.now();

        console.log('\n\n');
        console.log('Run on ' + moment(this.startTime).format('LLLL'));
        console.info(
            `${chalk.bold.cyan('==>')} Connecting to the VersionOne instance: ${chalk.bold.cyan(this.rootUrl)}`
        );
    }

    stop() {
        this.endTime = Date.now() - this.startTime;
        this.spinner.stop();
    }

    execute() {
        this.start();
        return this.command().then(() => {
            this.stop();
            console.log(
                chalk.green.underline(`\nFinished running commands in ${chalk.bold(this.endTime)} ms!`)
            );
        }).catch(error => {
            this.stop();
            const isAxiosError = error.response;
            if(isAxiosError) {
                console.log(
                    chalk.red(`ERROR ${chalk.bold.underline(error.response.status)} ${error.response.statusText}`)
                );
                const {method, url, data} = error.config;
                console.log(chalk.red(`HTTP ${method} made to ${url}`));
                console.log(JSON.stringify(JSON.parse(data), null, ' '));
                if(this.options.verbose) console.log(error.stack);
            } else {
                console.log(chalk.red('ERROR ') + error);
                if(this.options.verbose) console.log(error);
            }
        })
    }

    async command() {
        return new Promise.resolve();
    }
};