"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _chai = require("chai");

var _chai2 = _interopRequireDefault(_chai);

var _system = require("../built/system");

var _system2 = _interopRequireDefault(_system);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

require("babel-polyfill");


var expect = _chai2.default.expect;
var continuousModulePath = _path2.default.join(__dirname, "modules", "continuous.js");
var oneAndDoneModulePath = _path2.default.join(__dirname, "modules", "one-and-done.js");

describe("#System", _asyncToGenerator(regeneratorRuntime.mark(function _callee9() {
  var cleanUpPids;
  return regeneratorRuntime.wrap(function _callee9$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          cleanUpPids = [];


          beforeEach(function () {});

          afterEach(function () {
            cleanUpPids.map(function (pid) {
              _system2.default.exit(pid);
            });
            cleanUpPids = [];
          });

          it("spawn must create a pid", _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
            var pid;
            return regeneratorRuntime.wrap(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    _context.next = 2;
                    return _system2.default.spawn(oneAndDoneModulePath, "one");

                  case 2:
                    pid = _context.sent;

                    cleanUpPids.push(pid);
                    expect(pid).to.have.property("state").equal("up");

                  case 5:
                  case "end":
                    return _context.stop();
                }
              }
            }, _callee, this);
          })));

          it("exit must shut down a pid", _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
            var pid;
            return regeneratorRuntime.wrap(function _callee2$(_context2) {
              while (1) {
                switch (_context2.prev = _context2.next) {
                  case 0:
                    _context2.next = 2;
                    return _system2.default.spawn(oneAndDoneModulePath, "one");

                  case 2:
                    pid = _context2.sent;

                    cleanUpPids.push(pid);
                    expect(pid).to.have.property("state").equal("up");
                    _context2.next = 7;
                    return _system2.default.exit(pid);

                  case 7:
                    expect(pid).to.have.property("state").equal("normal");

                  case 8:
                  case "end":
                    return _context2.stop();
                }
              }
            }, _callee2, this);
          })));

          it("register and resolve must allow fetching of pids by name", _asyncToGenerator(regeneratorRuntime.mark(function _callee3() {
            var pid, secondPid;
            return regeneratorRuntime.wrap(function _callee3$(_context3) {
              while (1) {
                switch (_context3.prev = _context3.next) {
                  case 0:
                    _context3.next = 2;
                    return _system2.default.spawn(oneAndDoneModulePath, "one");

                  case 2:
                    pid = _context3.sent;

                    cleanUpPids.push(pid);
                    _context3.next = 6;
                    return _system2.default.register("test", pid);

                  case 6:
                    _context3.next = 8;
                    return _system2.default.resolve("test");

                  case 8:
                    secondPid = _context3.sent;

                    expect(pid).to.equal(secondPid);

                  case 10:
                  case "end":
                    return _context3.stop();
                }
              }
            }, _callee3, this);
          })));

          it("unregister must remove pid from registry", _asyncToGenerator(regeneratorRuntime.mark(function _callee4() {
            var pid, secondPid;
            return regeneratorRuntime.wrap(function _callee4$(_context4) {
              while (1) {
                switch (_context4.prev = _context4.next) {
                  case 0:
                    _context4.next = 2;
                    return _system2.default.spawn(oneAndDoneModulePath, "one");

                  case 2:
                    pid = _context4.sent;

                    cleanUpPids.push(pid);
                    _context4.next = 6;
                    return _system2.default.register("test", pid);

                  case 6:
                    _context4.next = 8;
                    return _system2.default.unregister("test");

                  case 8:
                    _context4.next = 10;
                    return _system2.default.resolve("test");

                  case 10:
                    secondPid = _context4.sent;

                    expect(secondPid).to.be.undefined;

                  case 12:
                  case "end":
                    return _context4.stop();
                }
              }
            }, _callee4, this);
          })));

          it("receive and send must allow message passing between pids", _asyncToGenerator(regeneratorRuntime.mark(function _callee5() {
            var one, done, prom, _ref7, _ref8, status, val;

            return regeneratorRuntime.wrap(function _callee5$(_context5) {
              while (1) {
                switch (_context5.prev = _context5.next) {
                  case 0:
                    _context5.next = 2;
                    return _system2.default.spawn(oneAndDoneModulePath, "one");

                  case 2:
                    one = _context5.sent;
                    _context5.next = 5;
                    return _system2.default.spawn(oneAndDoneModulePath, "done");

                  case 5:
                    done = _context5.sent;

                    cleanUpPids.push(one);
                    cleanUpPids.push(done);
                    prom = new Promise(function (res) {
                      _system2.default.send(done, res);
                    });

                    _system2.default.send(one, [0, done]);
                    _context5.next = 12;
                    return prom;

                  case 12:
                    _ref7 = _context5.sent;
                    _ref8 = _slicedToArray(_ref7, 2);
                    status = _ref8[0];
                    val = _ref8[1];

                    expect(val).to.equal(1);

                  case 17:
                  case "end":
                    return _context5.stop();
                }
              }
            }, _callee5, this);
          })));

          it("receiveWatch and send must allow message passing between pids", _asyncToGenerator(regeneratorRuntime.mark(function _callee6() {
            var watch, error, done, prom, _ref10, _ref11, source, status, val;

            return regeneratorRuntime.wrap(function _callee6$(_context6) {
              while (1) {
                switch (_context6.prev = _context6.next) {
                  case 0:
                    _context6.next = 2;
                    return _system2.default.spawn(oneAndDoneModulePath, "watch");

                  case 2:
                    watch = _context6.sent;
                    _context6.next = 5;
                    return _system2.default.spawn(oneAndDoneModulePath, "error");

                  case 5:
                    error = _context6.sent;
                    _context6.next = 8;
                    return _system2.default.spawn(oneAndDoneModulePath, "done");

                  case 8:
                    done = _context6.sent;

                    cleanUpPids.push(watch);
                    cleanUpPids.push(error);
                    cleanUpPids.push(done);
                    _system2.default.send(watch, error);
                    _system2.default.send(watch, done);
                    prom = new Promise(function (res) {
                      _system2.default.send(done, res);
                    });

                    _system2.default.send(error, []);
                    _context6.next = 18;
                    return prom;

                  case 18:
                    _ref10 = _context6.sent;
                    _ref11 = _slicedToArray(_ref10, 3);
                    source = _ref11[0];
                    status = _ref11[1];
                    val = _ref11[2];

                    expect(source).to.equal(_system2.default.Monitor);
                    expect(status).to.equal("error");

                  case 25:
                  case "end":
                    return _context6.stop();
                }
              }
            }, _callee6, this);
          })));

          it("receive must allow for timeout", _asyncToGenerator(regeneratorRuntime.mark(function _callee7() {
            var timeout, done, prom, _ref13, _ref14, status, val;

            return regeneratorRuntime.wrap(function _callee7$(_context7) {
              while (1) {
                switch (_context7.prev = _context7.next) {
                  case 0:
                    _context7.next = 2;
                    return _system2.default.spawn(oneAndDoneModulePath, "timeout");

                  case 2:
                    timeout = _context7.sent;
                    _context7.next = 5;
                    return _system2.default.spawn(oneAndDoneModulePath, "done");

                  case 5:
                    done = _context7.sent;

                    cleanUpPids.push(timeout);
                    cleanUpPids.push(done);
                    prom = new Promise(function (res) {
                      _system2.default.send(done, res);
                    });

                    _system2.default.send(timeout, done);
                    _context7.next = 12;
                    return prom;

                  case 12:
                    _ref13 = _context7.sent;
                    _ref14 = _slicedToArray(_ref13, 2);
                    status = _ref14[0];
                    val = _ref14[1];

                    expect(val).to.equal("timeout");

                  case 17:
                  case "end":
                    return _context7.stop();
                }
              }
            }, _callee7, this);
          })));

          it("recurse must allow pid to restart", _asyncToGenerator(regeneratorRuntime.mark(function _callee8() {
            var echo, done, done2, prom1, prom2, _ref16, _ref17, status, message, _ref18, _ref19;

            return regeneratorRuntime.wrap(function _callee8$(_context8) {
              while (1) {
                switch (_context8.prev = _context8.next) {
                  case 0:
                    _context8.next = 2;
                    return _system2.default.spawn(continuousModulePath, "echo");

                  case 2:
                    echo = _context8.sent;
                    _context8.next = 5;
                    return _system2.default.spawn(oneAndDoneModulePath, "done");

                  case 5:
                    done = _context8.sent;
                    _context8.next = 8;
                    return _system2.default.spawn(oneAndDoneModulePath, "done");

                  case 8:
                    done2 = _context8.sent;

                    cleanUpPids.push(echo);
                    cleanUpPids.push(done);
                    cleanUpPids.push(done2);
                    prom1 = new Promise(function (res) {
                      _system2.default.send(done, res);
                    });
                    prom2 = new Promise(function (res) {
                      _system2.default.send(done2, res);
                    });


                    _system2.default.send(echo, ["1", done]);
                    _context8.next = 17;
                    return prom1;

                  case 17:
                    _ref16 = _context8.sent;
                    _ref17 = _slicedToArray(_ref16, 2);
                    status = _ref17[0];
                    message = _ref17[1];

                    expect(message).to.equal("1");

                    _system2.default.send(echo, ["2", done2]);
                    _context8.next = 25;
                    return prom2;

                  case 25:
                    _ref18 = _context8.sent;
                    _ref19 = _slicedToArray(_ref18, 2);
                    status = _ref19[0];
                    message = _ref19[1];

                    expect(message).to.equal("2");

                  case 30:
                  case "end":
                    return _context8.stop();
                }
              }
            }, _callee8, this);
          })));

        case 11:
        case "end":
          return _context9.stop();
      }
    }
  }, _callee9, this);
})));

