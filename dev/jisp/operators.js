(function() {
  var util, pr, spr, render, isIdentifier, assertForm, operators, singops, op, ops, stateops, opFuncs, _i, _ref, _i0, _ref0, _i1, _ref1;
  util = require("./util");
  pr = util.pr;
  spr = util.spr;
  render = util.render;
  isIdentifier = util.isIdentifier;
  assertForm = util.assertForm;

  function makeop(op, zv, min, max, drop) {
    (typeof min === 'undefined') ? min = 0 : undefined;
    (typeof max === 'undefined') ? max = Infinity : undefined;
    (typeof drop === 'undefined') ? drop = false : undefined;
    return (function(args, innerType) {
      var i, arg, res, _ref, _ref0, _ref1;
      if (assertForm(args, min, max)) {
        if ((args.length === 0)) {
          _ref0 = pr(zv);
        } else if ((args.length === 1) && (typeof zv !== 'undefined')) {
          res = zv + op + spr(args);
          (innerType && (innerType !== "parens")) ? res = "(" + res + ")" : undefined;
          _ref0 = res;
        } else if ((args.length === 1) && drop) {
          _ref0 = spr(args);
        } else if (args.length === 1) {
          _ref0 = (op + spr(args));
        } else {
          _ref = args;
          for (i = 0; i < _ref.length; ++i) {
            arg = _ref[i];
            args[i] = pr(arg);
          }
          res = args.join(" " + op + " ");
          (innerType && (innerType !== "parens")) ? res = "(" + res + ")" : undefined;
          _ref0 = res;
        }
        _ref1 = _ref0;
      } else {
        _ref1 = undefined;
      }
      return _ref1;
    });
  }
  makeop;

  function makesing(op) {
    return (function(args, innerType) {
      return (assertForm(args, 1, 1) ? (op + " " + spr(args)) : undefined);
    });
  }
  makesing;

  function reserved(word) {
    throw Error("keyword " + word + " is reserved");
  }
  reserved;

  function makestate(op, min, max) {
    (typeof min === 'undefined') ? min = 0 : undefined;
    (typeof max === 'undefined') ? max = Infinity : undefined;
    return (function(args, innerType) {
      return (assertForm(args, min, max) ? (op + " " + spr(args)) : "undefined");
    });
  }
  makestate;
  operators = {
    "++": (function(args, innerType) {
      var _ref, _ref0;
      if (assertForm(args, 1, 1)) {
        if (!isIdentifier(args[0])) {
          _ref = undefined;
          throw Error("expecting identifier, got ", spr(args));
        } else {
          _ref = ("++" + spr(args));
        }
        _ref0 = _ref;
      } else {
        _ref0 = undefined;
      }
      return _ref0;
    }),
    "--": (function(args, innerType) {
      var _ref, _ref0;
      if (assertForm(args, 1, 1)) {
        if (!isIdentifier(args[0])) {
          _ref = undefined;
          throw Error("expecting identifier, got ", spr(args));
        } else {
          _ref = ("--" + spr(args));
        }
        _ref0 = _ref;
      } else {
        _ref0 = undefined;
      }
      return _ref0;
    }),
    "is": (function(args, innerType) {
      var subj, arg, res, _i, _res, _ref, _ref0;
      if ((args.length === 0)) {
        _ref0 = true;
      } else if (args.length === 1) {
        _ref0 = ("!!" + spr(args));
      } else {
        subj = args.shift();
        _res = [];
        _ref = args;
        for (_i = 0; _i < _ref.length; ++_i) {
          arg = _ref[_i];
          _res.push((pr(subj) + " === " + pr(arg)));
        }
        res = _res
          .join(" || ");
        (innerType && (innerType !== "parens")) ? res = "(" + res + ")" : undefined;
        _ref0 = res;
      }
      return _ref0;
    }),
    "isnt": (function(args, innerType) {
      var subj, arg, res, _i, _res, _ref, _ref0;
      if ((args.length === 0)) {
        _ref0 = false;
      } else if (args.length === 1) {
        _ref0 = ("!" + spr(args));
      } else {
        subj = args.shift();
        _res = [];
        _ref = args;
        for (_i = 0; _i < _ref.length; ++_i) {
          arg = _ref[_i];
          _res.push((pr(subj) + " !== " + pr(arg)));
        }
        res = _res
          .join(" && ");
        (innerType && (innerType !== "parens")) ? res = "(" + res + ")" : undefined;
        _ref0 = res;
      }
      return _ref0;
    }),
    "or": makeop("||", undefined, 1, Infinity, true),
    "and": makeop("&&", undefined, 1, Infinity, true),
    "in": (function(args, innerType) {
      var res, _ref;
      if (assertForm(args, 2, 2)) {
        res = "[].indexOf.call(" + pr(args[1]) + ", " + pr(args[0]) + ") >= 0";
        (innerType && (innerType !== "parens")) ? res = "(" + res + ")" : undefined;
        _ref = res;
      } else {
        _ref = undefined;
      }
      return _ref;
    }),
    "of": makeop("in", undefined, 2, 2),
    "new": (function(args, innerType) {
      return (assertForm(args, 1) ? ("new " + pr(args.shift()) + "(" + spr(args) + ")") : undefined);
    }),
    "function": (function() {
      return reserved("function");
    }),
    "with": (function() {
      return reserved("with");
    })
  };
  singops = [
    ["not", "!"],
    ["~", "~"],
    ["delete", "delete"],
    ["typeof", "typeof"],
    ["!!", "!!"]
  ];
  _ref = singops;
  for (_i = 0; _i < _ref.length; ++_i) {
    op = _ref[_i];
    operators[op[0]] = makesing(op[1]);
  }
  ops = [
    ["+", undefined, 1, Infinity, true],
    ["-", undefined, 1],
    ["*", 1],
    ["/", 1],
    ["%", undefined, 1],
    ["==", "is"],
    ["===", "is"],
    ["!=", "isnt"],
    ["!==", "isnt"],
    ["&&", "and"],
    ["||", "or"],
    ["!", "not"],
    [">", undefined, 2],
    ["<", undefined, 2],
    [">=", undefined, 2],
    ["<=", undefined, 2],
    ["&", undefined, 2],
    ["|", undefined, 2],
    ["^", undefined, 2],
    ["<<", undefined, 2],
    [">>", undefined, 2],
    [">>>", undefined, 2],
    ["+=", undefined, 2],
    ["-=", undefined, 2],
    ["*=", undefined, 2],
    ["/=", undefined, 2],
    ["%=", undefined, 2],
    ["<<=", undefined, 2],
    [">>=", undefined, 2],
    [">>>=", undefined, 2],
    ["&=", undefined, 2],
    ["^=", undefined, 2],
    ["|=", undefined, 2],
    ["instanceof", undefined, 2, 2],
    [",", undefined, 2, 2]
  ];
  _ref0 = ops;
  for (_i0 = 0; _i0 < _ref0.length; ++_i0) {
    op = _ref0[_i0];
    (typeof op[1] === "string") ? operators[op[0]] = operators[op[1]] : operators[op[0]] = makeop.apply(makeop, [].concat(op));
  }
  stateops = [
    ["return", 0, 1],
    ["break", 0, 1],
    ["continue", 0, 0],
    ["throw", 1, 1]
  ];
  _ref1 = stateops;
  for (_i1 = 0; _i1 < _ref1.length; ++_i1) {
    op = _ref1[_i1];
    operators[op[0]] = makestate(op[0]);
  }
  exports.operators = operators;
  opFuncs = {};

  function add() {
    var _i2;
    var args = 1 <= arguments.length ? [].slice.call(arguments, 0, _i2 = arguments.length - 0) : (_i2 = 0, []);
    args.unshift(0);
    return ((args.length === 0) ? 0 : args.reduce((function() {
      return (arguments[0] + arguments[1]);
    })));
  }
  add;

  function sub() {
    var _i2;
    var args = 1 <= arguments.length ? [].slice.call(arguments, 0, _i2 = arguments.length - 0) : (_i2 = 0, []);
    args.unshift(0);
    return ((args.length === 0) ? 0 : args.reduce((function() {
      return (arguments[0] - arguments[1]);
    })));
  }
  sub;

  function mul() {
    var _i2;
    var args = 1 <= arguments.length ? [].slice.call(arguments, 0, _i2 = arguments.length - 0) : (_i2 = 0, []);
    args.unshift(1);
    return ((args.length === 0) ? 1 : args.reduce((function() {
      return (arguments[0] * arguments[1]);
    })));
  }
  mul;

  function div() {
    var _i2;
    var args = 1 <= arguments.length ? [].slice.call(arguments, 0, _i2 = arguments.length - 0) : (_i2 = 0, []);
    args.unshift(1);
    return ((args.length === 0) ? 1 : args.reduce((function() {
      return (arguments[0] / arguments[1]);
    })));
  }
  div;
  return exports.opFuncs = opFuncs;
}).call(this);