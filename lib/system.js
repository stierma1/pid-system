require("babel-polyfill")
import {EventEmitter} from "events"
import util from "util"
import fs from "fs";
import path from "path"
import express from "express"

var SYSTEM_NODE = {};

var pidNum = 0;
var _systemRegister = {};
var systemConfig;
try{
  systemConfig = fs.readFileSync(path.join(process.cwd(), "pid-sys-config.json"));
  systemConfig = JSON.parse(systemConfig);
} catch(err){

}

export default class System{
  constructor(){}

  static setConfig(config){
    systemConfig = config;
  }

  static getConfig(){
    return systemConfig;
  }

  static startServer(){
    if(process && process.arch && typeof(express) === "function"){
      var app = express();
      app.get("/pids/:id/stats", function(req, res){
        if(!_systemRegister[req.params.id]){
          res.status(404).end();
          return;
        }
        statsView.call(_systemRegister[req.params.id], [req, res]);
      });
      app.get("/pids", function(req, res){
        var keys = [];
        for(var i in _systemRegister){
          keys.push(i);
        }
        var anchors = keys.reduce(function(red, v){
          red += `<li>
            <a href="/pids/${v}/stats">/pids/${v}/stats</a>
          </li>`
          return red;
        }, '')
        var body = `<html>
          <head><title>pid-system</title></head>
          <body>
            <ol>${anchors}</ol>
          </body>
        </html>`
        res.status(200).send(body);
      });

      app.post("/pids/:id/:view", function(req, res){
        if(!_systemRegister[req.params.id]){
          res.status(404).end();
          return;
        }
        if(!_systemRegister[req.params.id].view(["post", req.params.view, req, res])){
          res.status(404).end();
          return;
        }
      })
      app.get("/pids/:id/:view", function(req, res){
        if(!_systemRegister[req.params.id]){
          res.status(404).end();
          return;
        }
        if(!_systemRegister[req.params.id].view(["get",req.params.view, req, res])){
          res.status(404).end();
          return;
        }
      })
      app.put("/pids/:id/:view", function(req, res){
        if(!_systemRegister[req.params.id]){
          res.status(404).end();
          return;
        }
        if(!_systemRegister[req.params.id].view(["put",req.params.view, req, res])){
          res.status(404).end();
          return;
        }
      })
      app.delete("/pids/:id/:view", function(req, res){
        if(!_systemRegister[req.params.id]){
          res.status(404).end();
          return;
        }
        if(!_systemRegister[req.params.id].view(["delete",req.params.view, req, res])){
          res.status(404).end();
          return;
        }
      })

      app.listen(6565)
    }

    var statsView = function(params){
      var [req, res] = params;
      if(!res){
        return;
      }
      if(req && req.headers && req.headers["Accepts"] && req.headers["Accepts"].indexOf("json")){
        res.status(200).json({
          id:this.id,
          module:this._module,
          "function": this._func,
          stats:this.dictionary.__.stats,
          dictionary:this.dictionary
        })
      } else {
        var tableRows = "";
        for(var i in this.dictionary){
          tableRows += `<tr><td>${i}</td><td>${this.dictionary[i]}</td></tr>`;
        }
        res.status(200).send(`<html>
            <head>
              <title>pid-system</title>
            </head>
            <body>
              <h2>${this.id}</h2>
              <div>
                <label>Module:</label>${this._module}
              </div>
              <div>
                <label>Function:</label>${this._func}
              </div>
              <div>
                <label>Spawn Date:</label>
                ${this.dictionary.__.stats.spawnDate.toISOString()}
              </div>
              <div>
                <label>Message Count:</label>
                ${this.dictionary.__.stats.messageCount}
              </div>
              <h3>Dictionary</h3>
              <table>
                <tr><th>Key</th><th>Value</th></tr>
                ${tableRows}
              </table>
            </body>
          </html>`)
          return;
      }
    }
  }

  static register(name, pid){
    System.syslog("info", [undefined, "register", name + " = " + pid.id]);
    return Registry.register(name, pid);
  }

  static unregister(name){
    System.syslog("info", [undefined, "unregister", name]);
    return Registry.unregister(name);
  }

  static resolve(name){
    return Registry.resolve(name);
  }

  static whereis(name){
    return Registry.whereis(name);
  }

