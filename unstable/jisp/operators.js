(function() {
  var util, isIdentifier, assertForm, operators, ops, op, singops, stateops, opFuncs, _i, _res, _ref, _ref0, _i0, _res0, _ref1, _i1, _res1, _ref2;
  (util = require("./util"));
  (isIdentifier = util.isIdentifier);
  (assertForm = util.assertForm);

  function makeop(op, zv, min, max) {
    var _ref, _ref0, _ref1;
    if ((!(typeof zv !== 'undefined' && zv !== null))) {
      _ref = (zv = undefined)
    } else {
      _ref = undefined
    }
    _ref;
    if ((!(typeof min !== 'undefined' && min !== null))) {
      _ref0 = (min = 0)
    } else {
      _ref0 = undefined
    }
    _ref0;
    if ((!(typeof max !== 'undefined' && max !== null))) {
      _ref1 = (max = Infinity)
    } else {
      _ref1 = undefined
    }
    _ref1;
    return (function(args) {
      var _ref2, _ref3;
      if (assertForm(args, min, max)) {
        if (((args.length === 0))) {
          _ref3 = [zv]
        } else {
          _ref3 = [("(" + args.join((" " + op + " ")) + ")")]
        }
        _ref2 = _ref3;
      } else {
        _ref2 = undefined
      }
      return _ref2;
    });
  }
  makeop;

  function makesing(op) {
    return (function(args) {
      var _ref;
      if (assertForm(args, 1, 1)) {
        _ref = [("(" + op + " " + args.spread() + ")")]
      } else {
        _ref = undefined
      }
      return _ref;
    })
  }
  makesing;

  function reserved(word) {
    throw Error(("keyword " + word + " is reserved"));
    return undefined;
  }
  reserved;

  function makestate(op, min, max) {
    var _ref, _ref0;
    if ((!(typeof min !== 'undefined' && min !== null))) {
      _ref = (min = 0)
    } else {
      _ref = undefined
    }
    _ref;
    if ((!(typeof max !== 'undefined' && max !== null))) {
      _ref0 = (max = Infinity)
    } else {
      _ref0 = undefined
    }
    _ref0;
    return (function(args) {
      var _ref1;
      if (assertForm(args, min, max)) {
        _ref1 = [(op + " " + args.spread()), "undefined"]
      } else {
        _ref1 = undefined
      }
      return _ref1;
    });
  }
  makestate;
  (operators = {
    "++": (function(args) {
      var _ref, _ref0;
      if (assertForm(args, 1, 1)) {
        if ((!isIdentifier(args[0]))) {
          throw Error("expecting identifier, got ", args[0]);
          _ref0 = undefined;
        } else {
          _ref0 = [("++" + args[0])]
        }
        _ref = _ref0;
      } else {
        _ref = undefined
      }
      return _ref;
    }),
    "--": (function(args) {
      var _ref, _ref0;
      if (assertForm(args, 1, 1)) {
        if ((!isIdentifier(args[0]))) {
          throw Error("expecting identifier, got ", args[0]);
          _ref0 = undefined;
        } else {
          _ref0 = [("--" + args[0])]
        }
        _ref = _ref0;
      } else {
        _ref = undefined
      }
      return _ref;
    }),
    "is": (function(args) {
      var subj, arg, _ref, _i, _res, _ref0;
      if (((args.length === 0))) {
        _ref = [true]
      } else if (((args.length === 1))) {
        _ref = [("!!" + args[0])]
      } else {
        (subj = args.shift());
        _res = [];
        _ref0 = args;
        for (_i = 0; _i < _ref0.length; ++_i) {
          arg = _ref0[_i];
          _res.push(("(" + subj + " === " + arg + ")"))
        }
        _ref = [("(" + _res.join(" || ") + ")")];
      }
      return _ref;
    }),
    "isnt": (function(args) {
      var subj, arg, _ref, _i, _res, _ref0;
      if (((args.length === 0))) {
        _ref = [false]
      } else if (((args.length === 1))) {
        _ref = [("!" + args[0])]
      } else {
        (subj = args.shift());
        _res = [];
        _ref0 = args;
        for (_i = 0; _i < _ref0.length; ++_i) {
          arg = _ref0[_i];
          _res.push(("(" + subj + " !== " + arg + ")"))
        }
        _ref = [("(" + _res.join(" && ") + ")")];
      }
      return _ref;
    }),
    "or": makeop("||", false),
    "and": makeop("&&", true),
    "exists": (function(args) {
      var _ref;
      if (assertForm(args, 1, 1)) {
        _ref = [("(typeof " + args[0] + " !== 'undefined' && " + args[0] + " !== null)")]
      } else {
        _ref = undefined
      }
      return _ref;
    }),
    "in": (function(args) {
      var _ref;
      if (assertForm(args, 2, 2)) {
        _ref = [("([].indexOf.call(" + args[1] + ", " + args[0] + ") >= 0)")]
      } else {
        _ref = undefined
      }
      return _ref;
    }),
    "new": (function(args) {
      var _ref;
      if (assertForm(args, 1)) {
        _ref = [("new " + args.shift() + "(" + args.spread() + ")")]
      } else {
        _ref = undefined
      }
      return _ref;
    }),
    "function": (function() {
      return reserved("function")
    }),
    "with": (function() {
      return reserved("with")
    })
  });
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
    if ((((typeof op[1]) === "string"))) {
      _ref0 = (operators[op[0]] = operators[op[1]])
    } else {
      _ref0 = (operators[op[0]] = makeop.apply(makeop, [].concat(op)))
    }
    _res.push(_ref0);
  }
  _res;
  (singops = [
    ["not", "!"],
    ["~", "~"],
    ["delete", "delete"],
    ["typeof", "typeof"]
  ]);
  _res0 = [];
  _ref1 = singops;
  for (_i0 = 0; _i0 < _ref1.length; ++_i0) {
    op = _ref1[_i0];
    _res0.push((operators[op[0]] = makesing(op[1])))
  }
  _res0;
  (stateops = [
    ["return", 0, 1],
    ["break", 0, 1],
    ["continue", 0, 0],
    ["throw", 1, 1]
  ]);
  _res1 = [];
  _ref2 = stateops;
  for (_i1 = 0; _i1 < _ref2.length; ++_i1) {
    op = _ref2[_i1];
    _res1.push((operators[op[0]] = makestate(op[0])))
  }
  _res1;
  (exports.operators = operators);
  (opFuncs = {});

  function add(args) {
    var _i2, _ref3;
    args = 1 <= arguments.length ? [].slice.call(arguments, 0, _i2 = arguments.length - 0) : (_i2 = _i2, []);
    args.unshift(0);
    if (((args.length === 0))) {
      _ref3 = 0
    } else {
      _ref3 = args.reduce((function() {
        return (arguments[0] + arguments[1])
      }))
    }
    return _ref3;
  }
  add;

  function sub(args) {
    var _i2, _ref3;
    args = 1 <= arguments.length ? [].slice.call(arguments, 0, _i2 = arguments.length - 0) : (_i2 = _i2, []);
    args.unshift(0);
    if (((args.length === 0))) {
      _ref3 = 0
    } else {
      _ref3 = args.reduce((function() {
        return (arguments[0] - arguments[1])
      }))
    }
    return _ref3;
  }
  sub;

  function mul(args) {
    var _i2, _ref3;
    args = 1 <= arguments.length ? [].slice.call(arguments, 0, _i2 = arguments.length - 0) : (_i2 = _i2, []);
    args.unshift(1);
    if (((args.length === 0))) {
      _ref3 = 1
    } else {
      _ref3 = args.reduce((function() {
        return (arguments[0] * arguments[1])
      }))
    }
    return _ref3;
  }
  mul;

  function div(args) {
    var _i2, _ref3;
    args = 1 <= arguments.length ? [].slice.call(arguments, 0, _i2 = arguments.length - 0) : (_i2 = _i2, []);
    args.unshift(1);
    if (((args.length === 0))) {
      _ref3 = 1
    } else {
      _ref3 = args.reduce((function() {
        return (arguments[0] / arguments[1])
      }))
    }
    return _ref3;
  }
  div;
  return (exports.opFuncs = opFuncs);
}).call(this)