describe("#Monitor", _asyncToGenerator(regeneratorRuntime.mark(function _callee13() {
  var cleanUpPids;
  return regeneratorRuntime.wrap(function _callee13$(_context13) {
    while (1) {
      switch (_context13.prev = _context13.next) {
        case 0:
          cleanUpPids = [];


          beforeEach(function () {});

          afterEach(function () {
            cleanUpPids.map(function (pid) {
              _system2.default.exit(pid);
            });
            cleanUpPids = [];
          });

          it("must invoke callback when state changes", _asyncToGenerator(regeneratorRuntime.mark(function _callee10() {
            var errorPid;
            return regeneratorRuntime.wrap(function _callee10$(_context10) {
              while (1) {
                switch (_context10.prev = _context10.next) {
                  case 0:
                    _context10.next = 2;
                    return _system2.default.spawn(oneAndDoneModulePath, "error");

                  case 2:
                    errorPid = _context10.sent;

                    cleanUpPids.push(errorPid);
                    return _context10.abrupt("return", new Promise(function (res) {
                      _system2.default.Monitor(errorPid, "_", function (state, err) {
                        expect(err).to.be.instanceof(Error);
                        res();
                      });

                      _system2.default.send(errorPid, []);
                    }));

                  case 5:
                  case "end":
                    return _context10.stop();
                }
              }
            }, _callee10, this);
          })));

          it("must invoke callback only when state is matched", _asyncToGenerator(regeneratorRuntime.mark(function _callee11() {
            var errorPid;
            return regeneratorRuntime.wrap(function _callee11$(_context11) {
              while (1) {
                switch (_context11.prev = _context11.next) {
                  case 0:
                    _context11.next = 2;
                    return _system2.default.spawn(oneAndDoneModulePath, "error");

                  case 2:
                    errorPid = _context11.sent;

                    cleanUpPids.push(errorPid);
                    return _context11.abrupt("return", new Promise(function (res, rej) {
                      _system2.default.Monitor(errorPid, "ok", function (state, err) {
                        expect(err).to.be.instanceof(Error);
                        rej();
                      });

                      setTimeout(function () {
                        res();
                      }, 100);

                      _system2.default.send(errorPid, []);
                    }));

                  case 5:
                  case "end":
                    return _context11.stop();
                }
              }
            }, _callee11, this);
          })));

          it("must invoke callback when pid is already exitted", _asyncToGenerator(regeneratorRuntime.mark(function _callee12() {
            var errorPid;
            return regeneratorRuntime.wrap(function _callee12$(_context12) {
              while (1) {
                switch (_context12.prev = _context12.next) {
                  case 0:
                    _context12.next = 2;
                    return _system2.default.spawn(oneAndDoneModulePath, "error");

                  case 2:
                    errorPid = _context12.sent;

                    cleanUpPids.push(errorPid);
                    _context12.next = 6;
                    return _system2.default.send(errorPid, []);

                  case 6:
                    return _context12.abrupt("return", new Promise(function (res) {
                      setTimeout(function () {
                        _system2.default.Monitor(errorPid, "_", function (state, err) {
                          expect(err).to.be.instanceof(Error);
                          res();
                        });
                      }, 100);
                    }));

                  case 7:
                  case "end":
                    return _context12.stop();
                }
              }
            }, _callee12, this);
          })));

        case 6:
        case "end":
          return _context13.stop();
      }
    }
  }, _callee13, this);
})));

