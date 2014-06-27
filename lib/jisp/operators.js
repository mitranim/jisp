(function() {
  var util, pr, spr, render, isIdentifier, assertForm, operators, ops, op, singops, stateops, opFuncs, _i, _res, _ref, _i0, _res0, _ref0, _i1, _res1, _ref1;
  (util = require("./util"));
  (pr = util.pr);
  (spr = util.spr);
  (render = util.render);
  (isIdentifier = util.isIdentifier);
  (assertForm = util.assertForm);

  function makeop(op, zv, min, max) {
    (!(typeof zv !== 'undefined' && zv !== null)) ? (zv = undefined) : undefined;
    (!(typeof min !== 'undefined' && min !== null)) ? (min = 0) : undefined;
    (!(typeof max !== 'undefined' && max !== null)) ? (max = Infinity) : undefined;
    return (function(args) {
      var i, arg, _res, _ref, _ref0, _ref1;
      if (assertForm(args, min, max)) {
        if (((args.length === 0))) {
          _ref0 = [pr(zv)];
        } else {
          _res = [];
          _ref = args;
          for (i = 0; i < _ref.length; ++i) {
            arg = _ref[i];
            _res.push((args[i] = pr(arg)));
          }
          _res;
          _ref0 = [("(" + args.join((" " + op + " ")) + ")")];
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
    return (function(args) {
      return assertForm(args, 1, 1) ? [("(" + op + " " + spr(args) + ")")] : undefined;
    });
  }
  makesing;

  function reserved(word) {
    throw Error(("keyword " + word + " is reserved"));
    return undefined;
  }
  reserved;

  function makestate(op, min, max) {
    (!(typeof min !== 'undefined' && min !== null)) ? (min = 0) : undefined;
    (!(typeof max !== 'undefined' && max !== null)) ? (max = Infinity) : undefined;
    return (function(args) {
      return assertForm(args, min, max) ? [(op + " " + spr(args)), "undefined"] : undefined;
    });
  }
  makestate;
  (operators = ({
    "++": (function(args) {
      var _ref, _ref0;
      if (assertForm(args, 1, 1)) {
        if ((!isIdentifier(args[0]))) {
          throw Error("expecting identifier, got ", pr(args[0]));
          _ref = undefined;
        } else {
          _ref = [("++" + pr(args[0]))];
        }
        _ref0 = _ref;
      } else {
        _ref0 = undefined;
      }
      return _ref0;
    }),
    "--": (function(args) {
      var _ref, _ref0;
      if (assertForm(args, 1, 1)) {
        if ((!isIdentifier(args[0]))) {
          throw Error("expecting identifier, got ", pr(args[0]));
          _ref = undefined;
        } else {
          _ref = [("--" + pr(args[0]))];
        }
        _ref0 = _ref;
      } else {
        _ref0 = undefined;
      }
      return _ref0;
    }),
    "is": (function(args) {
      var subj, arg, _i, _res, _ref, _ref0;
      if (((args.length === 0))) {
        _ref0 = [true];
      } else if (((args.length === 1))) {
        _ref0 = [("!!" + pr(args[0]))];
      } else {
        (subj = args.shift());
        _res = [];
        _ref = args;
        for (_i = 0; _i < _ref.length; ++_i) {
          arg = _ref[_i];
          _res.push(("(" + pr(subj) + " === " + pr(arg) + ")"));
        }
        _ref0 = [("(" + _res.join(" || ") + ")")];
      }
      return _ref0;
    }),
    "isnt": (function(args) {
      var subj, arg, _i, _res, _ref, _ref0;
      if (((args.length === 0))) {
        _ref0 = [false];
      } else if (((args.length === 1))) {
        _ref0 = [("!" + pr(args[0]))];
      } else {
        (subj = args.shift());
        _res = [];
        _ref = args;
        for (_i = 0; _i < _ref.length; ++_i) {
          arg = _ref[_i];
          _res.push(("(" + pr(subj) + " !== " + pr(arg) + ")"));
        }
        _ref0 = [("(" + _res.join(" && ") + ")")];
      }
      return _ref0;
    }),
    "or": makeop("||", false),
    "and": makeop("&&", true),
    "exists": (function(args) {
      return assertForm(args, 1, 1) ? [("(typeof " + pr(args[0]) + " !== 'undefined' && " + pr(args[0]) + " !== null)")] : undefined;
    }),
    "in": (function(args) {
      return assertForm(args, 2, 2) ? [("([].indexOf.call(" + pr(args[1]) + ", " + pr(args[0]) + ") >= 0)")] : undefined;
    }),
    "new": (function(args) {
      return assertForm(args, 1) ? [("new " + pr(args.shift()) + "(" + spr(args) + ")")] : undefined;
    }),
    "function": (function() {
      return reserved("function");
    }),
    "with": (function() {
      return reserved("with");
    })
  }));
  (ops = [
    ["+", 0],
    ["-", undefined, 1],
    ["*", 1],
    ["/", undefined, 1],
    ["%", undefined, 1],
    ["?", "exists"],
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
  ]);
  _res = [];
  _ref = ops;
  for (_i = 0; _i < _ref.length; ++_i) {
    op = _ref[_i];
    _res.push((((typeof op[1]) === "string")) ? (operators[op[0]] = operators[op[1]]) : (operators[op[0]] = makeop.apply(makeop, [].concat(op))));
  }
  _res;
  (singops = [
    ["not", "!"],
    ["~", "~"],
    ["delete", "delete"],
    ["typeof", "typeof"]
  ]);
  _res0 = [];
  _ref0 = singops;
  for (_i0 = 0; _i0 < _ref0.length; ++_i0) {
    op = _ref0[_i0];
    _res0.push((operators[op[0]] = makesing(op[1])));
  }
  _res0;
  (stateops = [
    ["return", 0, 1],
    ["break", 0, 1],
    ["continue", 0, 0],
    ["throw", 1, 1]
  ]);
  _res1 = [];
  _ref1 = stateops;
  for (_i1 = 0; _i1 < _ref1.length; ++_i1) {
    op = _ref1[_i1];
    _res1.push((operators[op[0]] = makestate(op[0])));
  }
  _res1;
  (exports.operators = operators);
  (opFuncs = ({}));

  function add() {
    var _i2;
    args = 1 <= arguments.length ? [].slice.call(arguments, 0, _i2 = arguments.length - 0) : (_i2 = 0, []);
    args.unshift(0);
    return ((args.length === 0)) ? 0 : args.reduce((function() {
      return (arguments[0] + arguments[1]);
    }));
  }
  add;

  function sub() {
    var _i2;
    args = 1 <= arguments.length ? [].slice.call(arguments, 0, _i2 = arguments.length - 0) : (_i2 = 0, []);
    args.unshift(0);
    return ((args.length === 0)) ? 0 : args.reduce((function() {
      return (arguments[0] - arguments[1]);
    }));
  }
  sub;

  function mul() {
    var _i2;
    args = 1 <= arguments.length ? [].slice.call(arguments, 0, _i2 = arguments.length - 0) : (_i2 = 0, []);
    args.unshift(1);
    return ((args.length === 0)) ? 1 : args.reduce((function() {
      return (arguments[0] * arguments[1]);
    }));
  }
  mul;

  function div() {
    var _i2;
    args = 1 <= arguments.length ? [].slice.call(arguments, 0, _i2 = arguments.length - 0) : (_i2 = 0, []);
    args.unshift(1);
    return ((args.length === 0)) ? 1 : args.reduce((function() {
      return (arguments[0] / arguments[1]);
    }));
  }
  div;
  return (exports.opFuncs = opFuncs);
}).call(this);