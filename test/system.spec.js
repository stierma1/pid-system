require("babel-polyfill")
import chai from "chai"
import System from "../built/system"
import path from "path"

var expect = chai.expect;
var continuousModulePath = path.join(__dirname, "modules", "continuous.js");
var oneAndDoneModulePath = path.join(__dirname, "modules", "one-and-done.js");

describe("#System", async function(){
  var cleanUpPids = [];

  beforeEach(function(){

  })

  afterEach(function(){
    cleanUpPids.map(function(pid){
      System.exit(pid);
    })
    cleanUpPids = [];
  })

  it("spawn must create a pid", async function(){
    var pid = await System.spawn(oneAndDoneModulePath, "one");
    cleanUpPids.push(pid)
    expect(pid).to.have.property("state").equal("up");
  })

  it("exit must shut down a pid", async function(){
    var pid = await System.spawn(oneAndDoneModulePath, "one");
    cleanUpPids.push(pid)
    expect(pid).to.have.property("state").equal("up");
    await System.exit(pid);
    expect(pid).to.have.property("state").equal("normal")
  })

  it("register and resolve must allow fetching of pids by name", async function(){
    var pid = await System.spawn(oneAndDoneModulePath, "one");
    cleanUpPids.push(pid)
    await System.register("test", pid);
    var secondPid = await System.resolve("test");
    expect(pid).to.equal(secondPid);
  })

  it("unregister must remove pid from registry", async function(){
    var pid = await System.spawn(oneAndDoneModulePath, "one");
    cleanUpPids.push(pid)
    await System.register("test", pid);
    await System.unregister("test");
    var secondPid = await System.resolve("test");
    expect(secondPid).to.be.undefined;
  })

  it("receive and send must allow message passing between pids", async function(){
    var one = await System.spawn(oneAndDoneModulePath, "one");
    var done = await System.spawn(oneAndDoneModulePath, "done");
    cleanUpPids.push(one)
    cleanUpPids.push(done)
    var prom = new Promise((res) =>{
      System.send(done, res);
    });
    System.send(one, [0, done]);
    var [status, val] = await prom;
    expect(val).to.equal(1)
  })

  it("receiveWatch and send must allow message passing between pids", async function(){
    var watch = await System.spawn(oneAndDoneModulePath, "watch");
    var error = await System.spawn(oneAndDoneModulePath, "error");
    var done = await System.spawn(oneAndDoneModulePath, "done");
    cleanUpPids.push(watch)
    cleanUpPids.push(error)
    cleanUpPids.push(done)
    System.send(watch, error);
    System.send(watch, done);
    var prom = new Promise((res) =>{
      System.send(done, res);
    });
    System.send(error, []);
    var [source, status, val] = await prom;
    expect(source).to.equal(System.Monitor)
    expect(status).to.equal("error")
  })

  it("receive must allow for timeout", async function(){
    var timeout = await System.spawn(oneAndDoneModulePath, "timeout");
    var done = await System.spawn(oneAndDoneModulePath, "done");
    cleanUpPids.push(timeout)
    cleanUpPids.push(done)
    var prom = new Promise((res) =>{
      System.send(done, res);
    });
    System.send(timeout, done);
    var [status, val] = await prom;
    expect(val).to.equal("timeout")
  })

  it("recurse must allow pid to restart", async function(){
    var echo = await System.spawn(continuousModulePath, "echo");
    var done = await System.spawn(oneAndDoneModulePath, "done");
    var done2 = await System.spawn(oneAndDoneModulePath, "done");
    cleanUpPids.push(echo)
    cleanUpPids.push(done)
    cleanUpPids.push(done2)
    var prom1 = new Promise((res) =>{
      System.send(done, res);
    });
    var prom2 = new Promise((res) =>{
      System.send(done2, res);
    });

    System.send(echo, ["1", done]);
    var [status, message] = await prom1;
    expect(message).to.equal("1");

    System.send(echo, ["2", done2]);
    var [status, message] = await prom2;
    expect(message).to.equal("2");

  })

  it("promote must create pid out of function", async function(){
    var done = await System.spawn(oneAndDoneModulePath, "done");
    cleanUpPids.push(done)
    var prom1 = new Promise((res) =>{
      System.send(done, res);
    });

    var myFunc = async function(param1){
      return param1
    }
    var pid = await System.promote("myFunc", myFunc);
    cleanUpPids.push(pid);

    System.send(pid, [done, "I are done"])

    var message = await prom1;
    expect(message).to.equal("I are done");

  })

})

