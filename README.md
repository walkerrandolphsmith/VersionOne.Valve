#VersionOne.Valve

Node app to pump data into a VersionOne instance

##Issues

Include `closes`, `fixes`, or `resolves` in a commit message to close the issue.
For example `git commit -m "This closes #34, and closes #23"`

##Getting Started
Clone the repo and run `npm run boot` within the directory.
On windows you may need to run terminal as admin.

Thats it. If you want more control you can check out Manual Setup at bottom.

### Run
Run a valve file (populate a feature)
```
./node_modules/.bin/gulp run --name <dir-name>/index.js
```

### New Features
Valve concentrates on automating features of VersionOne instance as a collection of commands.
Therefore the directory structure models this by having a `features` directory,
such that each sub directory is a feature that contains a collection of commands.

Creating new features can be as easy as running:
```
./node_modules/.bin/gulp template --name <feature-name>
```

## Manual Setup
### Dependencies
Start by installing all dependencies:
```
npm install
```

### Configure
Create a `.env` file in the root of the application to connect to VersionOne instance:

```
V1Protocol=http
V1Port=80
V1Host=localhost
V1Instance=VersionOne.Web
V1Username=user
V1Password=password
V1AccessToken=Bearer 1.jA9m1Of4OUnAx/SCuOIGyE8DiCo=
```

#### All Configuration Options
```
V1Protocol=       //VersionOne instance's protocol
V1Port=           //VersionOne instance's port
V1Host=           //VersionOne instance's host
V1Instance=       //VersionOne instance's name
V1Username=       //VersionOne instance's user's username
V1Password=       //VersionOne instance's user's password
V1AccessToken=    //VersionOne instance's user's access token
```

#### Contributers Use:
```
V1Protocol=https
V1Port=443
V1Host=www14.v1host.com
V1Instance=v1sdktesting
V1AccessToken=Bearer 1.jA9m1Of4OUnAx/SCuOIGyE8DiCo=
```