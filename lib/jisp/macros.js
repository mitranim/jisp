(function() {
  var macLet = function() {
    var body, names, callArgs, _i, _ref, _res;
    args = 2 <= arguments.length ? [].slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []);
    body = arguments[_i++];
    util.assertExp(args, (function(x) {
      return (((x.length % 2) === 0));
    }), "an even number of arguments");
    if ((!(typeof body !== 'undefined' && body !== null))) {
      _ref = (body = []);
    } else {
      _ref = undefined;
    }
    _ref;
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
  var macNotExist = function() {
    var _i;
    args = 1 <= arguments.length ? [].slice.call(arguments, 0, _i = arguments.length - 0) : (_i = 0, []);
    util.assertExp(args, (function(x) {
      return ((x.length === 1));
    }), "one argument");
    return ["not", ["?", car(args)]];
  };
  var macIsA = function(obj, type) {
    return ["is", ["typeof", obj], type];
  };
  var util;
  (util = require("./util"));

  function checkVar(exp) {
    var _ref;
    if (util.assertExp(exp, util.isVarName, "valid identifier")) {
      _ref = exp;
    } else {
      _ref = undefined;
    }
    return _ref;
  }
  checkVar;
  (exports.let = macLet);
  (exports["?!"] = macNotExist);
  return (exports.isa = macIsA);
}).call(this);