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

describe("#System.spawn", _asyncToGenerator(regeneratorRuntime.mark(function _callee8() {
  var cleanUpPids;
  return regeneratorRuntime.wrap(function _callee8$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
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
                    return _system2.default.spawn("fake", oneAndDoneModulePath, "one");

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
                    return _system2.default.spawn("fake", oneAndDoneModulePath, "one");

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
                    return _system2.default.spawn("fake", oneAndDoneModulePath, "one");

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
                    return _system2.default.spawn("fake", oneAndDoneModulePath, "one");

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
                    return _system2.default.spawn("fake", oneAndDoneModulePath, "one");

                  case 2:
                    one = _context5.sent;
                    _context5.next = 5;
                    return _system2.default.spawn("fake", oneAndDoneModulePath, "done");

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

          it("receive must allow for timeout", _asyncToGenerator(regeneratorRuntime.mark(function _callee6() {
            var timeout, done, prom, _ref10, _ref11, status, val;

            return regeneratorRuntime.wrap(function _callee6$(_context6) {
              while (1) {
                switch (_context6.prev = _context6.next) {
                  case 0:
                    _context6.next = 2;
                    return _system2.default.spawn("fake", oneAndDoneModulePath, "timeout");

                  case 2:
                    timeout = _context6.sent;
                    _context6.next = 5;
                    return _system2.default.spawn("fake", oneAndDoneModulePath, "done");

                  case 5:
                    done = _context6.sent;

                    cleanUpPids.push(timeout);
                    cleanUpPids.push(done);
                    prom = new Promise(function (res) {
                      _system2.default.send(done, res);
                    });

                    _system2.default.send(timeout, done);
                    _context6.next = 12;
                    return prom;

                  case 12:
                    _ref10 = _context6.sent;
                    _ref11 = _slicedToArray(_ref10, 2);
                    status = _ref11[0];
                    val = _ref11[1];

                    expect(val).to.equal("timeout");

                  case 17:
                  case "end":
                    return _context6.stop();
                }
              }
            }, _callee6, this);
          })));

          it("recurse must allow pid to restart", _asyncToGenerator(regeneratorRuntime.mark(function _callee7() {
            var echo, done, done2, prom1, prom2, _ref13, _ref14, status, message, _ref15, _ref16;

            return regeneratorRuntime.wrap(function _callee7$(_context7) {
              while (1) {
                switch (_context7.prev = _context7.next) {
                  case 0:
                    _context7.next = 2;
                    return _system2.default.spawn("fake", continuousModulePath, "echo");

                  case 2:
                    echo = _context7.sent;
                    _context7.next = 5;
                    return _system2.default.spawn("fake", oneAndDoneModulePath, "done");

                  case 5:
                    done = _context7.sent;
                    _context7.next = 8;
                    return _system2.default.spawn("fake", oneAndDoneModulePath, "done");

                  case 8:
                    done2 = _context7.sent;

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
                    _context7.next = 17;
                    return prom1;

                  case 17:
                    _ref13 = _context7.sent;
                    _ref14 = _slicedToArray(_ref13, 2);
                    status = _ref14[0];
                    message = _ref14[1];

                    expect(message).to.equal("1");

                    _system2.default.send(echo, ["2", done2]);
                    _context7.next = 25;
                    return prom2;

                  case 25:
                    _ref15 = _context7.sent;
                    _ref16 = _slicedToArray(_ref15, 2);
                    status = _ref16[0];
                    message = _ref16[1];

                    expect(message).to.equal("2");

                  case 30:
                  case "end":
                    return _context7.stop();
                }
              }
            }, _callee7, this);
          })));

        case 10:
        case "end":
          return _context8.stop();
      }
    }
  }, _callee8, this);
})));