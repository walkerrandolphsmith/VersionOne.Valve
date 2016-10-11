const Spinner = require('cli-spinner').Spinner;
const getV1 = require('./v1');

module.exports = class Runner {
    constructor() {
        this.spinner = new Spinner('processing... %s');
        this.spinner.setSpinnerString('/-\\');
        this.startTime = undefined;

        const { url, authenticate } = getV1();
        this.authenticate = authenticate;

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
        console.log(`Finished running commands in ${Date.now() - this.startTime} ms!`);
        this.spinner.stop();
    }

    execute() {
        this.start();
        return this.command().then(() => {
            this.stop();
        });
    }

    async command() {
        return new Promise.resolve();
    }
};