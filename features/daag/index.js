const Runner = require('./../../src/runner');
const dropMoment = require('./../utils/dropMoment');
const times = require('./../utils/times');

module.exports = class Daag extends Runner {
    command() {
        return new Promise((resolve, reject) => {
            const v1 = this.authenticateAs('admin', 'admin');

            const promises = times(10).map(i => v1.create('Epic', {
                Name: `ValveEpic${i}`,
                Scope: 'Scope:0'
            }));

            const result = Promise.all(promises).then(epics => Promise.all(
                epics.reduce((wiPromises, epic) => wiPromises
                    .concat(times(4).map(i => v1.create((i % 2 === 0 ? 'Story' : 'Defect'), {
                        Name: `ValveStory${i}`,
                        Scope: 'Scope:0',
                        Super: dropMoment(epic.id)
                    }))), [])
            ));

            resolve(result);
        });
    }
};