(function() {
  var macHash = function() {
    var buffer, _i, _ref;
    var args = 1 <= arguments.length ? [].slice.call(arguments, 0, _i = arguments.length - 0) : (_i = 0, []);
    if ((args.length === 1)) {
      _ref = ["do", ["=", "#_res", {}, "#_ref", args[0]],
        ["while", [">", "#_ref.length", 0],
          ["=", ["get", "#_res", ["#_ref.shift"]],
            ["#_ref.shift"]
          ]
        ], "#_res"
      ];
    } else {
      buffer = {};
      while (args.length > 0) {
        buffer[args.shift()] = args.shift();
      }
      _ref = buffer;
    }
    return _ref;
  };
  var macConcatHash = function() {
    var arg, _i, _i0, _res, _ref, _ref0;
    var args = 1 <= arguments.length ? [].slice.call(arguments, 0, _i = arguments.length - 0) : (_i = 0, []);
    _res = [];
    _ref = args;
    for (_i0 = 0; _i0 < _ref.length; ++_i0) {
      arg = _ref[_i0];
      if (typeof(_ref0 = ["spread", arg]) !== 'undefined') _res.push(_ref0);
    }
    return [":", [].concat(["concat"]).concat(_res)];
  };
  var macPrn = function() {
    var _i;
    var x = 1 <= arguments.length ? [].slice.call(arguments, 0, _i = arguments.length - 0) : (_i = 0, []);
    return [].concat(["console.log"]).concat(x);
  };
  var macCar = function(x) {
    var _i;
    var other = 2 <= arguments.length ? [].slice.call(arguments, 1, _i = arguments.length - 0) : (_i = 1, []);
    if (((typeof x === 'undefined') || (other.length > 0))) throw Error("expecting one argument, got: " + x + ", " + other);
    return ["get", x, 0];
  };
  var macCdr = function(x) {
    var _i;
    var other = 2 <= arguments.length ? [].slice.call(arguments, 1, _i = arguments.length - 0) : (_i = 1, []);
    if (((typeof x === 'undefined') || (other.length > 0))) throw Error("expecting one argument, got: " + x + ", " + other);
    return [
      ["get", x, "\"slice\""], 1
    ];
  };
  var macInit = function(x) {
    var _i;
    var other = 2 <= arguments.length ? [].slice.call(arguments, 1, _i = arguments.length - 0) : (_i = 1, []);
    if (((typeof x === 'undefined') || (other.length > 0))) throw Error("expecting one argument, got: " + x + ", " + other);
    return [
      ["get", x, "\"slice\""], 0, -1
    ];
  };
  var macLast = function(x) {
    var _i;
    var other = 2 <= arguments.length ? [].slice.call(arguments, 1, _i = arguments.length - 0) : (_i = 1, []);
    if (((typeof x === 'undefined') || (other.length > 0))) throw Error("expecting one argument, got: " + x + ", " + other);
    return ["get", [
      ["get", x, "\"slice\""], -1
    ], 0];
  };
  var macLet = function() {
    var body, names, callArgs, name, _i;
    var args = 2 <= arguments.length ? [].slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []);
    body = arguments[_i++];
    if (((args.length % 2) !== 0)) throw Error, ("expecting an even number of arguments, got " + args.length);
    if ((typeof body === 'undefined')) body = [];
    names = [];
    callArgs = [];
    while (args.length > 0) {
      name = args.shift();
      if (true) names.push(name);
      callArgs.push(args.shift());
    }
    return [].concat([
      [].concat(["fn"]).concat(names).concat([body])
    ]).concat(callArgs);
  };

  function list() {
    var _i;
    var args = 1 <= arguments.length ? [].slice.call(arguments, 0, _i = arguments.length - 0) : (_i = 0, []);
    return [].concat(args);
  }
  var macExist = function() {
    var value, comp, elements, _i, _i0, _res, _ref, _ref0;
    var values = 1 <= arguments.length ? [].slice.call(arguments, 0, _i = arguments.length - 0) : (_i = 0, []);
    _res = [];
    _ref = values;
    for (_i0 = 0; _i0 < _ref.length; ++_i0) {
      value = _ref[_i0];
      comp = compartmentaliseExist(value);
      if (typeof(_ref0 = ((comp.length > 1) ? [].concat(["and"]).concat(comp) : comp[0])) !== 'undefined') _res.push(_ref0);
    }
    elements = _res;
    return ((elements.length > 1) ? [].concat(["or"]).concat(elements) : elements[0]);
  };
  var macNotExist = function() {
    var value, comp, elements, _i, _i0, _res, _ref, _ref0;
    var values = 1 <= arguments.length ? [].slice.call(arguments, 0, _i = arguments.length - 0) : (_i = 0, []);
    _res = [];
    _ref = values;
    for (_i0 = 0; _i0 < _ref.length; ++_i0) {
      value = _ref[_i0];
      comp = compartmentaliseNotExist(value);
      if (typeof(_ref0 = ((comp.length > 1) ? [].concat(["or"]).concat(comp) : comp[0])) !== 'undefined') _res.push(_ref0);
    }
    elements = _res;
    return ((elements.length > 1) ? [].concat(["and"]).concat(elements) : elements[0]);
  };
  var macIsA = function(obj) {
    var _i;
    var types = 2 <= arguments.length ? [].slice.call(arguments, 1, _i = arguments.length - 0) : (_i = 1, []);
    return [].concat(["is", ["typeof", obj]]).concat(types);
  };
  var macIsNa = function(obj) {
    var _i;
    var types = 2 <= arguments.length ? [].slice.call(arguments, 1, _i = arguments.length - 0) : (_i = 1, []);
    return [].concat(["isnt", ["typeof", obj]]).concat(types);
  };
  var macAny = function() {
    var value, elements, _i, _i0, _res, _ref, _ref0;
    var values = 1 <= arguments.length ? [].slice.call(arguments, 0, _i = arguments.length - 0) : (_i = 0, []);
    _res = [];
    _ref = values;
    for (_i0 = 0; _i0 < _ref.length; ++_i0) {
      value = _ref[_i0];
      if (typeof(_ref0 = ["and", ["?", value], value]) !== 'undefined') _res.push(_ref0);
    }
    elements = _res;
    return ((elements.length > 1) ? [].concat(["or"]).concat(elements) : elements[0]);
  };
  var utils;
  utils = require("./utils");
  exports[":"] = macHash;
  exports["::"] = macConcatHash;
  exports.prn = macPrn;
  exports.car = macCar;
  exports.head = macCar;
  exports.cdr = macCdr;
  exports.tail = macCdr;
  exports.init = macInit;
  exports.last = macLast;
  exports.let = macLet;

  function compartmentaliseExist(form) {
    var i, val, split, _ref, _res, _ref0, _ref1;
    if ((utils.isList(form) && (form[0] === "get"))) {
      _ref = list.apply(list, [].concat(compartmentaliseExist(form[1])).concat([
        ["isnta", form, "'undefined'"]
      ]));
    } else if ((typeof form === "string") && utils.isIdentifier(form) && !utils.isSpecialValueStr(form)) {
      _res = [];
      _ref0 = (split = utils.splitName(form));
      for (i = 0; i < _ref0.length; ++i) {
        val = _ref0[i];
        if (typeof(_ref1 = ["isnta", split.slice(0, i + 1)
          .join(""), "'undefined'"
        ]) !== 'undefined') _res.push(_ref1);
      }
      _ref = _res;
    } else {
      _ref = [
        ["isnta", form, "'undefined'"]
      ];
    }
    return _ref;
  }
  compartmentaliseExist;
  exports["?"] = macExist;

  function compartmentaliseNotExist(form) {
    var i, val, split, _ref, _res, _ref0, _ref1;
    if ((utils.isList(form) && (form[0] === "get"))) {
      _ref = list.apply(list, [].concat(compartmentaliseNotExist(form[1])).concat([
        ["isa", form, "'undefined'"]
      ]));
    } else if ((typeof form === "string") && utils.isIdentifier(form) && !utils.isSpecialValueStr(form)) {
      _res = [];
      _ref0 = (split = utils.splitName(form));
      for (i = 0; i < _ref0.length; ++i) {
        val = _ref0[i];
        if (typeof(_ref1 = ["isa", split.slice(0, i + 1)
          .join(""), "'undefined'"
        ]) !== 'undefined') _res.push(_ref1);
      }
      _ref = _res;
    } else {
      _ref = [
        ["isa", form, "'undefined'"]
      ];
    }
    return _ref;
  }
  compartmentaliseNotExist;
  exports["?!"] = macNotExist;
  exports.isa = macIsA;
  exports.isnta = macIsNa;
  return exports.any = macAny;
}).call(this);