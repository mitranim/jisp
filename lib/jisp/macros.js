(function() {
  var macLet = function(args, body) {
    var names, callArgs, _i, _ref, _ref0, _res;
    args = 2 <= arguments.length ? [].slice.call(arguments, 0, _i = arguments.length - 1) : (_i = _i, []);
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
  return (exports.let = macLet);
}).call(this);