  static getRegistry(){
    return Registry.getRegistry();
  }

  static spawn(mod, func, dict, views){
    var diction = dict || {}
    diction.__ = {}
    diction.__.stats = {
      messageCount:0,
      spawnDate: new Date(),
    }

    diction.exitExplicit = diction.exitExplicit || false;
    return Pid.spawn(SYSTEM_NODE, mod, func, "init", diction, views).then(function(pid){
      _systemRegister[pid.id] = pid;
      return pid;
    })
  }

  static receive(pid, after, func){
    return pid.blockForMessage(after, func);
  }

  static syslog(logLevel, params){
    if(systemConfig && systemConfig.silent){
      return
    }
    var [pidId, headline, ...body] = params;
    var logString = "(" + (pidId || "UNKNOWN") + ")[" + logLevel.toUpperCase() + "]" + new Date().toISOString() + ":" + headline + "|" + body.join(" ");

    if(systemConfig && systemConfig.systemLogFileLocation){
      fs.appendFile(path.join(process.cwd(), systemConfig.systemLogFileLocation), logString + "\n", function(){});
      return;
    }
    console.log(logString);
  }

  static log(pid, logLevel, message){
    if(systemConfig && systemConfig.silent){
      return
    }
    var logString = "(" + (pid.id || "UNKNOWN") + ")[" + logLevel.toUpperCase() + "]" + new Date().toISOString()  + ":" + message;
    if(systemConfig && systemConfig.appLogFileLocation){
      fs.appendFile(path.join(process.cwd(), systemConfig.appLogFileLocation), logString + "\n", function(){});
      return;
    }
    console.log(logString);
  }

  static recurse(pid, func){
    if(pid.state === "up"){
      pid.keepAlive = true;
      process.nextTick(function(){
        func.call(pid)
        .then(function(){
          if(!pid.keepAlive && !pid.dictionary.exitExplicit && pid.state === "up"){
            System.exit(pid, "normal");
          }
          pid.keepAlive = false;
        })
      });
    }
  }

  static send(pid, message){

    return Promise.resolve().then(() => {
      if(typeof(pid) === "string"){
        return System.resolve(pid);
      }
      return pid
    })
    .then((truePid) => {
      if(truePid){
        if(pid.dictionary.debug){
          System.syslog("debug", [pid.id, "send", util.inspect(message)]);
        }
        truePid.dictionary.__.stats.messageCount++;
        return truePid.send(message);
      }
    })
  }

  static async Monitor(pid, state, cb){
    var monObject = {
      active:true,
      _cb:cb
    }

    if(pid.state === "up"){
      pid.once("exit", function(_state, reason){
        if((state === "_" || state === _state) && monObject.active){
          monObject._cb(_state, reason);
        }
      })
    } else {
      if((state === "_" || state === pid.state) && monObject.active){
        monObject._cb(state, pid.reason);
      }
    }

    return monObject;
  }

  static async exit(pid, state, reason){
    setTimeout(function(){
      delete _systemRegister[pid.id]
    }, 10000);
    NodeGateway.removeCommunitcationChannel(pid);
    if(state === undefined){
      return pid.exit("normal", undefined, true);
    }
    return pid.exit(state,reason, true);
  }

}

export class Pid extends EventEmitter{
  constructor(config){
    super(config)
    this.keepAlive = false;
    this.id = config.id || (config.node !== SYSTEM_NODE ? config.node : "system") + "-" + config.clusterCookie + "-" + pidNum++;
    this.state = "up";
    this.dictionary = config.dictionary || {};
    this.mailbox = [];
    this.node = config.node;
    this.clusterCookie = config.clusterCookie;
    this._module = config.mod;
    this._func = config.func;
    this.defer = null;
    this.views = {};
    for(var i in config.views){
      for(var j in config.views[i]){
        this.views[i] = this.views[i] || {};
        this.views[i][j] = config.views[i][j].bind(this);
      }
    }
  }

  static async spawn(node, mod, func, clusterCookie, dict, views){
    var pid = new Pid({mod:mod, func:func, node:node, clusterCookie:clusterCookie, dictionary:dict, views:views});
    NodeGateway.addCommunicationChannel(node, pid.id, pid);
    pid.process();
    return pid;
  }

