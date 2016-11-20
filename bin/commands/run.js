const fs = require('fs');
const chalk = require('chalk');

module.exports = (env, options) => {
    const fileName = options.argv.original[1];
    const dir = `${env.configBase}/${fileName}`;

    fs.exists(dir, (exists) => {
        if(exists) {
            const Runner = require(dir);
            const runner = new Runner(options);

            runner.execute();
        } else {
            console.log(chalk.bold.red(`Nothing to run, ${dir} does not exist`));
        }
    });
};