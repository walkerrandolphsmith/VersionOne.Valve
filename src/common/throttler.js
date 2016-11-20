class Throttler {
  next = 0;
  results = [];
  verbose = false;
  addResult(result) {
    this.results.push(result);
  }

  logMsg(msg) {
    if (this.verbose)
      console.log(msg)
  }

  getNext() {
    return this.next++;
  }

  async runNextPromise(promises) {
    const next = this.getNext();
    if (next < promises.length) {
      this.logMsg(`\t\trunning next promise: ${next}`)
      try {
        var ret = await promises[next]().then(async (result) => { await this.runNextPromise(promises); return result; });
        this.logMsg(`\t\treturning ${ret}`);
        this.addResult(ret);
        return ret;
      }
      catch (error) {
        console.log("Error in runNext: "+error)
        throw error
      }
    }
    else {
      this.logMsg("\t\tending leaf promise")
    }
  }

  async runThrottledPromises(promises, throttle, verbose = false) {
    if (typeof promises === 'undefined' || promises === null || promises.length === 0)
      throw "Promises must be an array with something in it."
    if (typeof throttle === 'undefined' || throttle < 1)
      throw "Throttle must be greater than zero."

    try {
      this.verbose = verbose;
      this.logMsg(`Throttler running ${promises.length} promises, ${throttle} at a time`);

      this.next = throttle;
      const ret = await Promise.all(
        promises.slice(0, throttle).map(
          (p) => p().then(async (result) => { await this.runNextPromise(promises); return result; })
        )
      );
      this.logMsg(`ret is ${ret}`)
      return ret.concat(this.results);
    }
    catch (error) {
      console.log("Error in runThrottledPromises: " + error);
      throw error;
    }
  }
}

export default async function runThrottledPromises(promises, throttle = 0, verbose = false) {
  try {
    return await new Throttler().runThrottledPromises(promises, throttle, verbose)
  }
  catch (error) {
    throw (error);
  }
}
