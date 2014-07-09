(function() {
  var macCar = function(x) {
    var _i;
    var other = 2 <= arguments.length ? [].slice.call(arguments, 1, _i = arguments.length - 0) : (_i = 1, []);
    if (((typeof x === 'undefined') || (other.length > 0))) {
      throw Error("expecting one argument, got: " + x + ", " + other);
    }
    return ["get", x, 0];
  };
  var macCdr = function(x) {
    var _i;
    var other = 2 <= arguments.length ? [].slice.call(arguments, 1, _i = arguments.length - 0) : (_i = 1, []);
    if (((typeof x === 'undefined') || (other.length > 0))) {
      throw Error("expecting one argument, got: " + x + ", " + other);
    }
    return [
      ["get", x, "slice"], 1
    ];
  };
  var macInit = function(x) {
    var _i;
    var other = 2 <= arguments.length ? [].slice.call(arguments, 1, _i = arguments.length - 0) : (_i = 1, []);
    if (((typeof x === 'undefined') || (other.length > 0))) {
      throw Error("expecting one argument, got: " + x + ", " + other);
    }
    return [
      ["get", x, "slice"], 0, -1
    ];
  };
  var macLast = function(x) {
    var _i;
    var other = 2 <= arguments.length ? [].slice.call(arguments, 1, _i = arguments.length - 0) : (_i = 1, []);
    if (((typeof x === 'undefined') || (other.length > 0))) {
      throw Error("expecting one argument, got: " + x + ", " + other);
    }
    return ["get", [
      ["get", x, "slice"], -1
    ], 0];
  };
  var macLet = function() {
    var body, names, callArgs, name, _i;
    var args = 2 <= arguments.length ? [].slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []);
    body = arguments[_i++];
    if (((args.length % 2) !== 0)) {
      throw Error, ("expecting an even number of arguments, got " + args.length);
    }(typeof body === 'undefined') ? body = [] : undefined;
    names = [];
    callArgs = [];
    while (args.length > 0) {
      name = args.shift();
      true ? names.push(name) : undefined;
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
    var value, comp, elements, _i, _i0, _res, _ref;
    var values = 1 <= arguments.length ? [].slice.call(arguments, 0, _i = arguments.length - 0) : (_i = 0, []);
    _res = [];
    _ref = values;
    for (_i0 = 0; _i0 < _ref.length; ++_i0) {
      value = _ref[_i0];
      comp = compartmentaliseExist(value);
      _res.push(((comp.length > 1) ? [].concat(["and"]).concat(comp) : comp[0]));
    }
    elements = _res;
    return ((elements.length > 1) ? [].concat(["or"]).concat(elements) : elements[0]);
  };
  var macNotExist = function() {
    var value, comp, elements, _i, _i0, _res, _ref;
    var values = 1 <= arguments.length ? [].slice.call(arguments, 0, _i = arguments.length - 0) : (_i = 0, []);
    _res = [];
    _ref = values;
    for (_i0 = 0; _i0 < _ref.length; ++_i0) {
      value = _ref[_i0];
      comp = compartmentaliseNotExist(value);
      _res.push(((comp.length > 1) ? [].concat(["or"]).concat(comp) : comp[0]));
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
    var value, elements, _i, _i0, _res, _ref;
    var values = 1 <= arguments.length ? [].slice.call(arguments, 0, _i = arguments.length - 0) : (_i = 0, []);
    _res = [];
    _ref = values;
    for (_i0 = 0; _i0 < _ref.length; ++_i0) {
      value = _ref[_i0];
      _res.push(["and", ["?", value], value]);
    }
    elements = _res;
    return ((elements.length > 1) ? [].concat(["or"]).concat(elements) : elements[0]);
  };
  var util;
  util = require("./util");
  exports.car = macCar;
  exports.head = macCar;
  exports.cdr = macCdr;
  exports.tail = macCdr;
  exports.init = macInit;
  exports.last = macLast;
  exports.let = macLet;

  function compartmentaliseExist(form) {
    var i, val, split, _ref, _res, _ref0;
    if ((util.isList(form) && (form[0] === "get"))) {
      _ref = list.apply(list, [].concat(compartmentaliseExist(form[1])).concat([
        ["isnta", form, "'undefined'"]
      ]));
    } else if ((typeof form === "string") && util.isIdentifier(form) && !util.isSpecialValueStr(form)) {
      _res = [];
      _ref0 = (split = util.splitName(form));
      for (i = 0; i < _ref0.length; ++i) {
        val = _ref0[i];
        _res.push(["isnta", split.slice(0, i + 1)
          .join(""), "'undefined'"
        ]);
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
    var i, val, split, _ref, _res, _ref0;
    if ((util.isList(form) && (form[0] === "get"))) {
      _ref = list.apply(list, [].concat(compartmentaliseNotExist(form[1])).concat([
        ["isa", form, "'undefined'"]
      ]));
    } else if ((typeof form === "string") && util.isIdentifier(form) && !util.isSpecialValueStr(form)) {
      _res = [];
      _ref0 = (split = util.splitName(form));
      for (i = 0; i < _ref0.length; ++i) {
        val = _ref0[i];
        _res.push(["isa", split.slice(0, i + 1)
          .join(""), "'undefined'"
        ]);
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