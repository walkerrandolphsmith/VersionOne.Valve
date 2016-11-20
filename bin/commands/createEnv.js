const fs = require('fs');
const chalk = require('chalk');

module.exports = (env) => {
    const contents = `V1Protocol=http
V1Port=80
V1Host=localhost
V1Instance=VersionOne.Web
V1Username=admin
V1Password=admin`;
    const filePath = `${env.configBase}/.env`;
    console.log(
        chalk.bold.cyan(`Creating ${filePath} with ${contents}`)
    );
    fs.writeFile(`${env.configBase}/.env`, contents);
}