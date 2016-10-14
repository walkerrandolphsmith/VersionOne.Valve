import { Throttler, runThrottledPromises } from "./throttler"

var promises = [];

async function getValue(i) {

  var sleepy = Math.round(2 * Math.random());
  console.log(`\t\t\t>> ${i} then sleep for ${sleepy}`);

  await new Promise((resolve, reject) => {
    setTimeout(() => { resolve() }, 1000 * sleepy)
  });

  console.log(`\t\t\t<< ${i}`);
  return 100 * i;
}

async function crash() {
  console.log("#### About to crash!");
  throw "ow!"
}

// populate list
try {

  for (var i = 0; i < 10; i++) {
    var f = getValue.bind(getValue, i)
    promises.push(f)
  }
}
catch (error) {
  console.log("Error" + error);
}

promises.push(crash);

try {
  runThrottledPromises(promises, 5, false)
    .then((result) => console.log("All done " + result))
    .catch((reason) => console.log("Caught error!  " + reason));
}
catch (error) {
  console.log("Error from run " + error)
}
