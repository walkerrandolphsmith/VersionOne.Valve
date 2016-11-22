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

