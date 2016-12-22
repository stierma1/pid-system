"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EventEmitter = require("events").EventEmitter;
var util = require("util");
var fs = require("fs");
var path = require("path");
var express = require("express");

var SYSTEM_NODE = {};

var pidNum = 0;
var _systemRegister = {};
var systemConfig;
try {
  systemConfig = fs.readFileSync(path.join(process.cwd(), "pid-sys-config.json"));
  systemConfig = JSON.parse(systemConfig);
} catch (err) {
  systemConfig = { silent: true };
}

var System = function () {
  function System() {
    _classCallCheck(this, System);
  }

  _createClass(System, null, [{
    key: "setConfig",
    value: function setConfig(config) {
      systemConfig = config;
    }
  }, {
    key: "getConfig",
    value: function getConfig() {
      return systemConfig;
    }
  }, {
    key: "startServer",
    value: function startServer() {
      if (process && process.arch && typeof express === "function") {
        var app = express();
        app.get("/pids/:id/stats", function (req, res) {
          if (!_systemRegister[req.params.id]) {
            res.status(404).end();
            return;
          }
          statsView.call(_systemRegister[req.params.id], [req, res]);
        });
        app.get("/pids", function (req, res) {
          var keys = [];
          for (var i in _systemRegister) {
            keys.push(i);
          }
          var anchors = keys.reduce(function (red, v) {
            red += "<li>\n            <a href=\"/pids/" + v + "/stats\">/pids/" + v + "/stats</a>\n          </li>";
            return red;
          }, '');
          var body = "<html>\n          <head><title>pid-system</title></head>\n          <body>\n            <ol>" + anchors + "</ol>\n          </body>\n        </html>";
          res.status(200).send(body);
        });

        app.post("/pids/:id/:view", function (req, res) {
          if (!_systemRegister[req.params.id]) {
            res.status(404).end();
            return;
          }
          if (!_systemRegister[req.params.id].view(["post", req.params.view, req, res])) {
            res.status(404).end();
            return;
          }
        });
        app.get("/pids/:id/:view", function (req, res) {
          if (!_systemRegister[req.params.id]) {
            res.status(404).end();
            return;
          }
          if (!_systemRegister[req.params.id].view(["get", req.params.view, req, res])) {
            res.status(404).end();
            return;
          }
        });
        app.put("/pids/:id/:view", function (req, res) {
          if (!_systemRegister[req.params.id]) {
            res.status(404).end();
            return;
          }
          if (!_systemRegister[req.params.id].view(["put", req.params.view, req, res])) {
            res.status(404).end();
            return;
          }
        });
        app.delete("/pids/:id/:view", function (req, res) {
          if (!_systemRegister[req.params.id]) {
            res.status(404).end();
            return;
          }
          if (!_systemRegister[req.params.id].view(["delete", req.params.view, req, res])) {
            res.status(404).end();
            return;
          }
        });

        app.listen(6565);
      }

      var statsView = function statsView(params) {
        var _params = _slicedToArray(params, 2),
            req = _params[0],
            res = _params[1];

        if (!res) {
          return;
        }
        if (req && req.headers && req.headers["Accepts"] && req.headers["Accepts"].indexOf("json")) {
          res.status(200).json({
            id: this.id,
            module: this._module,
            "function": this._func,
            stats: this.dictionary.__.stats,
            dictionary: this.dictionary
          });
        } else {
          var tableRows = "";
          for (var i in this.dictionary) {
            tableRows += "<tr><td>" + i + "</td><td>" + this.dictionary[i] + "</td></tr>";
          }
          res.status(200).send("<html>\n            <head>\n              <title>pid-system</title>\n            </head>\n            <body>\n              <h2>" + this.id + "</h2>\n              <div>\n                <label>Module:</label>" + this._module + "\n              </div>\n              <div>\n                <label>Function:</label>" + this._func + "\n              </div>\n              <div>\n                <label>Spawn Date:</label>\n                " + this.dictionary.__.stats.spawnDate.toISOString() + "\n              </div>\n              <div>\n                <label>Message Count:</label>\n                " + this.dictionary.__.stats.messageCount + "\n              </div>\n              <h3>Dictionary</h3>\n              <table>\n                <tr><th>Key</th><th>Value</th></tr>\n                " + tableRows + "\n              </table>\n            </body>\n          </html>");
          return;
        }
      };
    }
  }, {
    key: "register",
    value: function register(name, pid) {
      System.syslog("info", [undefined, "register", name + " = " + pid.id]);
      return Registry.register(name, pid);
    }
  }, {
    key: "unregister",
    value: function unregister(name) {
      System.syslog("info", [undefined, "unregister", name]);
      return Registry.unregister(name);
    }
  }, {
    key: "resolve",
    value: function resolve(name) {
      return Registry.resolve(name);
    }
  }, {
    key: "whereis",
    value: function whereis(name) {
      return Registry.whereis(name);
    }
  }, {
    key: "getRegistry",
    value: function getRegistry() {
      return Registry.getRegistry();
    }
  }, {
    key: "spawn",
    value: function spawn(mod, func, dict, views) {
      var diction = dict || {};
      diction.__ = {};
      diction.__.stats = {
        messageCount: 0,
        spawnDate: new Date()
      };

      diction.exitExplicit = diction.exitExplicit || false;
      return Pid.spawn(SYSTEM_NODE, mod, func, "init", diction, views).then(function (pid) {
        _systemRegister[pid.id] = pid;
        return pid;
      });
    }
  }, {
    key: "promote",
    value: function () {
      var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(name, func, mode, dict, views) {
        var pid;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                dict = dict || {};

                dict._mode = mode || "receiver-in-message";
                _context.next = 4;
                return System.spawn(name, func, dict, views);

              case 4:
                pid = _context.sent;
                _context.next = 7;
                return System.register(name, pid);

              case 7:
                return _context.abrupt("return", pid);

              case 8:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function promote(_x, _x2, _x3, _x4, _x5) {
        return _ref.apply(this, arguments);
      }

      return promote;
    }()
  }, {
    key: "receive",
    value: function receive(pid, after, func) {
      return pid.blockForMessage(after, func);
    }
  }, {
    key: "receiveWatch",
    value: function receiveWatch(pid, watchPids, states, options, func) {

      return new Promise(function (res, rej) {
        var resolved = false;
        for (var i = 0; i < watchPids.length; i++) {
          var watchPid = watchPids[i];

          for (var j = 0; j < states[i].length; j++) {
            System.Monitor(watchPid, states[i][j], function (state, reason) {
              if (!resolved) {
                resolved = true;
                res([System.Monitor, state, reason]);
              }
            });
          }
        }

        pid.blockForMessage(options, function () {
          resolved = true;
          if (func) {
            func.apply(pid, arguments);
          }
        }).then(function (message) {
          resolved = true;
          res(message);
        });
      });
    }
  }, {
    key: "syslog",
    value: function syslog(logLevel, params) {
      if (systemConfig && systemConfig.silent) {
        return;
      }

      var _params2 = _toArray(params),
          pidId = _params2[0],
          headline = _params2[1],
          body = _params2.slice(2);

      var logString = "(" + (pidId || "UNKNOWN") + ")[" + logLevel.toUpperCase() + "]" + new Date().toISOString() + ":" + headline + "|" + body.join(" ");

      if (systemConfig && systemConfig.systemLogFileLocation) {
        fs.appendFile(path.join(process.cwd(), systemConfig.systemLogFileLocation), logString + "\n", function () {});
        return;
      }
      console.log(logString);
    }
  }, {
    key: "log",
    value: function log(pid, logLevel, message) {
      if (systemConfig && systemConfig.silent) {
        return;
      }
      var logString = "(" + (pid.id || "UNKNOWN") + ")[" + logLevel.toUpperCase() + "]" + new Date().toISOString() + ":" + message;
      if (systemConfig && systemConfig.appLogFileLocation) {
        fs.appendFile(path.join(process.cwd(), systemConfig.appLogFileLocation), logString + "\n", function () {});
        return;
      }
      console.log(logString);
    }
  }, {
    key: "recurse",
    value: function recurse(pid, func) {
      if (pid.state === "up") {
        pid.keepAlive = true;
        process.nextTick(function () {
          func.call(pid).then(function () {
            if (!pid.keepAlive && !pid.dictionary.exitExplicit && pid.state === "up") {
              System.exit(pid, "normal");
            }
            pid.keepAlive = false;
          });
        });
      }
    }
  }, {
    key: "send",
    value: function send(pid, message) {
      return Promise.resolve().then(function () {
        if (typeof pid === "string") {
          return System.resolve(pid);
        }
        return pid;
      }).then(function (truePid) {
        if (truePid) {
          if (pid.dictionary.debug) {
            System.syslog("debug", [pid.id, "send", util.inspect(message)]);
          }
          truePid.dictionary.__.stats.messageCount++;
          //console.log(message)
          return truePid.send(message);
        }
      });
    }
  }, {
    key: "Monitor",
    value: function () {
      var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(pid, state, cb) {
        var monObject;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                monObject = {
                  active: true,
                  _cb: cb
                };


                if (pid.state === "up") {
                  pid.once("exit", function (_state, reason) {
                    if ((state === "_" || state === _state) && monObject.active) {
                      monObject._cb(_state, reason);
                    }
                  });
                } else {
                  if ((state === "_" || state === pid.state) && monObject.active) {
                    monObject._cb(state, pid.reason);
                  }
                }

                return _context2.abrupt("return", monObject);

              case 3:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function Monitor(_x6, _x7, _x8) {
        return _ref2.apply(this, arguments);
      }

      return Monitor;
    }()
  }, {
    key: "exit",
    value: function () {
      var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(pid, state, reason) {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                setTimeout(function () {
                  delete _systemRegister[pid.id];
                }, 10000);
                NodeGateway.removeCommunitcationChannel(pid);

                if (!(state === undefined)) {
                  _context3.next = 4;
                  break;
                }

                return _context3.abrupt("return", pid.exit("normal", undefined, true));

              case 4:
                return _context3.abrupt("return", pid.exit(state, reason, true));

              case 5:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function exit(_x9, _x10, _x11) {
        return _ref3.apply(this, arguments);
      }

      return exit;
    }()
  }]);

  return System;
}();

module.exports = System;

var Pid = function (_EventEmitter) {
  _inherits(Pid, _EventEmitter);

  function Pid(config) {
    _classCallCheck(this, Pid);

    var _this = _possibleConstructorReturn(this, (Pid.__proto__ || Object.getPrototypeOf(Pid)).call(this, config));

    _this.keepAlive = false;
    _this.id = config.id || (config.node !== SYSTEM_NODE ? config.node : "system") + "-" + config.clusterCookie + "-" + pidNum++;
    _this.state = "up";
    _this.dictionary = config.dictionary || {};
    _this.mailbox = [];
    _this.node = config.node;
    _this.clusterCookie = config.clusterCookie;
    _this._module = config.mod;
    _this._func = config.func;
    _this.defer = null;
    _this.views = {};
    for (var i in config.views) {
      for (var j in config.views[i]) {
        _this.views[i] = _this.views[i] || {};
        _this.views[i][j] = config.views[i][j].bind(_this);
      }
    }
    _this.delayedMailbox = [];
    return _this;
  }

  _createClass(Pid, [{
    key: "send",
    value: function () {
      var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(message) {
        var commChannel;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                if (!(message === null || message === undefined)) {
                  _context4.next = 2;
                  break;
                }

                throw new Error("Message cannot be null");

              case 2:
                _context4.next = 4;
                return NodeGateway.getCommunicationChannel(this.node, this.clusterCookie, this.id);

              case 4:
                commChannel = _context4.sent;
                _context4.next = 7;
                return commChannel.send(message);

              case 7:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function send(_x12) {
        return _ref4.apply(this, arguments);
      }

      return send;
    }()
  }, {
    key: "delay",
    value: function delay(message) {
      this.delayedMailbox.push(message);
      return this;
    }
  }, {
    key: "processDelayed",
    value: function processDelayed() {
      var _this2 = this;

      this.delayedMailbox.map(function (message) {
        if (_this2.mailbox.length === 0) {
          _this2.receive(message);
        } else {
          setTimeout(function () {
            _this2.receive(message);
          }, 0);
        }
      });
      this.delayedMailbox = [];
      return this;
    }
  }, {
    key: "process",
    value: function process() {
      var self = this;
      if (this.dictionary.debug) {
        System.syslog("debug", [this.id, "process", "processing"]);
      }
      try {
        if (GroupControls[this._module] === this._func) {
          return GroupControls[this._module].call(this).then(function (ret) {
            if (!self.keepAlive && !self.dictionary.exitExplicit && self.state === "up") {
              System.exit(self, "normal");
            }
            self.keepAlive = false;
          }).catch(function () {
            self.error(err, true);
          });
        } else if (typeof this._func === "function") {
          return function () {
            var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5() {
              var message, out, _ref6, _ref7, receiver;

              return regeneratorRuntime.wrap(function _callee5$(_context5) {
                while (1) {
                  switch (_context5.prev = _context5.next) {
                    case 0:
                      if (!(self.state !== "up")) {
                        _context5.next = 2;
                        break;
                      }

                      return _context5.abrupt("return");

                    case 2:
                      if (!(self.dictionary.mode === "emitter")) {
                        _context5.next = 14;
                        break;
                      }

                      _context5.next = 5;
                      return System.receive(self);

                    case 5:
                      message = _context5.sent;

                      if (!(self.state !== "up")) {
                        _context5.next = 8;
                        break;
                      }

                      return _context5.abrupt("return");

                    case 8:
                      _context5.next = 10;
                      return this._func.apply(self, message);

                    case 10:
                      out = _context5.sent;

                      self.emit("data", out);
                      _context5.next = 26;
                      break;

                    case 14:
                      _context5.next = 16;
                      return System.receive(self);

                    case 16:
                      _ref6 = _context5.sent;
                      _ref7 = _toArray(_ref6);
                      receiver = _ref7[0];
                      message = _ref7.slice(1);

                      if (!(self.state !== "up")) {
                        _context5.next = 22;
                        break;
                      }

                      return _context5.abrupt("return");

                    case 22:
                      _context5.next = 24;
                      return this._func.apply(self, message);

                    case 24:
                      out = _context5.sent;

                      System.send(receiver, out);

                    case 26:
                      return _context5.abrupt("return", System.recurse(self, promotedFunction));

                    case 27:
                    case "end":
                      return _context5.stop();
                  }
                }
              }, _callee5, this);
            }));

            function promotedFunction() {
              return _ref5.apply(this, arguments);
            }

            return promotedFunction;
          }().call(this).then(function (ret) {
            if (!self.keepAlive && !self.dictionary.exitExplicit && self.state === "up") {
              System.exit(self, "normal");
            }
            self.keepAlive = false;
          }).catch(function (err) {
            self.error(err, true);
          });
        } else if (this._func) {
          return require(this._module)[this._func].call(this).then(function (ret) {
            if (!self.keepAlive && !self.dictionary.exitExplicit && self.state === "up") {
              System.exit(self, "normal");
            }
            self.keepAlive = false;
          }).catch(function (err) {
            self.error(err, true);
          });
        } else {
          return require(this._module).call(this).then(function (ret) {
            if (!self.keepAlive && !self.dictionary.exitExplicit && self.state === "up") {
              System.exit(self, "normal");
            }
            self.keepAlive = false;
          }).catch(function (err) {
            self.error(err, true);
          });
        }
      } catch (err) {
        this.error(err, true);
      }
    }
  }, {
    key: "blockForMessage",
    value: function blockForMessage(after, func) {
      var _this3 = this;

      if (this.state !== "up") {
        System.syslog("info", [this.id, "blockForMessage", "block for message invoked on a non running process"]);
        return;
      }
      if (after && !func) {
        throw new Error("Cannot have 'after' defined without a function to go with it");
      }

      if (this.mailbox.length > 0) {
        var message = this.mailbox.shift();
        return message;
      } else {
        var resTriggered = false;
        return new Promise(function (res, rej) {
          _this3.defer = function (val) {
            if (_this3.dictionary.debug) {
              System.syslog("debug", [_this3.id, "defer resolved", "defer resolved - timeout: " + resTriggered]);
            }
            resTriggered = true;
            res(val);
          };
          if (after && after.timeout) {
            setTimeout(function () {
              if (!resTriggered) {
                System.syslog("info", [_this3.id, "timeout", "process timeout reached"]);
                resTriggered = true;
                _this3.defer = null;
                res(true);
              }
            }, after.timeout);
          }
        }).then(function (afterTriggered) {
          _this3.defer = null;
          if (afterTriggered) {
            if (after.retry > 0) {
              return _this3.blockForMessage({ timeout: after.timeout, retry: after.retry - 1 || 0 }, func);
            } else {
              func.call(_this3);
              return;
            }
          }
          return _this3.blockForMessage();
        });
      }
    }
  }, {
    key: "receive",
    value: function receive(message) {
      if (this.dictionary.debug) {
        System.syslog("debug", [this.id, "receive", util.inspect(message)]);
      }
      this.mailbox.push(message);

      if (this.defer) {
        this.defer();
      }
    }
  }, {
    key: "view",
    value: function view(message) {
      var _message = _toArray(message),
          method = _message[0],
          name = _message[1],
          rest = _message.slice(2);

      if (this.views[method] && this.views[method][name]) {
        this.views[method][name](rest);
        return true;
      }
      return false;
    }
  }, {
    key: "serializish",
    value: function serializish() {
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
  }, {
    key: "deserialize",
    value: function deserialize(data) {
      return new Pid(data);
    }
  }, {
    key: "exit",
    value: function exit(state, reason, catchProcess) {
      this.state = state;
      this.reason = reason;
      if (this.dictionary.debug || reason) {
        System.syslog("info", [this.id, "exit", state, reason]);
      }
      this.emit("exit", state, reason);
      if (!catchProcess) {
        throw this;
      }
    }
  }, {
    key: "error",
    value: function error(err, catchProcess) {
      System.syslog("error", [this.id, "error", err]);
      return System.exit(this, "error", err, catchProcess);
    }
  }, {
    key: "putValue",
    value: function putValue(key, value) {
      var old = this.dictionary[key];
      this.dictionary[key] = value;
      return old;
    }
  }, {
    key: "getValue",
    value: function getValue(key) {
      return this.dictionary[key];
    }
  }, {
    key: "erase",
    value: function erase(key) {
      if (key === undefined) {
        this.dictionary = {};
      } else {
        delete this.dictionary[key];
      }
    }
  }], [{
    key: "spawn",
    value: function () {
      var _ref8 = _asyncToGenerator(regeneratorRuntime.mark(function _callee6(node, mod, func, clusterCookie, dict, views) {
        var pid;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                pid = new Pid({ mod: mod, func: func, node: node, clusterCookie: clusterCookie, dictionary: dict, views: views });

                NodeGateway.addCommunicationChannel(node, pid.id, pid);
                pid.process();
                return _context6.abrupt("return", pid);

              case 4:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function spawn(_x13, _x14, _x15, _x16, _x17, _x18) {
        return _ref8.apply(this, arguments);
      }

      return spawn;
    }()
  }]);

  return Pid;
}(EventEmitter);

module.exports.Pid = Pid;
var registry = {};

var Registry = function () {
  function Registry() {
    _classCallCheck(this, Registry);
  }

  _createClass(Registry, null, [{
    key: "register",
    value: function () {
      var _ref9 = _asyncToGenerator(regeneratorRuntime.mark(function _callee7(name, pid) {
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                _context7.next = 2;
                return Registry.whereis(name);

              case 2:
                if (!_context7.sent) {
                  _context7.next = 5;
                  break;
                }

                _context7.next = 5;
                return Registry.unregister(name);

              case 5:
                registry[name] = pid;

              case 6:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function register(_x19, _x20) {
        return _ref9.apply(this, arguments);
      }

      return register;
    }()
  }, {
    key: "whereis",
    value: function () {
      var _ref10 = _asyncToGenerator(regeneratorRuntime.mark(function _callee8(name) {
        var pid;
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                _context8.next = 2;
                return Registry.resolve(name);

              case 2:
                pid = _context8.sent;

                if (!pid) {
                  _context8.next = 5;
                  break;
                }

                return _context8.abrupt("return", pid.node);

              case 5:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function whereis(_x21) {
        return _ref10.apply(this, arguments);
      }

      return whereis;
    }()
  }, {
    key: "unregister",
    value: function () {
      var _ref11 = _asyncToGenerator(regeneratorRuntime.mark(function _callee9(name) {
        return regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                if (registry[name]) {
                  delete registry[name];
                }

              case 1:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function unregister(_x22) {
        return _ref11.apply(this, arguments);
      }

      return unregister;
    }()
  }, {
    key: "getRegistry",
    value: function () {
      var _ref12 = _asyncToGenerator(regeneratorRuntime.mark(function _callee10() {
        return regeneratorRuntime.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                return _context10.abrupt("return", registry);

              case 1:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));

      function getRegistry() {
        return _ref12.apply(this, arguments);
      }

      return getRegistry;
    }()
  }, {
    key: "resolve",
    value: function () {
      var _ref13 = _asyncToGenerator(regeneratorRuntime.mark(function _callee11(name) {
        return regeneratorRuntime.wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                return _context11.abrupt("return", registry[name]);

              case 1:
              case "end":
                return _context11.stop();
            }
          }
        }, _callee11, this);
      }));

      function resolve(_x23) {
        return _ref13.apply(this, arguments);
      }

      return resolve;
    }()
  }]);

  return Registry;
}();

module.exports.Registry = Registry;

var nodes = [];
var sysNodes = [];

var NodeGateway = function () {
  function NodeGateway(node) {
    _classCallCheck(this, NodeGateway);

    this.nodes = {};
  }

  _createClass(NodeGateway, null, [{
    key: "getCommunicationChannel",
    value: function getCommunicationChannel(node, cookie, id) {
      if (node === SYSTEM_NODE) {
        return sysNodes[id];
      }
      return nodes[node][id];
    }
  }, {
    key: "addCommunicationChannel",
    value: function addCommunicationChannel(node, id, pid) {
      if (node === SYSTEM_NODE) {
        sysNodes[id] = new CommunicationChannel(pid);
        return;
      }
      nodes[node] = nodes[node] || {};
      nodes[node][id] = new CommunicationChannel(pid);
    }
  }, {
    key: "removeCommunitcationChannel",
    value: function removeCommunitcationChannel(pid) {
      if (pid.node === SYSTEM_NODE) {
        delete sysNodes[pid.id];
        return;
      }
      if (nodes[pid.node] && nodes[pid.node][pid.id]) {
        delete nodes[pid.node][pid.id];
      }
    }
  }]);

  return NodeGateway;
}();

module.exports.NodeGateway = NodeGateway;

var CommunicationChannel = function () {
  function CommunicationChannel(pid) {
    _classCallCheck(this, CommunicationChannel);

    this.pid = pid;
  }

  _createClass(CommunicationChannel, [{
    key: "send",
    value: function send(message) {
      this.pid.receive(message);
    }
  }]);

  return CommunicationChannel;
}();

module.exports.CommunicationChannel = CommunicationChannel;

var GroupControls = {

  race: function () {
    var _ref14 = _asyncToGenerator(regeneratorRuntime.mark(function _callee13() {
      var _this4 = this;

      var _ref15, _ref16, caller, racers, options, message, awaits, _ref18, _ref19, status, messageResponse;

      return regeneratorRuntime.wrap(function _callee13$(_context13) {
        while (1) {
          switch (_context13.prev = _context13.next) {
            case 0:
              _context13.next = 2;
              return System.receive(this);

            case 2:
              _ref15 = _context13.sent;
              _ref16 = _slicedToArray(_ref15, 3);
              caller = _ref16[0];
              racers = _ref16[1];
              options = _ref16[2];
              _context13.next = 9;
              return System.receive(this);

            case 9:
              message = _context13.sent;


              racers.map(function () {
                var _ref17 = _asyncToGenerator(regeneratorRuntime.mark(function _callee12(pid) {
                  var returnPid;
                  return regeneratorRuntime.wrap(function _callee12$(_context12) {
                    while (1) {
                      switch (_context12.prev = _context12.next) {
                        case 0:
                          _context12.next = 2;
                          return System.spawn("_receiver", GroupControls._receiver, { exitExplicit: true });

                        case 2:
                          returnPid = _context12.sent;

                          System.send(returnPid, [_this4, options]);
                          System.send(pid, [message, returnPid]);

                        case 5:
                        case "end":
                          return _context12.stop();
                      }
                    }
                  }, _callee12, _this4);
                }));

                return function (_x24) {
                  return _ref17.apply(this, arguments);
                };
              }());

              awaits = racers.length;

            case 12:
              if (!(awaits > 0)) {
                _context13.next = 26;
                break;
              }

              _context13.next = 15;
              return System.receive(this);

            case 15:
              _ref18 = _context13.sent;
              _ref19 = _slicedToArray(_ref18, 2);
              status = _ref19[0];
              messageResponse = _ref19[1];

              if (!(status === "OK")) {
                _context13.next = 23;
                break;
              }

              return _context13.abrupt("break", 26);

            case 23:
              awaits--;

            case 24:
              _context13.next = 12;
              break;

            case 26:

              if (awaits === 0) {
                System.send(caller, ["ERR", "timeout"]);
              } else {
                System.send(caller, ["OK", messageResponse]);
              }

              System.exit(this);

            case 28:
            case "end":
              return _context13.stop();
          }
        }
      }, _callee13, this);
    }));

    function race() {
      return _ref14.apply(this, arguments);
    }

    return race;
  }(),

  fallback: function () {
    var _ref20 = _asyncToGenerator(regeneratorRuntime.mark(function _callee14() {
      var _ref21, _ref22, caller, fallbacks, options, message, messageResponse, awaits, returnPid, _ref23, _ref24, status;

      return regeneratorRuntime.wrap(function _callee14$(_context14) {
        while (1) {
          switch (_context14.prev = _context14.next) {
            case 0:
              _context14.next = 2;
              return System.receive(this);

            case 2:
              _ref21 = _context14.sent;
              _ref22 = _slicedToArray(_ref21, 3);
              caller = _ref22[0];
              fallbacks = _ref22[1];
              options = _ref22[2];
              _context14.next = 9;
              return System.receive(this);

            case 9:
              message = _context14.sent;
              messageResponse = null;
              awaits = fallbacks.length;

            case 12:
              if (!(awaits > 0)) {
                _context14.next = 31;
                break;
              }

              _context14.next = 15;
              return System.spawn("_receiver", GroupControls._receiver, { exitExplicit: true });

            case 15:
              returnPid = _context14.sent;

              System.send(returnPid, [this, options]);
              System.send(fallbacks[fallbacks.length - awaits], [message, returnPid]);

              _context14.next = 20;
              return System.receive(this);

            case 20:
              _ref23 = _context14.sent;
              _ref24 = _slicedToArray(_ref23, 2);
              status = _ref24[0];
              messageResponse = _ref24[1];

              if (!(status === "OK")) {
                _context14.next = 28;
                break;
              }

              return _context14.abrupt("break", 31);

            case 28:
              awaits--;

            case 29:
              _context14.next = 12;
              break;

            case 31:

              if (awaits === 0) {
                System.send(caller, ["ERR", "timeout"]);
              } else {
                System.send(caller, ["OK", messageResponse]);
              }
              System.exit(this);

            case 33:
            case "end":
              return _context14.stop();
          }
        }
      }, _callee14, this);
    }));

    function fallback() {
      return _ref20.apply(this, arguments);
    }

    return fallback;
  }(),

  all: function () {
    var _ref25 = _asyncToGenerator(regeneratorRuntime.mark(function _callee16() {
      var _this5 = this;

      var _ref26, _ref27, caller, endpoints, options, message, self, awaits, isError, responses, _ref29, _ref30, status, messageResponse, idx;

      return regeneratorRuntime.wrap(function _callee16$(_context16) {
        while (1) {
          switch (_context16.prev = _context16.next) {
            case 0:
              _context16.next = 2;
              return System.receive(this);

            case 2:
              _ref26 = _context16.sent;
              _ref27 = _slicedToArray(_ref26, 3);
              caller = _ref27[0];
              endpoints = _ref27[1];
              options = _ref27[2];
              _context16.next = 9;
              return System.receive(this);

            case 9:
              message = _context16.sent;
              self = this;

              endpoints.map(function () {
                var _ref28 = _asyncToGenerator(regeneratorRuntime.mark(function _callee15(pid, idx) {
                  var returnPid, opt;
                  return regeneratorRuntime.wrap(function _callee15$(_context15) {
                    while (1) {
                      switch (_context15.prev = _context15.next) {
                        case 0:
                          _context15.next = 2;
                          return System.spawn("_receiver", GroupControls._receiver, { exitExplicit: true });

                        case 2:
                          returnPid = _context15.sent;
                          opt = options && options[idx] || {};

                          opt.idx = idx;
                          System.send(returnPid, [self, opt]);
                          System.send(pid, [message[idx], returnPid]);

                        case 7:
                        case "end":
                          return _context15.stop();
                      }
                    }
                  }, _callee15, _this5);
                }));

                return function (_x25, _x26) {
                  return _ref28.apply(this, arguments);
                };
              }());

              awaits = endpoints.length;
              isError = false;
              responses = [];

            case 15:
              if (!(awaits > 0)) {
                _context16.next = 27;
                break;
              }

              _context16.next = 18;
              return System.receive(this);

            case 18:
              _ref29 = _context16.sent;
              _ref30 = _slicedToArray(_ref29, 3);
              status = _ref30[0];
              messageResponse = _ref30[1];
              idx = _ref30[2];

              if (status === "OK") {
                responses[idx] = messageResponse;
              } else {
                if (!(options && options[idx] && options[idx].optional)) {
                  isError = true;
                }
                responses[idx] = messageResponse;
              }
              awaits--;
              _context16.next = 15;
              break;

            case 27:

              if (isError) {
                System.send(caller, ["ERR", responses]);
              } else {
                System.send(caller, ["OK", responses]);
              }
              System.exit(this);

            case 29:
            case "end":
              return _context16.stop();
          }
        }
      }, _callee16, this);
    }));

    function all() {
      return _ref25.apply(this, arguments);
    }

    return all;
  }(),

  _receiver: function () {
    var _ref31 = _asyncToGenerator(regeneratorRuntime.mark(function _callee17() {
      var _this6 = this;

      var _ref32, _ref33, caller, options, message;

      return regeneratorRuntime.wrap(function _callee17$(_context17) {
        while (1) {
          switch (_context17.prev = _context17.next) {
            case 0:
              _context17.next = 2;
              return System.receive(this);

            case 2:
              _ref32 = _context17.sent;
              _ref33 = _slicedToArray(_ref32, 2);
              caller = _ref33[0];
              options = _ref33[1];

              options = options || {};
              _context17.next = 9;
              return System.receive(this, {
                timeout: options.timeout || 20000
              }, function () {
                System.send(caller, ["ERR", new Error("timeout"), options.idx]);
                System.exit(_this6);
              });

            case 9:
              message = _context17.sent;

              if (message && message instanceof Array && message[0] === "ERR") {
                System.send(caller, ["ERR", message, options.idx]);
              } else {
                System.send(caller, ["OK", message, options.idx]);
              }
              System.exit(this);

            case 12:
            case "end":
              return _context17.stop();
          }
        }
      }, _callee17, this);
    }));

    function _receiver() {
      return _ref31.apply(this, arguments);
    }

    return _receiver;
  }(),

  _promised: function () {
    var _ref34 = _asyncToGenerator(regeneratorRuntime.mark(function _callee18() {
      var _ref35, _ref36, res, rej, _ref37, _ref38, status, message;

      return regeneratorRuntime.wrap(function _callee18$(_context18) {
        while (1) {
          switch (_context18.prev = _context18.next) {
            case 0:
              _context18.next = 2;
              return System.receive(this);

            case 2:
              _ref35 = _context18.sent;
              _ref36 = _slicedToArray(_ref35, 2);
              res = _ref36[0];
              rej = _ref36[1];
              _context18.next = 8;
              return System.receive(this);

            case 8:
              _ref37 = _context18.sent;
              _ref38 = _slicedToArray(_ref37, 2);
              status = _ref38[0];
              message = _ref38[1];

              if (status === "OK") {
                res([status, message]);
              } else {
                rej([status, message]);
              }
              System.exit(this);

            case 14:
            case "end":
              return _context18.stop();
          }
        }
      }, _callee18, this);
    }));

    function _promised() {
      return _ref34.apply(this, arguments);
    }

    return _promised;
  }()
};

System.GroupControls = {};

System.GroupControls.all = function () {
  var _ref39 = _asyncToGenerator(regeneratorRuntime.mark(function _callee19(caller, pids, options) {
    var allPid;
    return regeneratorRuntime.wrap(function _callee19$(_context19) {
      while (1) {
        switch (_context19.prev = _context19.next) {
          case 0:
            if (pids instanceof Array) {
              _context19.next = 2;
              break;
            }

            throw new Error("pids must be an array");

          case 2:
            if (!(pids.length === 0)) {
              _context19.next = 4;
              break;
            }

            throw new Error("Pids cannot be empty array");

          case 4:
            _context19.next = 6;
            return System.spawn("all", GroupControls.all);

          case 6:
            allPid = _context19.sent;

            System.send(allPid, [caller, pids, options]);
            return _context19.abrupt("return", allPid);

          case 9:
          case "end":
            return _context19.stop();
        }
      }
    }, _callee19, undefined);
  }));

  return function (_x27, _x28, _x29) {
    return _ref39.apply(this, arguments);
  };
}();

System.GroupControls.allAsync = function (message, pids, options) {
  return new Promise(function () {
    var _ref40 = _asyncToGenerator(regeneratorRuntime.mark(function _callee20(res, rej) {
      var promisedPid, allPid;
      return regeneratorRuntime.wrap(function _callee20$(_context20) {
        while (1) {
          switch (_context20.prev = _context20.next) {
            case 0:
              if (pids instanceof Array) {
                _context20.next = 2;
                break;
              }

              throw new Error("pids must be an array");

            case 2:
              if (!(pids.length === 0)) {
                _context20.next = 4;
                break;
              }

              throw new Error("Pids cannot be empty array");

            case 4:
              _context20.next = 6;
              return System.spawn("_promised", GroupControls._promised, { exitExplicit: true });

            case 6:
              promisedPid = _context20.sent;

              System.send(promisedPid, [res, rej]);
              _context20.next = 10;
              return System.GroupControls.all(promisedPid, pids, options);

            case 10:
              allPid = _context20.sent;

              System.send(allPid, message);

            case 12:
            case "end":
              return _context20.stop();
          }
        }
      }, _callee20, undefined);
    }));

    return function (_x30, _x31) {
      return _ref40.apply(this, arguments);
    };
  }());
};

System.GroupControls.fallback = function () {
  var _ref41 = _asyncToGenerator(regeneratorRuntime.mark(function _callee21(caller, pids, options) {
    var fallBackPid;
    return regeneratorRuntime.wrap(function _callee21$(_context21) {
      while (1) {
        switch (_context21.prev = _context21.next) {
          case 0:
            if (pids instanceof Array) {
              _context21.next = 2;
              break;
            }

            throw new Error("pids must be an array");

          case 2:
            if (!(pids.length === 0)) {
              _context21.next = 4;
              break;
            }

            throw new Error("Pids cannot be empty array");

          case 4:
            _context21.next = 6;
            return System.spawn("fallback", GroupControls.fallback);

          case 6:
            fallBackPid = _context21.sent;

            System.send(fallBackPid, [caller, pids, options]);
            return _context21.abrupt("return", fallBackPid);

          case 9:
          case "end":
            return _context21.stop();
        }
      }
    }, _callee21, undefined);
  }));

  return function (_x32, _x33, _x34) {
    return _ref41.apply(this, arguments);
  };
}();

System.GroupControls.fallBackAsync = function (message, pids, options) {
  return new Promise(function () {
    var _ref42 = _asyncToGenerator(regeneratorRuntime.mark(function _callee22(res, rej) {
      var promisedPid, fallBackPid;
      return regeneratorRuntime.wrap(function _callee22$(_context22) {
        while (1) {
          switch (_context22.prev = _context22.next) {
            case 0:
              if (pids instanceof Array) {
                _context22.next = 2;
                break;
              }

              throw new Error("pids must be an array");

            case 2:
              if (!(pids.length === 0)) {
                _context22.next = 4;
                break;
              }

              throw new Error("Pids cannot be empty array");

            case 4:
              _context22.next = 6;
              return System.spawn("_promised", GroupControls._promised, { exitExplicit: true });

            case 6:
              promisedPid = _context22.sent;

              System.send(promisedPid, [res, rej]);
              _context22.next = 10;
              return System.GroupControls.fallback(promisedPid, pids, options);

            case 10:
              fallBackPid = _context22.sent;

              System.send(fallBackPid, message);

            case 12:
            case "end":
              return _context22.stop();
          }
        }
      }, _callee22, undefined);
    }));

    return function (_x35, _x36) {
      return _ref42.apply(this, arguments);
    };
  }());
};

System.GroupControls.race = function () {
  var _ref43 = _asyncToGenerator(regeneratorRuntime.mark(function _callee23(caller, pids, options) {
    var racePid;
    return regeneratorRuntime.wrap(function _callee23$(_context23) {
      while (1) {
        switch (_context23.prev = _context23.next) {
          case 0:
            if (pids instanceof Array) {
              _context23.next = 2;
              break;
            }

            throw new Error("pids must be an array");

          case 2:
            if (!(pids.length === 0)) {
              _context23.next = 4;
              break;
            }

            throw new Error("Pids cannot be empty array");

          case 4:
            _context23.next = 6;
            return System.spawn("race", GroupControls.race, { debug: false });

          case 6:
            racePid = _context23.sent;

            System.send(racePid, [caller, pids, options]);
            return _context23.abrupt("return", racePid);

          case 9:
          case "end":
            return _context23.stop();
        }
      }
    }, _callee23, undefined);
  }));

  return function (_x37, _x38, _x39) {
    return _ref43.apply(this, arguments);
  };
}();

System.GroupControls.raceAsync = function (message, pids, options) {
  return new Promise(function () {
    var _ref44 = _asyncToGenerator(regeneratorRuntime.mark(function _callee24(res, rej) {
      var promisedPid, racePid;
      return regeneratorRuntime.wrap(function _callee24$(_context24) {
        while (1) {
          switch (_context24.prev = _context24.next) {
            case 0:
              if (pids instanceof Array) {
                _context24.next = 2;
                break;
              }

              throw new Error("pids must be an array");

            case 2:
              if (!(pids.length === 0)) {
                _context24.next = 4;
                break;
              }

              throw new Error("Pids cannot be empty array");

            case 4:
              _context24.next = 6;
              return System.spawn("_promised", GroupControls._promised, { exitExplicit: true });

            case 6:
              promisedPid = _context24.sent;

              System.send(promisedPid, [res, rej]);
              _context24.next = 10;
              return System.GroupControls.race(promisedPid, pids, options);

            case 10:
              racePid = _context24.sent;

              System.send(racePid, message);

            case 12:
            case "end":
              return _context24.stop();
          }
        }
      }, _callee24, undefined);
    }));

    return function (_x40, _x41) {
      return _ref44.apply(this, arguments);
    };
  }());
};

System.GroupControls.random = function () {
  var _ref45 = _asyncToGenerator(regeneratorRuntime.mark(function _callee25(caller, pids, options) {
    var randomPid;
    return regeneratorRuntime.wrap(function _callee25$(_context25) {
      while (1) {
        switch (_context25.prev = _context25.next) {
          case 0:
            if (pids instanceof Array) {
              _context25.next = 2;
              break;
            }

            throw new Error("pids must be an array");

          case 2:
            if (!(pids.length === 0)) {
              _context25.next = 4;
              break;
            }

            throw new Error("Pids cannot be empty array");

          case 4:
            _context25.next = 6;
            return System.spawn("fallback", GroupControls.fallback, { debug: false });

          case 6:
            randomPid = _context25.sent;

            System.send(randomPid, [caller, shuffleArray(pids), options]);
            return _context25.abrupt("return", randomPid);

          case 9:
          case "end":
            return _context25.stop();
        }
      }
    }, _callee25, undefined);
  }));

  return function (_x42, _x43, _x44) {
    return _ref45.apply(this, arguments);
  };
}();

System.GroupControls.randomAsync = function (message, pids, options) {
  return new Promise(function () {
    var _ref46 = _asyncToGenerator(regeneratorRuntime.mark(function _callee26(res, rej) {
      var promisedPid, randomPid;
      return regeneratorRuntime.wrap(function _callee26$(_context26) {
        while (1) {
          switch (_context26.prev = _context26.next) {
            case 0:
              if (pids instanceof Array) {
                _context26.next = 2;
                break;
              }

              throw new Error("pids must be an array");

            case 2:
              if (!(pids.length === 0)) {
                _context26.next = 4;
                break;
              }

              throw new Error("Pids cannot be empty array");

            case 4:
              _context26.next = 6;
              return System.spawn("_promised", GroupControls._promised, { exitExplicit: true });

            case 6:
              promisedPid = _context26.sent;

              System.send(promisedPid, [res, rej]);
              _context26.next = 10;
              return System.GroupControls.random(promisedPid, pids, options);

            case 10:
              randomPid = _context26.sent;

              System.send(randomPid, message);

            case 12:
            case "end":
              return _context26.stop();
          }
        }
      }, _callee26, undefined);
    }));

    return function (_x45, _x46) {
      return _ref46.apply(this, arguments);
    };
  }());
};

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