  async send(message){
    if(message === null || message === undefined){
      throw new Error("Message cannot be null");
    }

    var commChannel = await NodeGateway.getCommunicationChannel(this.node, this.clusterCookie, this.id);
    await commChannel.send(message);
  }

  process(){
    var self = this;
    if(this.dictionary.debug){
      System.syslog("debug", [this.id, "process", "processing"]);
    }
    try{
      if(GroupControls[this._module] === this._func){
        return GroupControls[this._module].call(this)
          .then(function(ret){
            if(!self.keepAlive && !self.dictionary.exitExplicit && self.state === "up"){
              System.exit(self, "normal");
            }
            self.keepAlive = false;
          })
          .catch(function(){
            self.error(err,true);
          })
      } else if(this._func){
        return require(this._module)[this._func].call(this)
          .then(function(ret){
            if(!self.keepAlive && !self.dictionary.exitExplicit && self.state === "up"){
              System.exit(self, "normal");
            }
            self.keepAlive = false;
          })
          .catch(function(err){
            self.error(err, true);
          });
      } else {
        return require(this._module).call(this)
          .then(function(ret){
            if(!self.keepAlive && !self.dictionary.exitExplicit && self.state === "up"){
              System.exit(self, "normal");
            }
            self.keepAlive = false;
          })
          .catch(function(err){
            self.error(err, true);
          });
      }
    } catch(err){
      this.error(err, true);
    }
  }

  blockForMessage(after, func){
    if(this.state !== "up"){
      System.syslog("info", [this.id, "blockForMessage", "block for message invoked on a non running process"]);
      return;
    }
    if(after && !func){
      throw new Error("Cannot have 'after' defined without a function to go with it");
    }

    if(this.mailbox.length > 0){
      var message = this.mailbox.shift();
      return message;
    } else {
      var resTriggered = false;
      return new Promise((res, rej) => {
        this.defer = (val) =>{
          if(this.dictionary.debug){
            System.syslog("debug", [this.id, "defer resolved", "defer resolved - timeout: " + resTriggered]);
          }
          resTriggered = true;
          res(val)
        };
        if(after && after.timeout){
          setTimeout(() => {
            if(!resTriggered){
              System.syslog("info", [this.id, "timeout", "process timeout reached"]);
              resTriggered = true;
              this.defer = null;
              res(true);
            }
          }, after.timeout);
        }
      }).then((afterTriggered) => {
        this.defer = null;
        if(afterTriggered){
          if(after.retry > 0){
            return this.blockForMessage({timeout:after.timeout, retry:(after.retry - 1) || 0}, func);
          } else {
            func.call(this);
            return;
          }
        }
        return this.blockForMessage();
      })
    }
  }

  receive(message){
    if(this.dictionary.debug){
      System.syslog("debug", [this.id, "receive", util.inspect(message)]);
    }
    this.mailbox.push(message);

    if(this.defer){
      this.defer();
    }
  }

  view(message){
    var [method, name, ...rest] = message;
    if(this.views[method] && this.views[method][name]){
      this.views[method][name](rest);
      return true;
    }
    return false;
  }

  serializish(){
    return {
      id: this.id,
      node: this.node,
      clusterCookie: this.clusterCookie,
      mod: this._module,
      func: this._func,
      state: this.state,
      dictionary: this.dictionary
    };
  }

  deserialize(data){
    return new Pid(data);
  }

  exit(state, reason, catchProcess){
    this.state = state;
    this.reason = reason;
    if(this.dictionary.debug || reason){
      System.syslog("info", [this.id, "exit", state, reason])
    }
    this.emit("exit", state, reason);
    if(!catchProcess){
      throw this;
    }
  }

  error(err, catchProcess){
    System.syslog("error", [this.id, "error", err]);
    return System.exit(this, "error", err, catchProcess);
  }

  putValue(key, value){
    var old = this.dictionary[key];
    this.dictionary[key] = value;
    return old;
  }

  getValue(key){
    return this.dictionary[key];
  }

  erase(key){
    if(key === undefined){
      this.dictionary = {};
    } else {
      delete this.dictionary[key];
    }
  }

}

var registry = {};

export class Registry{
  constructor(){
  }

  static async register(name, pid){
    if(await Registry.whereis(name)){
      await Registry.unregister(name);
    }
    registry[name] = pid;
  }

