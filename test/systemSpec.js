require("babel-polyfill")
import chai from "chai"
import System from "../built/system"
import path from "path"

var expect = chai.expect;
var continuousModulePath = path.join(__dirname, "modules", "continuous.js");
var oneAndDoneModulePath = path.join(__dirname, "modules", "one-and-done.js");

describe("#System.spawn", async function(){
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
})
