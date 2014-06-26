(function() {
  var macLet = function() {
    var body, names, callArgs, _i, _ref, _ref0, _res;
    args = 2 <= arguments.length ? [].slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []);
    body = arguments[_i++];
    if ((!(((args.length % 2) === 0)))) {
      throw Error("expecting an even number of arguments");
      _ref = undefined;
    } else {
      _ref = undefined;
    }
    _ref;
    if ((!(typeof body !== 'undefined' && body !== null))) {
      _ref0 = (body = []);
    } else {
      _ref0 = undefined;
    }
    _ref0;
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
    var _i, _ref;
    args = 1 <= arguments.length ? [].slice.call(arguments, 0, _i = arguments.length - 0) : (_i = 0, []);
    if ((!((args.length === 1)))) {
      throw Error("`?!` expects one argument");
      _ref = undefined;
    } else {
      _ref = undefined;
    }
    _ref;
    return ["not", ["?", car(args)]];
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
  return (exports["?!"] = macNotExist);
}).call(this);