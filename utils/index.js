const fs = require('fs');
const path = require('path');

const name = process.argv[2];

if(!name) {
    console.log('Please provide a name for the feature...');
    console.log('Doing nothing.');
    return;
}

const dir = path.resolve(__dirname, '../', 'features', name);
const fileName = `${dir}/index.js`;


const contents = `const Runner = require('./../../src/runner');

const runner = new Runner();

const command = () => new Promise((resolve, reject) => {
    setTimeout(() => {
        console.log('${name} is performing an action.');
        resolve();
    }, 1000);
});

runner.execute(command);`;

if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
    fs.writeFile(fileName, contents);
} else {
    fs.writeFile(fileName, contents);
}