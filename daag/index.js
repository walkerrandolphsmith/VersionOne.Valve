const Runner = require('./../src/runner');

const runner = new Runner();

const command = () => new Promise((resolve, reject) => {
    setTimeout(() => {
        console.log('Daag is performing an action.');
        resolve();
    }, 1000);
});

runner.execute(command);