  static async whereis(name){
    var pid = await Registry.resolve(name);
    if(pid){
      return pid.node;
    }
  }

  static async unregister(name){
    if(registry[name]){
      delete registry[name];
    }
  }

  static async getRegistry(){
    return registry;
  }

  static async resolve(name){
    return registry[name];
  }
}

var nodes = [];
var sysNodes = [];
export class NodeGateway{
  constructor(node){
    this.nodes = {};
  }

  static getCommunicationChannel(node, cookie, id){
    if(node === SYSTEM_NODE){
      return sysNodes[id];
    }
    return nodes[node][id];
  }

  static addCommunicationChannel(node, id, pid){
    if(node === SYSTEM_NODE){
      sysNodes[id] = new CommunicationChannel(pid);
      return
    }
    nodes[node] = nodes[node] || {};
    nodes[node][id] = new CommunicationChannel(pid);
  }

  static removeCommunitcationChannel(pid){
    if(pid.node === SYSTEM_NODE){
      delete sysNodes[pid.id];
      return;
    }
    if(nodes[pid.node] && nodes[pid.node][pid.id]){
      delete nodes[pid.node][pid.id];
    }
  }
}

export class CommunicationChannel{
  constructor(pid){
    this.pid = pid;
  }

  send(message){
    this.pid.receive(message);
  }

}

var GroupControls = {

  race: async function() {
    var [caller, racers, options] = await System.receive(this);
    var message = await System.receive(this);

    racers.map(async (pid) => {
      var returnPid = await System.spawn(SYSTEM_NODE, "_receiver", GroupControls._receiver, {exitExplicit:true})
      System.send(returnPid, [this, options]);
      System.send(pid, [message, returnPid]);
    });

    var awaits = racers.length;
    while(awaits > 0){
      var [status, messageResponse] = await System.receive(this);
      if(status === "OK"){
        break;
      } else {
        awaits--;
      }
    }

    if(awaits === 0){
      System.send(caller, ["ERR", "timeout"]);
    } else {
      System.send(caller, ["OK", messageResponse]);
    }

    System.exit(this);
  },

  fallback: async function() {
    var [caller, fallbacks, options] = await System.receive(this);
    var message = await System.receive(this);
    var messageResponse = null;
    var awaits = fallbacks.length;

    while(awaits > 0){
      var returnPid = await System.spawn(SYSTEM_NODE, "_receiver", GroupControls._receiver, {exitExplicit:true})
      System.send(returnPid, [this, options]);
      System.send(fallbacks[fallbacks.length - awaits], [message, returnPid]);

      var [status, messageResponse] = await System.receive(this);
      if(status === "OK"){
        break;
      } else {
        awaits--;
      }
    }

    if(awaits === 0){
      System.send(caller, ["ERR", "timeout"]);
    } else {
      System.send(caller, ["OK", messageResponse]);
    }
    System.exit(this);
  },

  all: async function() {
    var [caller, endpoints, options] = await System.receive(this);
    var message = await System.receive(this);

    var self = this;
    endpoints.map(async (pid, idx) => {
      var returnPid = await System.spawn(SYSTEM_NODE, "_receiver", GroupControls._receiver, {exitExplicit:true});
      var opt = (options && options[idx]) || {};
      opt.idx = idx;
      System.send(returnPid, [self, opt]);
      System.send(pid, [message[idx], returnPid]);
    });

    var awaits = endpoints.length;
    var isError = false;
    var responses = [];

    while(awaits > 0){
      var [status, messageResponse, idx] = await System.receive(this);
      if(status === "OK"){
        responses[idx] = messageResponse;
      } else {
        if(!(options[idx] && options[idx].optional)){
          isError = true;
        }
        responses[idx] = messageResponse;
      }
      awaits--;
    }

    if(isError){
      System.send(caller, ["ERR", responses]);
    } else {
      System.send(caller, ["OK", responses]);
    }
    System.exit(this);
  },

  _receiver: async function() {
    var [caller, options] = await System.receive(this);
    options = options || {};
    var message = await System.receive(this, {
      timeout: options.timeout || 20000
    }, () => {
      System.send(caller, ["ERR", new Error("timeout"), options.idx])
      System.exit(this);
    });
    System.send(caller, ["OK", message, options.idx]);
    System.exit(this);
  },

  _promised: async function(){
    var [res, rej] = await System.receive(this);
    var [status, message] = await System.receive(this);
    if(status === "OK"){
      res([status, message]);
    } else {
      rej([status, message]);
    }
    System.exit(this);
  }
}