describe("#Monitor", async function(){
  var cleanUpPids = [];

  beforeEach(function(){

  })

  afterEach(function(){
    cleanUpPids.map(function(pid){
      System.exit(pid);
    })
    cleanUpPids = [];
  })

  it("must invoke callback when state changes", async function(){
    var errorPid = await System.spawn(oneAndDoneModulePath, "error");
    cleanUpPids.push(errorPid)
    return new Promise(function(res){
      System.Monitor(errorPid, "_", function(state, err){
        expect(err).to.be.instanceof(Error);
        res();
      })

      System.send(errorPid, []);
    })
  });

  it("must invoke callback only when state is matched", async function(){
    var errorPid = await System.spawn(oneAndDoneModulePath, "error");
    cleanUpPids.push(errorPid)
    return new Promise(function(res, rej){
      System.Monitor(errorPid, "ok", function(state, err){
        expect(err).to.be.instanceof(Error);
        rej();
      });

      setTimeout(function(){
        res();
      }, 100);

      System.send(errorPid, []);
    })
  });

  it("must invoke callback when pid is already exitted", async function(){
    var errorPid = await System.spawn(oneAndDoneModulePath, "error");
    cleanUpPids.push(errorPid)
    await System.send(errorPid, []);
    return new Promise(function(res){
      setTimeout(function(){
        System.Monitor(errorPid, "_", function(state, err){
          expect(err).to.be.instanceof(Error);
          res();
        })
      },100)
    })
  });
});

describe("#GroupControls", async function(){
  var cleanUpPids = [];

  beforeEach(function(){

  })

  afterEach(function(){
    cleanUpPids.map(function(pid){
      System.exit(pid);
    })
    cleanUpPids = [];
  })

  it("race should return the message from the first completed pid", async function(){
    var fast = await System.spawn(oneAndDoneModulePath, "fast");
    var slow = await System.spawn(oneAndDoneModulePath, "slow");
    var done = await System.spawn(oneAndDoneModulePath, "done");
    var racePid = await System.GroupControls.race(done, [fast, slow]);

    cleanUpPids.push(fast)
    cleanUpPids.push(slow)
    cleanUpPids.push(done)
    cleanUpPids.push(racePid)

    var prom = new Promise((res) =>{
      System.send(done, res);
    });

    System.send(racePid, "go");
    var [status, val] = await prom;

    expect(val).to.equal("go fast")
  })

  it("all should return all values from completed pids", async function(){
    var fast = await System.spawn(oneAndDoneModulePath, "fast");
    var slow = await System.spawn(oneAndDoneModulePath, "slow");
    var done = await System.spawn(oneAndDoneModulePath, "done");
    var racePid = await System.GroupControls.all(done, [fast, slow]);

    cleanUpPids.push(fast)
    cleanUpPids.push(slow)
    cleanUpPids.push(done)
    cleanUpPids.push(racePid)

    var prom = new Promise((res) =>{
      System.send(done, res);
    });

    System.send(racePid, ["go", "move"]);
    var [status, [fastVal, slowVal]] = await prom;

    expect(fastVal).to.equal("go fast")
    expect(slowVal).to.equal("move slow")
  })

  it("all should return all values from completed pids including error", async function(){
    var fast = await System.spawn(oneAndDoneModulePath, "fast");
    var slow = await System.spawn(oneAndDoneModulePath, "slow");
    var errorD = await System.spawn(oneAndDoneModulePath, "errorD");
    var done = await System.spawn(oneAndDoneModulePath, "done");
    var racePid = await System.GroupControls.all(done, [fast, slow, errorD]);

    cleanUpPids.push(fast)
    cleanUpPids.push(slow)
    cleanUpPids.push(errorD)
    cleanUpPids.push(done)
    cleanUpPids.push(racePid)

    var prom = new Promise((res) =>{
      System.send(done, res);
    });

    System.send(racePid, ["go", "move", "i am"]);
    var [status, [fastVal, slowVal, [statusE, errorVal]]] = await prom;

    expect(status).to.equal("ERR")
    expect(fastVal).to.equal("go fast")
    expect(slowVal).to.equal("move slow")
    expect(errorVal).to.equal("i am error")
  })

  it("fallback should return the message from the first completed pid", async function(){
    var error = await System.spawn(oneAndDoneModulePath, "errorD");
    var slow = await System.spawn(oneAndDoneModulePath, "slow");
    var done = await System.spawn(oneAndDoneModulePath, "done");
    var fallbackPid = await System.GroupControls.fallback(done, [slow, error]);

    cleanUpPids.push(error)
    cleanUpPids.push(slow)
    cleanUpPids.push(done)
    cleanUpPids.push(fallbackPid)

    var prom = new Promise((res) =>{
      System.send(done, res);
    });

    System.send(fallbackPid, "go");
    var [status, val] = await prom;

    expect(val).to.equal("go slow")
  })

  it("random should return the message from the first completed pid", async function(){
    var error = await System.spawn(oneAndDoneModulePath, "errorD");
    var slow = await System.spawn(oneAndDoneModulePath, "slow");
    var done = await System.spawn(oneAndDoneModulePath, "done");
    var randomPid = await System.GroupControls.random(done, [slow, error]);

    cleanUpPids.push(error)
    cleanUpPids.push(slow)
    cleanUpPids.push(done)
    cleanUpPids.push(randomPid)

    var prom = new Promise((res) =>{
      System.send(done, res);
    });

    System.send(randomPid, "go");
    var [status, val] = await prom;

    expect(val).to.equal("go slow")
  })
});
