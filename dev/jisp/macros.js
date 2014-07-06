(function() {
  var macCar = function(x) {
    var _i;
    other = 2 <= arguments.length ? [].slice.call(arguments, 1, _i = arguments.length - 0) : (_i = 1, []);
    if (!(typeof x !== 'undefined' && x !== null) || (other.length > 0)) {
      throw Error("expecting one argument, got: " + pr(x) + ", " + spr(other));
    }
    return ["get", x, 0];
  };
  var macCdr = function(x) {
    var _i;
    other = 2 <= arguments.length ? [].slice.call(arguments, 1, _i = arguments.length - 0) : (_i = 1, []);
    if (!(typeof x !== 'undefined' && x !== null) || (other.length > 0)) {
      throw Error("expecting one argument, got: " + pr(x) + ", " + spr(other));
    }
    return [
      ["get", x, "slice"], 1
    ];
  };
  var macInit = function(x) {
    var _i;
    other = 2 <= arguments.length ? [].slice.call(arguments, 1, _i = arguments.length - 0) : (_i = 1, []);
    if (!(typeof x !== 'undefined' && x !== null) || (other.length > 0)) {
      throw Error("expecting one argument, got: " + pr(x) + ", " + spr(other));
    }
    return [
      ["get", x, "slice"], 0, -1
    ];
  };
  var macLast = function(x) {
    var _i;
    other = 2 <= arguments.length ? [].slice.call(arguments, 1, _i = arguments.length - 0) : (_i = 1, []);
    if (!(typeof x !== 'undefined' && x !== null) || (other.length > 0)) {
      throw Error("expecting one argument, got: " + pr(x) + ", " + spr(other));
    }
    return ["get", [
      ["get", x, "slice"], -1
    ], 0];
  };
  var macLet = function() {
    var body, names, callArgs, _i;
    args = 2 <= arguments.length ? [].slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []);
    body = arguments[_i++];
    util.assertExp(args, (function(x) {
      return (x.length % 2) === 0;
    }), "an even number of arguments");
    !(typeof body !== 'undefined' && body !== null) ? body = [] : undefined;
    names = [];
    callArgs = [];
    while (args.length > 0) {
      names.push(checkVar(args.shift()));
      callArgs.push(args.shift());
    }
    return [].concat([
      [].concat(["fn"]).concat(names).concat([body])
    ]).concat(callArgs);
  };
  var macNotExist = function(x) {
    var _i;
    other = 2 <= arguments.length ? [].slice.call(arguments, 1, _i = arguments.length - 0) : (_i = 1, []);
    if (!(typeof x !== 'undefined' && x !== null) || (other.length > 0)) {
      throw Error("expecting one argument, got: " + pr(x) + ", " + spr(other));
    }
    return ["not", ["?", x]];
  };
  var macIsA = function(obj) {
    var _i;
    types = 2 <= arguments.length ? [].slice.call(arguments, 1, _i = arguments.length - 0) : (_i = 1, []);
    return [].concat(["is", ["typeof", obj]]).concat(types);
  };
  var macAny = function() {
    var value, _i, _i0, _res, _ref;
    values = 1 <= arguments.length ? [].slice.call(arguments, 0, _i = arguments.length - 0) : (_i = 0, []);
    _res = [];
    _ref = values;
    for (_i0 = 0; _i0 < _ref.length; ++_i0) {
      value = _ref[_i0];
      _res.push(["and", ["?", value], value]);
    }
    return [].concat(["or"]).concat(_res);
  };
  var util, pr, spr;
  util = require("./util");
  pr = util.pr;
  spr = util.spr;

  function checkVar(exp) {
    return util.assertExp(exp, util.isVarName, "valid identifier") ? exp : undefined;
  }
  checkVar;
  exports.car = macCar;
  exports.head = macCar;
  exports.cdr = macCdr;
  exports.tail = macCdr;
  exports.init = macInit;
  exports.last = macLast;
  exports.let = macLet;
  exports["?!"] = macNotExist;
  exports.isa = macIsA;
  return exports.any = macAny;
}).call(this);