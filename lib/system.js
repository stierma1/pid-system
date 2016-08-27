import _poly from "babel-polyfill"
import {EventEmitter} from "events"
import util from "util"
import fs from "fs";
import path from "path"
var pidNum = 0;

var systemConfig;
try{
  systemConfig = fs.readFileSync(path.join(process.cwd(), "pid-sys-config.json"));
  systemConfig = JSON.parse(systemConfig);
} catch(err){

}

export default class System{
  constructor(){}

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

  static spawn(node, mod, func, dict){

    return Pid.spawn(node, mod, func, "init", dict);
  }

  static receive(pid, after, func){
    return pid.blockForMessage(after, func);
  }

  static syslog(logLevel, params){
    var [pidId, headline, ...body] = params;
    var logString = "(" + (pidId || "UNKNOWN") + ")[" + logLevel.toUpperCase() + "]" + new Date().toISOString() + ":" + headline + "|" + body.join(" ");
    if(systemConfig && systemConfig.systemLogFileLocation){
      fs.appendFile(path.join(process.cwd(), systemConfig.systemLogFileLocation), logString + "\n", function(){});
      return;
    }
    console.log(logString);
  }

  static log(pid, logLevel, message){
    var logString = "(" + (pid.id || "UNKNOWN") + ")[" + logLevel.toUpperCase() + "]" + new Date().toISOString()  + ":" + message;
    if(systemConfig && systemConfig.appLogFileLocation){
      fs.appendFile(path.join(process.cwd(), systemConfig.appLogFileLocation), logString + "\n", function(){});
      return;
    }
    console.log(logString);
  }

  static recurse(pid, func){
    process.nextTick(function(){
      func.call(pid)
    });
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
        if(state === _state && monObject.active){
          monObject._cb(reason);
        }
      })
    } else {
      if(state === pid.state && monObject.active){
        monObject._cb(pid.reason);
      }
    }

    return monObject;
  }

  static async exit(pid, state, reason){
    if(state === undefined){
      return pid.exit("normal", undefined, true);
    }
    return pid.exit(state,reason, true);
  }
}

export class Pid extends EventEmitter{
  constructor(config){
    super(config)
    this.id = config.id || config.node + "-" + config.clusterCookie + "-" + pidNum++;
    this.state = "up";
    this.dictionary = config.dictionary || {};
    this.mailbox = [];
    this.node = config.node;
    this.clusterCookie = config.clusterCookie;
    this._module = config.mod;
    this._func = config.func;
    this.defer = null;
  }

  static async spawn(node, mod, func, clusterCookie, dict){
    var pid = new Pid({mod:mod, func:func, node:node, clusterCookie:clusterCookie, dictionary:dict});
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
    if(this.dictionary.debug){
      System.syslog("debug", [this.id, "process", "processing"]);
    }
    try{
      if(this._func){
        return require(this._module)[this._func].call(this);
      } else {
        return require(this._module).call(this);
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
    System.syslog("info", [this.id, "exit", state, reason])
    this.emit("exit", state, reason);
    if(!catchProcess){
      throw this;
    }
  }

  error(err, catchProcess){
    System.syslog("error", [this.id, "error", err]);
    return this.exit("error", err, catchProcess);
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

export class NodeGateway{
  constructor(node){
    this.nodes = {};
  }

  static getCommunicationChannel(node, cookie, id){
    return nodes[node][id];
  }

  static addCommunicationChannel(node, id, pid){
    nodes[node] = nodes[node] || {};
    nodes[node][id] = new CommunicationChannel(pid);
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
