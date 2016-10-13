#VersionOne.Valve

Node application to pump data into a VersionOne instance.

- [Setup](#setup)
- [Running](#run)
- [New Features](#new-features)
- [Update Env Vars](#update-env-vars)
- [Directory Structure](#directory-structure)
- [Manual Setup](#manual-setup)
- [Contributors](#contributors)
- [Issues](#issues)

## Setup
Clone the repo and run `npm run boot` within the directory.
On windows you may need to run terminal as admin.

That's it. If you want more control you can check out Manual Setup at bottom.

## Run
Run a valve file (populate a feature)
```
./node_modules/.bin/gulp run -f <feature> -n <name>
```
- `-f` or `--feature` Name of directory under `./src/features`
- `-n` or `--name` Name of file under --feature directory

## New Features
Valve concentrates on automating features of VersionOne instance as a collection of commands.
Therefore the directory structure models this by having a `features` directory,
such that each sub directory is a feature that contains a collection of commands.

Creating new features can be as easy as running:
```
./node_modules/.bin/gulp template -f <feature> -n <name>
```
- `-f` or `--feature` Name of directory created under `./src/features`
- `-n` or `--name` Name of file created under --feature directory

## Update Env Vars

You can manually edit the `.env` file, however there is also a task that
will update only the key value pair you want updated.

```
./node_modules/.bin/gulp set -k V1Port -val 3001
```
- `-k` or `--key` Key
- `-v` or `--value` Value

## Directory Structure
```
|-- .env                        # env vars used to declare VersionOne instance url
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
|-- tasks                       # cli tasks

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

Include `closes`, `fixes`, or `resolves` in a commit message to close the issue.
For example `git commit -m "This closes #34, and closes #23"`
