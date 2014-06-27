(function() {
  var macCar = function(x) {
    var _i, _ref;
    other = 2 <= arguments.length ? [].slice.call(arguments, 1, _i = arguments.length - 0) : (_i = 1, []);
    if (((!(typeof x !== 'undefined' && x !== null)) || (other.length > 0))) {
      throw Error("expecting one argument");
      _ref = undefined;
    } else {
      _ref = undefined;
    }
    _ref;
    return ["get", x, 0];
  };
  var macCdr = function(x) {
    var _i, _ref;
    other = 2 <= arguments.length ? [].slice.call(arguments, 1, _i = arguments.length - 0) : (_i = 1, []);
    if (((!(typeof x !== 'undefined' && x !== null)) || (other.length > 0))) {
      throw Error("expecting one argument");
      _ref = undefined;
    } else {
      _ref = undefined;
    }
    _ref;
    return [
      ["get", x, "slice"], 1
    ];
  };
  var macLet = function() {
    var body, names, callArgs, _i, _res;
    args = 2 <= arguments.length ? [].slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []);
    body = arguments[_i++];
    util.assertExp(args, (function(x) {
      return (((x.length % 2) === 0));
    }), "an even number of arguments");
    (!(typeof body !== 'undefined' && body !== null)) ? (body = []) : undefined;
    (names = []);
    (callArgs = []);
    _res = [];
    while ((args.length > 0)) {
      names.push(checkVar(args.shift()));
      _res.push(callArgs.push(args.shift()));
    }
    _res;
    return [].concat([
      [].concat(["fn"]).concat(names).concat([body])
    ]).concat(callArgs);
  };
  var macNotExist = function(x) {
    var _i, _ref;
    other = 2 <= arguments.length ? [].slice.call(arguments, 1, _i = arguments.length - 0) : (_i = 1, []);
    if (((!(typeof x !== 'undefined' && x !== null)) || (other.length > 0))) {
      throw Error("expecting one argument");
      _ref = undefined;
    } else {
      _ref = undefined;
    }
    _ref;
    return ["not", ["?", x]];
  };
  var macIsA = function(obj, type) {
    return ["is", ["typeof", obj], type];
  };
  var util;
  (util = require("./util"));

  function checkVar(exp) {
    return util.assertExp(exp, util.isVarName, "valid identifier") ? exp : undefined;
  }
  checkVar;
  (exports.car = macCar);
  (exports.head = macCar);
  (exports.cdr = macCdr);
  (exports.tail = macCdr);
  (exports.let = macLet);
  (exports["?!"] = macNotExist);
  return (exports.isa = macIsA);
}).call(this);