---
template: index.hbt
---

## Home

```
|-- .env                        # env vars used to declare VersionOne instance url
|-- valvefile
|-- bin
|   |--index                    # entry point to running commands
|   |--options                  # define the known command line flags
|   |--commands                 # commands that can be run
|-- package.json
|-- README.md
|-- src
|   |-- common                  # constants and fns used by any feature
|   |-- features                # collection of features
|   |   |-- daag                
|   |   |   |-- utils           # constants and fns used by this feature
|   |   |   |   |-- index.js
|   |   |   |-- index.js        # default valve file that can be run by cli
|   |   |   |-- S1234           # valve files that can be run by cli
|   |   |   |-- S2345           # ...

```


## File Anatomy
```js
import throttler from './../../common/throttler';
import times from './../../common/times';
const Runner = require('./../../runner');

module.exports = class ValveRunner extends Runner {
     /*
     *
     * Options are passed in from the command line.
     * Enrich your feature by providing command line options
     * Example of usage in ./src/features/member/index.js
     *
     */
    constructor(options) {
        super(options);
    }

    /*
     * Command must be marked as async to use await within its scope
     */
    async command() {
        /*
        *
        * This function must return a Promise!
        *
        */
        return new Promise((resolve, reject) => {
            /*
            *
            * Get a reference to the V1 SDK as a user
            *
            */
            const v1 = this.authenticateAs('admin', 'admin');

            /*
            *
            * Visit the V1 SDK docs for more about using the SDK
            *
            *
            */
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
                    //axios stores the results you want in response.data
                    console.log(response.data);
                }).catch((err) => {
                    reject('error talking with V1');
                });

            /*
            *
            * Only so many HTTP requests can be handled by IIS at once so throttle them!
            *
            */
            const promisesInFlight = 25;
            const promises = times(1000).map(i => () => Promise.resolve(i));
            const resolvedValues = await throttler(promises, promisesInFlight);

            resolve(resolvedValues);
        });
    }
};
```