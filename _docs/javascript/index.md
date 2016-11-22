---
template: index.hbt
---

## JavaScript

This section is to highlight some concepts of JavaScript that are leveraged by Valve.
This is not a tutorial on learning JavaScript, however [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript) has a great one.


Asynchronous programming in Javascript involves a control flow that is not sequential like what is
expected from most programming languages. This non-sequence nature is due to the result of a function
not being available immediately. In this scenario the program continues execution despite the result of the first
function not returning and the subsequent operations on that result not occurring. Asynchronous code may be a result of
physical limitations causing the reults to not be instant or guaranteed like file IO and network requests.
Asynchronous programming can be a challenging task and it has evolved quite a bit in Javascript since I began programming.
In a few short years I have solved this problem like many other Javascript developers: using callbacks, promises, and now
even `async` and `await`. Each of these approaches changes the structure of the asynchronous code as well as the control flow.
For many people seeing the differences between these techniques will actually feel like a stroll down memory lane.

## callbacks

The first technique I learned involved a pattern called callbacks. This term describes a technique of invoking a "callback"
function that will operate on the results of an asynchronous function invocation when the result is available. As mentioned
file IO is a great example of asynchronous code. Consider reading a file from disk:
```js
const contents = fs.readFile("my-file");
console.log(contents)
```

Unlike synchronous functions, `undefined` will be printed as contents because the file's contents have not yet been read from disk.
However if we need to perform an action with contents of the file we can accomplish this with a callback function.

```js
const action = (error, contents) => {
    if(error) console.log(error);
    else console.log("File was read! ", contents);
}
fs.readFile("my-file", action);
console.log("end");
```

In this example `action` is a callback function that will print the contents of the file when they have **eventually**
been retrieved. Understanding this code is not too difficult but is critical to understand the order in which things occur.
First the callback function, action, is declared. Then the `readFile` function is invoked. Immediately afterwards
`"end"` is printed to the console. Lastly the error or contents are printed to the console despite appearing
in the script prior to the last console statement. Callbacks allow us to handle asynchronous programming, great.
One common issue that occurs when using callbacks is described as `callback hell`. Often we find code in which
more asynchronous functions are called within the context of a callback function. Sticking with the file IO example lets
consider reading all files from a directory.

```js
fs.readdir('my-dir', (error, files) => {
    if(error) return error;
    files.forEach(file => {
        fs.readFile(file, (err, contents) => {
            if(err) return err;
            console.log(contents);
        });
    });
});
```

In this example a callback function is passed to `readdir` that performs some action once the directory has been read from disk.
Within that callback function, the retrieved files are iterated over and each read, which required another callback function
to handle the contents of the file read when the operation has completed. There are a few side effects of writing this code as
seen. It is very difficult to wrap the inner most callback function under test. Over shadowing of variables
like `error` become more likely. In this example I differentiated between the two with `error` and `err`. Is `readdirError`
and `readFileError` better? Likely not and the more nested asynchronous calls that are made the more difficult this naming
becomes. It also complicates the intention, read files from a directory, with the implementation details of doing so.
Lastly one common complaint of this code gives rise to the term callback hell, the further and further indentation of the callback functions.
The trail of `});` symbols at the end indicates how deeply nested this block has become. One solution to avoid this deep nesting is to
declare each callback function instead of using anonymous functions. This allows the function to be written with the same
indentation as the top level call to `readdir`.

## promises

A promise is an alternative construct that enables us to write more readable asynchronous code. Before the advent of ES2015 there
were many great node modules like `Q`, `bluebird`, `RSVP`, and many more that provided promises. Now Promise is a first class
citizen of the language. So what is a promise? It is merely a function that is passed the arguments resolve and reject.
The function is executed immediately by the Promise implementation, passing resolve and reject functions and after
some asynchronous work is complete the resolve or reject functions are called. As describe by MDN, a Promise is a proxy
for a value that has yet to be determined. A promise begins in a pending state and once the asynchronous call has completed
it is fulfilled with a value or rejected with an error. Upon its fulfillment or rejection a promise is ready to invoke a callback function.
```js
const handler = (err, response) => {
    if(err) return err;
    else return response.text();
};
fetch('http://resource').then(handler);
```

The `then` and `catch` function also return a promise so calls to them can be chained.

```js
fetch('http://resource')
    .then(res => res.text())
    .then(text => convertToXML(text))
    .then(xml => convertToJson(xml))
    .catch(err => console.log(err));
```

Often we find ourselves needing to wait for many asynchronous calls to be resolved before taking action. Consider
making a http request to a resource like the previous example and the response contained ids needed to make subsequent
http request for more detailed data. We can use `Promise.all` to ensure every promise has been fulfilled before invoking our
callback function by passing an array of promises and/or scalar values to the function.
```js
fetch('http://resource')
    .then(res => res.text())
    .then(text => convertToXML(text))
    .then(xml => convertToJson(xml))
    .then(items => Promise.all(
        items.map(i => fetch(`http://resource/details/${i.id}`))
    ))
    .catch(err => console.log(err));
```


## async await
Now ES2016 has described a new language feature to help us handle promises with the keywords `async` and `await`!
A function can de decorated with the `async` keyword that indicates it returns a Promise.
It's invocation can be decorated with the `await` keyword which allows us to read and write asynchronous code synchronously.
The await keyword indicates there is a blocking call and further execution will wait for the promises resolution.
```js
const getItems = async fetch('http://resource')
    .then(res => res.body);

