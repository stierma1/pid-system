"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.error = exports.timeout = exports.done = exports.one = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var one = exports.one = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
    var _ref2, _ref3, num, returnPid;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return _system2.default.receive(this);

          case 2:
            _ref2 = _context.sent;
            _ref3 = _slicedToArray(_ref2, 2);
            num = _ref3[0];
            returnPid = _ref3[1];

            _system2.default.send(returnPid, ["OK", num + 1]);

          case 7:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function one() {
    return _ref.apply(this, arguments);
  };
}();

var done = exports.done = function () {
  var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
    var done, message;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return _system2.default.receive(this);

          case 2:
            done = _context2.sent;
            _context2.next = 5;
            return _system2.default.receive(this);

          case 5:
            message = _context2.sent;

            done(message);

          case 7:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function done() {
    return _ref4.apply(this, arguments);
  };
}();

var timeout = exports.timeout = function () {
  var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3() {
    var _this = this;

    var returnPid, message;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return _system2.default.receive(this);

          case 2:
            returnPid = _context3.sent;
            _context3.next = 5;
            return _system2.default.receive(this, { timeout: 100 }, function () {
              _system2.default.send(returnPid, ["ERR", "timeout"]);
              _system2.default.exit(_this, "error");
            });

          case 5:
            message = _context3.sent;

            _system2.default.send(returnPid, ["OK", message]);

          case 7:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));

  return function timeout() {
    return _ref5.apply(this, arguments);
  };
}();

var error = exports.error = function () {
  var _ref6 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4() {
    var message;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return _system2.default.receive(this);

          case 2:
            message = _context4.sent;
            throw new Error("I errored");

          case 4:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, this);
  }));

  return function error() {
    return _ref6.apply(this, arguments);
  };
}();

var _system = require("../../built/system");

var _system2 = _interopRequireDefault(_system);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }