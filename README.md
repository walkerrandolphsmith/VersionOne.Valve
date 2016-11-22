#VersionOne.Valve

Node application to pump data into a VersionOne instance.

- [Global Install](#global-install-coming-soon)
- [Setup](#setup)
- [Running](#run)
- [New Features](#new-features)
- [Update Env Vars](#update-env-vars)
- [Directory Structure](#directory-structure)
- [File Anatomy](#file-anatomy)
- [Manual Setup](#manual-setup)
- [Contributors](#contributors)
- [Issues](#issues)

## Global install coming soon
When published as a npm package it can be globally installed using
`npm i -g` and will have some added benefits.
1. Run from any directory on your command line!
2. Forget about paths like `./node_modules/.bin/gulp` or `./bin/index.js` just type `valve <command> <options>`

## Setup
Clone the repo and run `npm run boot` within the directory.
On windows you may need to run terminal as admin.

That's it. If you want more control you can check out Manual Setup at bottom.

## Run
Run a valve file (populate a feature)
```
./bin/index.js run ./src/features/daag/index.js
```

## New Features
Valve concentrates on automating features of VersionOne instance as a collection of commands.
Therefore the directory structure models this by having a `features` directory,
such that each sub directory is a feature that contains a collection of commands.

Creating new features can be as easy as running:
```
./bin/index.js template -f <feature> -n <name>
```
- `-f` or `--feature` Name of directory created under `./src/features`
- `-n` or `--name` Name of file created under --feature directory

## Directory Structure
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
            * Only so many HTTP requests can be handled by IIS/Web server at once so throttle them!
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


## Manual Setup

`npm run boot` does two things  
1. Installs dependencies  
2. Creates a `.env` file with default values  

We can does these steps manually as well with the following guide:

### Dependencies
Start by installing all dependencies:
```
npm install
```

### Configure
Create a `.env` file in the root of the application to connect to VersionOne instance:

```
V1Protocol=       //VersionOne instance's protocol
V1Port=           //VersionOne instance's port
V1Host=           //VersionOne instance's host
V1Instance=       //VersionOne instance's name
V1Username=       //VersionOne instance's user's username
V1Password=       //VersionOne instance's user's password
V1AccessToken=    //VersionOne instance's user's access token
```

## Contributors

When attempting to contribute to this project the following should be added to the `.env` file:

```
V1Protocol=https
V1Port=443
V1Host=www14.v1host.com
V1Instance=v1sdktesting
V1AccessToken=Bearer 1.jA9m1Of4OUnAx/SCuOIGyE8DiCo=
```

## Issues

Issues can be found [on github issues](https://github.com/walkerrandolphsmith/VersionOne.Valve/issues)  
Include `closes`, `fixes`, or `resolves` in a commit message to close the issue.
For example 
```
git commit -m "This closes #34, and closes #23"
```
