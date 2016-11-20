#!/usr/bin/env node --harmony
require('babel-register')({
    presets: [ 'stage-0' ]
});
const nopt = require("nopt");
const opts = require('./options');

const Liftoff = require('liftoff');
const options = nopt(opts.knownOpts, opts.shortHands, process.argv, 2);

const fs = require('fs');
const chalk = require('chalk');
const co = require('co');
const prompt = require('co-prompt');
const commands = require('./commands');

const requireCallback = (name, module) => console.log('Loading:',name);
const requireFailCallback = (name, err) => console.log('Unable to load:', name, err);
const respawnCallback = (flags, child) => console.log('Detected node flags:', flags, child.pid);

const config = {
    name: 'valve',
    moduleName: 'valve',
    configName: 'valvefile',
    extensions: { '.js': null, '.json': null },
    v8flags: ['--harmony']
};

const Valve = new Liftoff(config)
  .on('require', requireCallback)
  .on('requireFail', requireFailCallback)
  .on('respawn', respawnCallback);

Valve.launch({
    cwd: options.cwd,
    require: options.require,
    completion: options.completion,
    verbose: options.verbose
}, invoke);

function invoke (env) {


    const desiredCommand = options.argv.original[0];
    const fileName = options.argv.original[1];

    const knownCommands = Object.keys(commands);

    const command = knownCommands.find(command => command === desiredCommand);

    if (options.verbose) {
        console.log(chalk.bold.cyan('================================== VERBOSE =================================='));
        console.log(chalk.bold.cyan('ENV: '), JSON.stringify(env, null, ' '));

        const formattedOptions = Object.assign({}, options);
        formattedOptions.fileName = fileName;
        formattedOptions.command = desiredCommand;
        delete formattedOptions["argv"];

        console.log(chalk.bold.cyan('OPTS: '), JSON.stringify(formattedOptions, null, ' '));

        const envVariables = require(`${env.configBase}/src/config.js`);
        console.log(chalk.bold.cyan('VARS: '), JSON.stringify(envVariables, null, ' '));
        console.log(chalk.bold.cyan('================================== VERBOSE =================================='));
    }

     if (process.cwd() !== env.cwd) {
        process.chdir(env.cwd);
        console.log('Working directory changed to', env.cwd);
    }

    if (env.configPath) {
        require(env.configPath);
    } else {
        console.log(chalk.bold.red('No ', Valve.configName, ' found.'));
    }

    if(command) {
        commands[command](env, options, fileName);

    } else {
        console.log(chalk.bold.red('Unknown command'), desiredCommand);
        console.log('Try one of the following: ', knownCommands);
    }

}
