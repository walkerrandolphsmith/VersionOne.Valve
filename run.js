const fs = require('fs');
const path = require('path');

const name = process.argv[2];

const absolutePath = path.resolve(__dirname, './features/', name);

fs.exists(absolutePath, (exists) => {
    if(exists) {
        const Runner = require(`./features/${name}`);
        const runner = new Runner();

        runner.execute();
    } else {
        console.log(`the file at ${absolutePath} does not exist`);
    }
});