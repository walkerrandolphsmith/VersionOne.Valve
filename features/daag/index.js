const Runner = require('./../../src/runner');

class Daag extends Runner {
    command() {
        return new Promise((resolve, reject) => {
            const v1 = this.authenticateAs('admin', 'admin');

            const results = v1.query({
                    from: 'PrimaryWorkitem',
                    select: [
                        'Name'
                    ],
                    where: {
                        ID: 'Story:8546'
                    }
                })
                .then(response => {
                    console.log(response);
                }).catch((err) => {
                    reject('error talking with V1');
                });

            resolve(results);
        });
    }
}

const runner = new Daag();
runner.execute();