System.GroupControls = {};

System.GroupControls.all = async (caller, pids, options) => {
  if(!(pids instanceof Array)){
    throw new Error("pids must be an array")
  }
  if(pids.length === 0){
    throw new Error("Pids cannot be empty array");
  }
   var allPid = await System.spawn(SYSTEM_NODE, "all", GroupControls.all);
   System.send(allPid, [caller, pids, options]);
   return allPid;
}

System.GroupControls.allAsync = (message, pids, options) => {
  return new Promise(async (res, rej) => {
    if(!(pids instanceof Array)){
      throw new Error("pids must be an array")
    }
    if(pids.length === 0){
      throw new Error("Pids cannot be empty array");
    }

    var promisedPid = await System.spawn(SYSTEM_NODE, "_promised", GroupControls._promised, {exitExplicit:true});
    System.send(promisedPid, [res, rej]);
    var allPid = await System.GroupControls.all(promisedPid, pids, options);
    System.send(allPid, message);
  });

}

System.GroupControls.fallback = async (caller, pids, options) => {
  if(!(pids instanceof Array)){
    throw new Error("pids must be an array")
  }
  if(pids.length === 0){
    throw new Error("Pids cannot be empty array");
  }
   var fallBackPid = await System.spawn(SYSTEM_NODE, "fallback", GroupControls.fallback);
   System.send(fallBackPid, [caller, pids, options]);
   return fallBackPid;
}

System.GroupControls.fallBackAsync = (message, pids, options) => {
  return new Promise(async (res, rej) => {
    if(!(pids instanceof Array)){
      throw new Error("pids must be an array")
    }
    if(pids.length === 0){
      throw new Error("Pids cannot be empty array");
    }

    var promisedPid = await System.spawn(SYSTEM_NODE, "_promised", GroupControls._promised, {exitExplicit:true});
    System.send(promisedPid, [res, rej]);
    var fallBackPid = await System.GroupControls.fallback(promisedPid, pids, options);
    System.send(fallBackPid, message);
  });
}

System.GroupControls.race = async (caller, pids, options) => {
  if(!(pids instanceof Array)){
    throw new Error("pids must be an array")
  }
  if(pids.length === 0){
    throw new Error("Pids cannot be empty array");
  }
   var racePid = await System.spawn(SYSTEM_NODE, "race", GroupControls.race, {debug:false});
   System.send(racePid, [caller, pids, options]);
   return racePid;
}

System.GroupControls.raceAsync = (message, pids, options) => {
  return new Promise(async (res, rej) => {
    if(!(pids instanceof Array)){
      throw new Error("pids must be an array")
    }
    if(pids.length === 0){
      throw new Error("Pids cannot be empty array");
    }

    var promisedPid = await System.spawn(SYSTEM_NODE, "_promised", GroupControls._promised, {exitExplicit:true});
    System.send(promisedPid, [res, rej]);
    var racePid = await System.GroupControls.race(promisedPid, pids, options);
    System.send(racePid, message);
  });
}

System.GroupControls.random = async (caller, pids, options) => {
  if(!(pids instanceof Array)){
    throw new Error("pids must be an array")
  }
  if(pids.length === 0){
    throw new Error("Pids cannot be empty array");
  }
   var randomPid = await System.spawn(SYSTEM_NODE, "fallback", GroupControls.fallback, {debug:false});
   System.send(randomPid, [caller, shuffleArray(pids), options]);
   return randomPid;
}

System.GroupControls.randomAsync = (message, pids, options) => {
  return new Promise(async (res, rej) => {
    if(!(pids instanceof Array)){
      throw new Error("pids must be an array")
    }
    if(pids.length === 0){
      throw new Error("Pids cannot be empty array");
    }

    var promisedPid = await System.spawn(SYSTEM_NODE, "_promised", GroupControls._promised, {exitExplicit:true});
    System.send(promisedPid, [res, rej]);
    var randomPid = await System.GroupControls.random(promisedPid, pids, options);
    System.send(randomPid, message);
  });
}


function shuffleArray(arr) {
  var array = arr.concat([]);
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}
