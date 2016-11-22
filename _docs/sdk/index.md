---
template: index.hbt
---
## VersionOne SDK

The VersionOne SDK is an open source library. The full documentation can
 be found at [VersionOne.JavaScript.SDK](https://github.com/versionone/VersionOne.SDK.JavaScript).
 
 The SDK does not directly require a dependency on an AJAX library to make HTTP requests, but instead allows the consumer to choose the library of their choice and pass it as a parameter to the SDK.
 Valve uses [axios](https://github.com/mzabriskie/axios/blob/master/README.md). 
 
 Valve has a `Runner` class that contains an authenticate method, that allows
 calls to be made to a VersionOne system as a specific user of that instance.
 The following shows how the VersionOne sdk is created:
 
 
 ```js
 const axios = require('axios');
 const v1sdk = require('v1sdk/dist/index');
 const sdk = v1sdk.default;
 const axiosConnector = v1sdk.axiosConnector;
 const { v1Protocol, v1Port, v1Host, v1Instance } = require('./config');
 
 module.exports = function() {
     const isHttps = v1Protocol === 'https';
     const url = `${v1Protocol}://${v1Host}:${v1Port}/${v1Instance}/`;
 
     const axiosConnectedSdk = axiosConnector(axios)(sdk);
     const unauthenticatedV1 = axiosConnectedSdk(v1Host, v1Instance, v1Port, isHttps);
     
     /*
      * Defering a call to withCreds allows each valve file determine 
      * which user to perform actions on the behalf of!
      */
     const authenticate = (username, password) => {
             return unauthenticatedV1.withCreds(username, password);
     }
     return { url, authenticate }
}
 ```

In `v1.js` we create and export an instance of the VersionOne SDK.
We read the `v1Protocol`, `v1Port`, `v1Host`, `v1Instance` from 
 the `.env` file to create a connection to a specific VersionOne instance.
 The module returns a function to authenticate and the url being used.
 
The `Runner` class can be subclassed by our valve files to enable easy authentication to a 
VersionOne instance.

```js
module.exports = class Runner {
    constructor() {
        /*
         *
         * getV1 is the module exported in v1.js
         * it's invocation returns the authenticate method
         *
         */
        const { url, authenticate } = getV1();
        this.authenticate = authenticate;
        this.rootUrl = url;
        console.info(`==> 💻  Connecting to the VersionOne instance: ${url}`);
    }

    /*
     *
     * The Runner class exposes an authenticateAs method
     * that can be used in a subclass
     *
     */
    authenticateAs(username, password) {
        return this.authenticate(username, password)
    }
    ...
}    
```

An example of a valve feature that inherits from the `Runner` class may look like:

```js
/*
 *
 * ValveRunner extends Runner
 * allows this class to inherit from Runner
 *
 */
module.exports = class ValveRunner extends Runner {
    async command() {
        /*
         *
         * Call this.authenticateAs given a username and password
         * to comunicate with a VersionOne instance
         *
         */
        const v1 = this.authenticateAs('admin', 'admin');
    }
}
```

## Attributes

The Create and Update commands provided by the SDK take an object of Attributes.
Create takes Attributes that will exist on the new asset,
and Update takes Attributes that will modify an existing Asset.
The object is structured the same in both cases:

Given the following object as an example: 

```js
{
    Name: 'My Bundle',
    Phase: 'Phase:123',
    ChangeSets: ['ChangeSet:123', 'ChangeSet:456']
}
```

The keys are valid Attribute names for a given Asset.
The value of each key is valid based on the following:

1. **Scalars:** like `Name` take a string value.  

2. **Single-value relation:** like `Phase` takes a string that is a valid Oid of
an existing asset.  

3. **Multi-value relations:** like `ChangeSets` takes an array.
If the array contains string Oids then a relationship is added.
This is merely a short hand for `{ "value": "ChangeSet:123", "act": "add" }`  
If you want to remove an asset from the relationship then an object must be in 
the array that is of the form `{ "value": "ChangeSet:123", "act": "remove" }`

## Create

Create has two parameters an AssetType and Attributes:

```js
.create('Bundle', {
    Name: 'My Bundle',
    Phase: 'Phase:123',
    ChangeSets: ['ChangeSet:123', 'ChangeSet:456']
});
```


## Update

Create has two parameters an Oid of an existing Asset and Attributes:

```js
.create('Bundle:123', {
    Name: 'My Bundle',
    Phase: 'Phase:123',
    ChangeSets: ['ChangeSet:123', 'ChangeSet:456']
});
```


## Query

Query via the SDK leverages the `query.v1` endpoint. The SDK accepts an object
That contains these keys: `from`, `select`, `filter`, `find`. 

`from`: is a valid AssetType to query on  
`select`: is an array of Attributes and Related Assets' Attributes to include in your projection  
`filter`: is a array of filters to apply to your query  
`find`: is a string that further filters the results  

The following is a way to search for all Epics that are not Closed and have a name that begin's with "My Epic Name"
The result set will be an array of objects with the shape described by the select key.

```js
v1.query({
      'from': 'Epic',
      'select': [
          'Name',
          'Scope',
          'AssetType',
          'Category',
          'Category.Name'
      ],
      'filter': [
          "AssetState!='Closed'"
      ],
      'find': 'My Epic Name*'
  }

```

## Operations

VersionOne provides operations that can be issued on Assets. The SDK
allows for those operations to be invoked with an Oid of an existing Asset
 and the name of the operation. Note: Supported operations are dependent on the 
 AssetType!

```js
v1.executeOperation('Story:123', 'Close')
```