describe("#GroupControls", _asyncToGenerator(regeneratorRuntime.mark(function _callee19() {
  var cleanUpPids;
  return regeneratorRuntime.wrap(function _callee19$(_context19) {
    while (1) {
      switch (_context19.prev = _context19.next) {
        case 0:
          cleanUpPids = [];


          beforeEach(function () {});

          afterEach(function () {
            cleanUpPids.map(function (pid) {
              _system2.default.exit(pid);
            });
            cleanUpPids = [];
          });

          it("race should return the message from the first completed pid", _asyncToGenerator(regeneratorRuntime.mark(function _callee14() {
            var fast, slow, done, racePid, prom, _ref26, _ref27, status, val;

            return regeneratorRuntime.wrap(function _callee14$(_context14) {
              while (1) {
                switch (_context14.prev = _context14.next) {
                  case 0:
                    _context14.next = 2;
                    return _system2.default.spawn(oneAndDoneModulePath, "fast");

                  case 2:
                    fast = _context14.sent;
                    _context14.next = 5;
                    return _system2.default.spawn(oneAndDoneModulePath, "slow");

                  case 5:
                    slow = _context14.sent;
                    _context14.next = 8;
                    return _system2.default.spawn(oneAndDoneModulePath, "done");

                  case 8:
                    done = _context14.sent;
                    _context14.next = 11;
                    return _system2.default.GroupControls.race(done, [fast, slow]);

                  case 11:
                    racePid = _context14.sent;


                    cleanUpPids.push(fast);
                    cleanUpPids.push(slow);
                    cleanUpPids.push(done);
                    cleanUpPids.push(racePid);

                    prom = new Promise(function (res) {
                      _system2.default.send(done, res);
                    });


                    _system2.default.send(racePid, "go");
                    _context14.next = 20;
                    return prom;

                  case 20:
                    _ref26 = _context14.sent;
                    _ref27 = _slicedToArray(_ref26, 2);
                    status = _ref27[0];
                    val = _ref27[1];


                    expect(val).to.equal("go fast");

                  case 25:
                  case "end":
                    return _context14.stop();
                }
              }
            }, _callee14, this);
          })));

          it("all should return all values from completed pids", _asyncToGenerator(regeneratorRuntime.mark(function _callee15() {
            var fast, slow, done, racePid, prom, _ref29, _ref30, status, _ref30$, fastVal, slowVal;

            return regeneratorRuntime.wrap(function _callee15$(_context15) {
              while (1) {
                switch (_context15.prev = _context15.next) {
                  case 0:
                    _context15.next = 2;
                    return _system2.default.spawn(oneAndDoneModulePath, "fast");

                  case 2:
                    fast = _context15.sent;
                    _context15.next = 5;
                    return _system2.default.spawn(oneAndDoneModulePath, "slow");

                  case 5:
                    slow = _context15.sent;
                    _context15.next = 8;
                    return _system2.default.spawn(oneAndDoneModulePath, "done");

                  case 8:
                    done = _context15.sent;
                    _context15.next = 11;
                    return _system2.default.GroupControls.all(done, [fast, slow]);

                  case 11:
                    racePid = _context15.sent;


                    cleanUpPids.push(fast);
                    cleanUpPids.push(slow);
                    cleanUpPids.push(done);
                    cleanUpPids.push(racePid);

                    prom = new Promise(function (res) {
                      _system2.default.send(done, res);
                    });


                    _system2.default.send(racePid, ["go", "move"]);
                    _context15.next = 20;
                    return prom;

                  case 20:
                    _ref29 = _context15.sent;
                    _ref30 = _slicedToArray(_ref29, 2);
                    status = _ref30[0];
                    _ref30$ = _slicedToArray(_ref30[1], 2);
                    fastVal = _ref30$[0];
                    slowVal = _ref30$[1];


                    expect(fastVal).to.equal("go fast");
                    expect(slowVal).to.equal("move slow");

                  case 28:
                  case "end":
                    return _context15.stop();
                }
              }
            }, _callee15, this);
          })));

          it("all should return all values from completed pids including error", _asyncToGenerator(regeneratorRuntime.mark(function _callee16() {
            var fast, slow, errorD, done, racePid, prom, _ref32, _ref33, status, _ref33$, fastVal, slowVal, _ref33$$, statusE, errorVal;

            return regeneratorRuntime.wrap(function _callee16$(_context16) {
              while (1) {
                switch (_context16.prev = _context16.next) {
                  case 0:
                    _context16.next = 2;
                    return _system2.default.spawn(oneAndDoneModulePath, "fast");

                  case 2:
                    fast = _context16.sent;
                    _context16.next = 5;
                    return _system2.default.spawn(oneAndDoneModulePath, "slow");

                  case 5:
                    slow = _context16.sent;
                    _context16.next = 8;
                    return _system2.default.spawn(oneAndDoneModulePath, "errorD");

                  case 8:
                    errorD = _context16.sent;
                    _context16.next = 11;
                    return _system2.default.spawn(oneAndDoneModulePath, "done");

                  case 11:
                    done = _context16.sent;
                    _context16.next = 14;
                    return _system2.default.GroupControls.all(done, [fast, slow, errorD]);

                  case 14:
                    racePid = _context16.sent;


                    cleanUpPids.push(fast);
                    cleanUpPids.push(slow);
                    cleanUpPids.push(errorD);
                    cleanUpPids.push(done);
                    cleanUpPids.push(racePid);

                    prom = new Promise(function (res) {
                      _system2.default.send(done, res);
                    });


                    _system2.default.send(racePid, ["go", "move", "i am"]);
                    _context16.next = 24;
                    return prom;

                  case 24:
                    _ref32 = _context16.sent;
                    _ref33 = _slicedToArray(_ref32, 2);
                    status = _ref33[0];
                    _ref33$ = _slicedToArray(_ref33[1], 3);
                    fastVal = _ref33$[0];
                    slowVal = _ref33$[1];
                    _ref33$$ = _slicedToArray(_ref33$[2], 2);
                    statusE = _ref33$$[0];
                    errorVal = _ref33$$[1];


                    expect(status).to.equal("ERR");
                    expect(fastVal).to.equal("go fast");
                    expect(slowVal).to.equal("move slow");
                    expect(errorVal).to.equal("i am error");

                  case 37:
                  case "end":
                    return _context16.stop();
                }
              }
            }, _callee16, this);
          })));

          it("fallback should return the message from the first completed pid", _asyncToGenerator(regeneratorRuntime.mark(function _callee17() {
            var error, slow, done, fallbackPid, prom, _ref35, _ref36, status, val;

            return regeneratorRuntime.wrap(function _callee17$(_context17) {
              while (1) {
                switch (_context17.prev = _context17.next) {
                  case 0:
                    _context17.next = 2;
                    return _system2.default.spawn(oneAndDoneModulePath, "errorD");

                  case 2:
                    error = _context17.sent;
                    _context17.next = 5;
                    return _system2.default.spawn(oneAndDoneModulePath, "slow");

                  case 5:
                    slow = _context17.sent;
                    _context17.next = 8;
                    return _system2.default.spawn(oneAndDoneModulePath, "done");

                  case 8:
                    done = _context17.sent;
                    _context17.next = 11;
                    return _system2.default.GroupControls.fallback(done, [slow, error]);

                  case 11:
                    fallbackPid = _context17.sent;


                    cleanUpPids.push(error);
                    cleanUpPids.push(slow);
                    cleanUpPids.push(done);
                    cleanUpPids.push(fallbackPid);

                    prom = new Promise(function (res) {
                      _system2.default.send(done, res);
                    });


                    _system2.default.send(fallbackPid, "go");
                    _context17.next = 20;
                    return prom;

                  case 20:
                    _ref35 = _context17.sent;
                    _ref36 = _slicedToArray(_ref35, 2);
                    status = _ref36[0];
                    val = _ref36[1];


                    expect(val).to.equal("go slow");

                  case 25:
                  case "end":
                    return _context17.stop();
                }
              }
            }, _callee17, this);
          })));

          it("random should return the message from the first completed pid", _asyncToGenerator(regeneratorRuntime.mark(function _callee18() {
            var error, slow, done, randomPid, prom, _ref38, _ref39, status, val;

            return regeneratorRuntime.wrap(function _callee18$(_context18) {
              while (1) {
                switch (_context18.prev = _context18.next) {
                  case 0:
                    _context18.next = 2;
                    return _system2.default.spawn(oneAndDoneModulePath, "errorD");

                  case 2:
                    error = _context18.sent;
                    _context18.next = 5;
                    return _system2.default.spawn(oneAndDoneModulePath, "slow");

                  case 5:
                    slow = _context18.sent;
                    _context18.next = 8;
                    return _system2.default.spawn(oneAndDoneModulePath, "done");

                  case 8:
                    done = _context18.sent;
                    _context18.next = 11;
                    return _system2.default.GroupControls.random(done, [slow, error]);

                  case 11:
                    randomPid = _context18.sent;


                    cleanUpPids.push(error);
                    cleanUpPids.push(slow);
                    cleanUpPids.push(done);
                    cleanUpPids.push(randomPid);

                    prom = new Promise(function (res) {
                      _system2.default.send(done, res);
                    });


                    _system2.default.send(randomPid, "go");
                    _context18.next = 20;
                    return prom;

                  case 20:
                    _ref38 = _context18.sent;
                    _ref39 = _slicedToArray(_ref38, 2);
                    status = _ref39[0];
                    val = _ref39[1];


                    expect(val).to.equal("go slow");

                  case 25:
                  case "end":
                    return _context18.stop();
                }
              }
            }, _callee18, this);
          })));

        case 8:
        case "end":
          return _context19.stop();
      }
    }
  }, _callee19, this);
})));