const items = await getItems();
console.log(items);
```

In the previous example printing items is not `undefined`! Now we can write asynchronous code as if it were synchronous.
The subsequent lines are not executed until `getItems` has resolved or rejected the Promise.
In the case of a rejection the caller of getItems can be wrapped in a `try`/`catch` statement.

```js
try {
    const items = await getItems();
    console.log(items);
} catch(exception) {
    console.log("Oh no an error");
```

Sets, lists, and collections are structures I deal with almost everyday when programming. ES5 brought cool  features
like map and reduce, but prior to ES2015 I often used libraries like underscore and lodash to help me operate on arrays.
These libraries and another, Rambda, are still on my radar since they have optimized many of these operations, however
there are a couple common operations  I will cover.

## isArray?
Sometimes we need to know if a particular variable is an array. We may want to process the value differently if is an array.
```js
const isArray = Array.isArray(object);
```

## map
The single most used array operation I use is `map`. Map is useful when transforming one array to another.
When examining the anatomy of map we can see it is a function
that is on the array prototype. The function returns an array and accepts a single function as its arguments.
```js
const stories = [
    { id: 'Story:123', changeSetCount: 2 },
    { id: 'Story:456', changeSetCount: 10 }
]
const storyOids = stories.map(story => story.id)
// ['Story:123', 'Story:456']
```
The argument to the map function is a function whose argument is an element in the list. The function
will be invoked for each element in the original array. The return value of each invocation will be an element in the
resulting array. In this example the original array is a list of stories and the function that is an argument to map is
`story => story.id`. This function will operate on each element in the original list by returning the storie's id.
Each return value will be an element in the `storyOids` array. so its value will be `['Story:123', 'Story:456']`.


## filter
Filter is a function on the array prototype with a signature very similiar to `map`. Filter results in a new array
with the same elements or a subset of elements of the original array.
```js
const stories = [
    { id: 'Story:123', changeSetCount: 0 },
    { id: 'Story:456', changeSetCount: 10 }
]
const storiesWithChangeSets = stoires.filter(stroy => story.changeSetCount > 0)
// [ { id: 'Story:456', changeSetCount: 10 } ]
```
The argument to the filter function is function that takes an element as a parameter and is also known as a predicate.
The result of its invocation is a boolean value indicating whether the element should be included in the resulting
array. The element is included in the resulting array only if the result is truthy, and otherwise the result will be
filtered out and not be included in the resulting array.

## some and every
In some cases we need to know if every element in an array satisfies a predicate. In other cases we would like to know
if at least one element in the array satisfies a predicate. We can use the `every` and `some` functions on the array
prototype!
```js
const every = [1, 2, 3].every(e >= 0);
const some = [1, 2, 3].some(e > 2);
```


## reduce
Reduce is another powerful operation that I often use. Reduce is helpful when coalescing an array into a single value.
Its signature is slightly different from map and filter. Reduce is a function on the array prototype. It results in a new
array and accepts two arguments, a function and a starting value. The first argument is a function that accepts four
arguments: The coalesced value, the current element in the original array, an index of iteration, and the original array.
Often you will see the third and forth parameter omitted from the signature if they are unused.
```js
const stories = [
    { id: 'Story:123', changeSetCount: 2 },
    { id: 'Story:456', changeSetCount: 10 }
]
const totalChangeSets = stories.reduce((sum, story) => sum + story.changeSetCount, 0)
// 12
```
In this example we are taking a collection of integers and coalescing them into a sum. The original array is a list of stories.
The first argument is the function `(sum, story) => sum + story.changeSetCount` describes how we will accumulate the sum over each iteration of the
original array, i.e. add each element of the array to a running total. The second argument is the starting value of the sum.
If the original array had no elements then the `totalChangeSets` would be 0.


## find
Finding a specific element in an array tends to be another common operation I find myself writing.
Find a person in an array where the name is `Story 2` or find the first non negative value in the array.
Find is a function on the array prototype that returns the first element in the array that matches some predicate.
The function accepts one argument a predicate.
```js
const stories = [{name: 'Story 1'}, {name: 'Story 2'}];
const story = stories.find(e => e.name === 'Story 2');
// {name: 'Story 2'}
```

## find index
Sometimes when finding an element in an array we only care to know its position in the array.
findIndex allows us to use a predicate to find the first element in the array that satisfies a condition
but only return its index in the array.
```js
const index = [5, 9, 2].findIndex(e => e % 2 === 0);
```

## distinct
Getting unique values from an array has never been easier. When leveraging a `Set`, by definition having distinct elements,
and spread operator we can retrieve unique members of an array.
```js
const unique = [...new Set([1, 2, 2, 3])]
// [1, 2, 3]
```


## select many
Coming from a background using C# and LINQ I find myself missing the `SelectMany` function.
Sometimes I have a homogeneous array such that each element is an object with a property that contains an array and
I want an array which contains every element from every nested array. An example may be an array of teams in which
every team has an array of members that have membership in the team. I may need to get one array that contains all members
across all teams. This can be accomplished using reduce!
```js
const teams = [
    { name: 'A', members: [ {name: 'Keith'}, {name: 'Cathy'} ] },
    { name: 'B', members: [ {name: 'Matt'} ] }
]
const members = teams.reduce(
    (members, team) => members.concat(team.members), []
);
//  [ {name: 'Keith'}, {name: 'Cathy'}, {name: 'Matt'} ]
```