"use strict"

function logMsg(msg) {
  console.log(msg)
}


class Throttler {
  next = 0;
  results = [];
  addResult(result) {
    this.results.push(result);
  }

  getNext() {
    return this.next++;
  }

  async runNextPromise(promises) {
    const next = this.getNext();
    if (next < promises.length) {
      logMsg(`\t\trunning next ${next}`)
      var ret = await promises[next]().then(async (result) => { await this.runNextPromise(promises); return result; } );
      logMsg(`\t\treturning ${ret}`);
      this.addResult(ret);
      return ret;
    }
    else {
      logMsg("\t\tending leaf promise")
    }
  }

  async runThrottledPromises(promises, throttle) {
    try {
      this.next = throttle;
      const ret = await Promise.all(
        promises.slice(0, throttle).map(
          (p) => p().then(async (result) => { await this.runNextPromise(promises); return result; })
        )
      );
      logMsg(`ret is ${ret}`)
      return ret.concat(this.results);
    }
    catch (error) {
      logMsg("Error" + error);
    }
  }
}


/////////////////// Test

var promises = [];

async function getValue(i) {
  var sleepy = Math.round(2 * Math.random());
  logMsg(`\t\t\t>> ${i} then sleep for ${sleepy}`);

  await new Promise((resolve, reject) => {
    setTimeout(() => { resolve() }, 1000 * sleepy)
  });

  logMsg(`\t\t\t<< ${i}`);
  return 100 * i;
}

// populate list
try {

  for (var i = 0; i < 10; i++) {
    var f = getValue.bind(getValue, i)
    promises.push(f)
  }
}
catch (error) {
  logMsg("Error" + error);
}

var throttler = new Throttler();
throttler.runThrottledPromises(promises, 5).then((result) => { logMsg(`In THEN with ${result}, ${result.length}`) });

