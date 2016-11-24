---
template: index.hbt
---
## Utils

Certain functionality appears in valve files over and over, thus we have some
common utilities. We only ask that something be promoted to a utility and not
born a utility, meaning only create it in the common utilities if it is used in more than one valve feature.

## Throttle

Often we use the SDK to populate a feature with large data sets. Each Asset creation
requires its own HTTP request. The SDK leverages Promises to handle the asynchrnous nature of HTTP requests.
The web server can only handle a finite number of open requests, so creating 10,000 stories simultanousely will
surely cause some 500 error responses. THis is why Throttle was born. Throttle handles a huge number of Promises
to be handled by allowing **N** Promises to process at a time.

Throttle takes an array of functions such that every function returns a Promise.
Passing a collection of functions allows the desired 'work' of the Promise to be deferred
until Throttle is ready for it to occur.

```js
/*
*
* Only so many HTTP requests can be handled by IIS at once so throttle them!
*
*/

// There will always be 25 promises in pending
const promisesInFlight = 25;
// Create a array of functions that return a Promise
const promises = [1, 2, ..., 10000].map(i => () => Promise.resolve(i));
// throttler returns a promise when all its inputs have been processed
const resolvedValues = await throttler(promises, promisesInFlight);
```



## Times

Unfortunately there is not a native range function in JavaScript and 
the best we get is this XD `Array.from(Array(n), (_, i) => i);`
This is not clear and not fun to write.

We often create **N** stories or change sets. Times is an implementation of range
The given an int returns an array of int elements.

```js
//Create thrity stories each with a name
times(30).map(i => v1.create('Story' { Name: i }))
```

## Drop Moment

The SDK Create function returns promise that eventually resolves an object that 
represents the newly created Asset.

The object contains an id property that is the Oid of the new asset.
This oid however is of the form `AssetType:Number:Moment`.
Updating the Asset, executing an operation on that Asset,
 or relating it to another Asset would require the oid token without the Moment.
Therefore we have created a string operation to remove the `:Moment` from the id.

```js
const story = await v1.create('Story', {});
const changeSet = v1.create('ChangeSet', { PrimaryWorkitems: [dropMoment(story.id)] })
```


## getOidFromName

Often we have the name of an Asset of particular type in the system and needs its oid.
This method ensures that when requesting for an oid given an Asset's name you are "guaranteed" to
retrieve an oid. If an Asset of the provided `AssetType` is found with the provided `Name` its oid is returned,
otherwise an Asset is created with the provided `Name` and its oid is returned.
Note: Many Assets can have the same `Name`, therefore the first one found is the oid you'll get back.

```js
const getOidFromName = async (v1, assetType, name, attributes = {}) => {
    if(!assetType || !name) throw new Error('AssetType and name required.');
    const attrs = Object.assign({}, { Name: name }, attributes);
    return await v1.query({
        from: assetType, select: ['Name'], where: { Name: name }
    }).then(assets => assets[0][0] ? assets[0][0]._oid : v1.create(assetType, attrs).then(a => dropMoment(a.id)));
};
```

There are more specific functions that can be used to retrieve an oid given a `Story` `Name`.
Note: Assets in VersionOne have various Attributes some of which are required to exists. This method will
use default values for required Attributes to ensure the Asset can be created, however you can provide your own `Attributes` that
will override the defaults!

If you intend to add a new `getAsset` to the common utilities please ensure that 
the default attributes satisfy the requirements for creating an Asset of that type.
These methods are intended to psuedo "guarantee" oid retrieval.
The required Attributes may depending on what version of Meta your instance uses, however this problem has yet to be solved.


```js
export const getScope = async (v1, name, attributes = {}) => {
    const attrs = Object.assign({}, {
        Parent: 'Scope:0',
        //Scheme: schemeOid, what is a default scheme oid?
        BeginDate: '2016-06-28'
    }, attributes);

    return await getOidFromName(v1, 'Scope', name, attrs);
};
```

For a consumer using `getScope` may look like the following:

```js
/*
*
* v1 is an instance of the SDK
*
*/
const scopeOid = await getScope(v1, 'scopeName', {
    Scheme: 'Scheme:123',
    Description: 'More Values to use when creating',
    BeginDate: '2050-06-11' //I can override the defaults too!
});
```