(function(root) {
    var jisp = function() {
      function require(path) { return require[path]; }
      require['./utils'] = (function() {
      var exports = {}, module = {exports: exports};
      (function() {
  var keywords, specialValues;
  exports.keywords = (keywords = ["return", "break", "continue", "throw", "delete"]);

  function kwtest(str) {
    var kw, re, _i, _res, _ref, _ref0;
    _res = [];
    _ref = keywords;
    for (_i = 0; _i < _ref.length; ++_i) {
      kw = _ref[_i];
      if (typeof(_ref0 = ("^" + kw + " |^" + kw + "$")) !== 'undefined') _res.push(_ref0);
    }
    re = RegExp(_res
      .join("|"));
    return re.test(str);
  }
  exports.kwtest = kwtest;
  exports.specialValues = (specialValues = ["undefined", "null", "true", "false", "yes", "no", "Infinity", "NaN"]);

  function isSpecialValueStr(str) {
    return ([].indexOf.call(specialValues, str) >= 0);
  }
  exports.isSpecialValueStr = isSpecialValueStr;

  function isSpecialValue(form) {
    return ((typeof form === "undefined") || (form === null) || ((typeof form === "number") && isNaN(form)) || (form === Infinity) || (typeof form === "boolean"));
  }
  exports.isSpecialValue = isSpecialValue;

  function isAtom(form) {
    return ((form === undefined || form === null) || /^\/[^\s\/]+\/[\w]*$/.test(form) || (typeof form === "number" || typeof form === "string" || typeof form === "boolean"));
  }
  exports.isAtom = isAtom;

  function isaString(form) {
    return (typeof form === "string");
  }
  exports.isaString = isaString;

  function isList(form) {
    return Array.isArray(form);
  }
  exports.isList = isList;

  function isHash(form) {
    return (!isAtom(form) && !isList(form) && !(typeof form === "function"));
  }
  exports.isHash = isHash;

  function isBlankObject(form) {
    var _ref, _err;
    try {
      _ref = Object.keys(form).length === 0;
    } catch (_err) {
      _ref = false;
    }
    return _ref;
  }
  exports.isBlankObject = isBlankObject;

  function isKey(form) {
    return (isAtom(form) && (isString(form) || isIdentifier(form) || isNum(form)));
  }
  exports.isKey = isKey;

  function isServiceName(form) {
    return ((typeof form === "string") && /^#/.test(form) && !/^#$|^#\d|^#\.|^#\[/.test(form));
  }
  exports.isService = isServiceName;

  function getServicePart(form) {
    return form.match(/^#[^.[]+/)[0];
  }
  exports.getServicePart = getServicePart;

  function isVarName(form) {
    return (isAtom(form) && /^[$#_A-Za-z]{1}$|^[$#_A-Za-z]+[$_\w]*(?:[$_\w](?!\.))+$/.test(form));
  }
  exports.isVarName = isVarName;

  function isIdentifier(form) {
    return (isAtom(form) && /^[$#_A-Za-z]{1}[$_\w]*((\.[$#_A-Za-z]{1}[$_\w]*)|(\[[$_.\w\[\]]+\])|(\['.*'\])|(\[".*"\]))*$/.test(form));
  }
  exports.isIdentifier = isIdentifier;

  function isString(form) {
    return (isAtom(form) && /^".*"$|^'.*'$/.test(form));
  }
  exports.isString = isString;

  function isRegex(form) {
    return (isAtom(form) && /^\/[^\s]+\/[\w]*[^\s)]*/.test(form));
  }
  exports.isRegex = isRegex;

  function isNum(form) {
    return (isAtom(form) && (typeof typify(form) === "number"));
  }
  exports.isNum = isNum;

  function isPrimitive(form) {
    return (isRegex(form) || isNum(form) || (form === undefined || form === null || form === true || form === false));
  }
  exports.isPrimitive = isPrimitive;

  function isArgHash(form) {
    return (isAtom(form) && /^#[\d]+$/.test(form));
  }
  exports.isArgHash = isArgHash;

  function isArgsHash(form) {
    return (isAtom(form) && /^#$/.test(form));
  }
  exports.isArgsHash = isArgsHash;

  function isArgHashNotation(form) {
    return (isArgHash(form) || isArgsHash(form));
  }
  exports.isArgHashNotation = isArgHashNotation;

  function isDotName(form) {
    return (isAtom(form) && /^\.[$#_A-Za-z]{1}$|^\.[$#_A-Za-z]+[$_.\w]*(?:[$_\w](?!\.))+$/.test(form));
  }
  exports.isDotName = isDotName;

  function isBracketName(form) {
    return (isAtom(form) && /^\[[$#_A-Za-z]{1}\]$|^\[[$#_A-Za-z]+[$_.\w]*(?:[$_\w](?!\.))+\]$/.test(form));
  }
  exports.isBracketName = isBracketName;

  function isBracketString(form) {
    return (isAtom(form) && /^\[".*"\]$|^\['.*'\]$/.test(form));
  }
  exports.isBracketString = isBracketString;

  function isPropSyntax(form) {
    return (isAtom(form) && (isDotName(form) || isBracketName(form) || isBracketString(form)));
  }
  exports.isPropSyntax = isPropSyntax;

  function typify(form) {
    var _ref;
    if (!isAtom(form)) {
      _ref = undefined;
      throw Error("expecting atom, got " + pr(form));
    } else if (isBlankObject(form)) {
      _ref = form;
    } else if (typeof form === "undefined") {
      _ref = undefined;
    } else if (form === "null") {
      _ref = null;
    } else if (form === "true" || form === "yes") {
      _ref = true;
    } else if (form === "false" || form === "no") {
      _ref = false;
    } else if (!isNaN(Number(form))) {
      _ref = Number(form);
    } else if (isRegex(form)) {
      _ref = form;
    } else if (typeof form === "string") {
      _ref = form;
    } else {
      _ref = undefined;
      throw Error("syntax error: unrecognised type of " + pr(form));
    }
    return _ref;
  }
  exports.typify = typify;

  function assertForm(form, min, max, first) {
    var _ref;
    if ((typeof min === 'undefined')) min = 0;
    if ((typeof max === 'undefined')) max = Infinity;
    if (!isList(form)) {
      _ref = undefined;
      throw Error("expecting list, got " + form);
    } else if (!((form.length >= min) && (form.length <= max))) {
      _ref = undefined;
      throw Error("expecting between " + min + " and " + max + " arguments, got " + form.length + ": " + pr(form));
    } else if ((typeof first !== 'undefined') && (form[0] !== first)) {
      _ref = undefined;
      throw Error("expecting " + pr(first) + " as first element, got " + pr(form[0]));
    } else {
      _ref = form;
    }
    return _ref;
  }
  exports.assertForm = assertForm;

  function assertExp(exp, test, expect) {
    var _ref;
    if ((typeof expect === 'undefined')) expect = "valid expression";
    if (test(exp)) {
      _ref = true;
    } else {
      _ref = undefined;
      throw Error("expecting " + pr(expect) + ", got " + pr(exp));
    }
    return _ref;
  }
  exports.assertExp = assertExp;

  function splitName(name) {
    var re, reDot, reBracket, reBracketGreedy, res, reg;
    re = /\.[$_\w]+$|\[[^\[\]]+\]$|\[.+\]$/;
    reDot = /\.[$_\w]+$/;
    reBracket = /\[[^\[\]]+\]$/;
    reBracketGreedy = /\[.+\]$/;
    res = [];
    while (name.match(re)) {
      reg = (name.match(reDot) && reDot) || (name.match(reBracket) && reBracket) || (name.match(reBracketGreedy) && reBracketGreedy);
      res.unshift(name.match(reg)[0]);
      name = name.replace(reg, "");
    }
    res.unshift(name);
    return res;
  }
  exports.splitName = splitName;

  function pr(item) {
    var res, key, val, _ref, _ref0, _i, _ref1;
    if (isAtom(item)) {
      _ref = ("" + item)
        .replace(/;$/, "");
    } else if (isHash(item)) {
      res = "";
      _ref0 = item;
      for (key in _ref0) {
        val = _ref0[key];
        res += (key + ": " + pr(val) + ", ");
      }
      _ref = ("{ " + res.slice(0, -2) + " }");
    } else if (isList(item)) {
      res = "";
      _ref1 = item;
      for (_i = 0; _i < _ref1.length; ++_i) {
        val = _ref1[_i];
        res += (pr(val) + ", ");
      }
      _ref = ("[ " + res.slice(0, -2) + " ]");
    } else {
      _ref = ("" + item);
    }
    return _ref;
  }
  exports.pr = pr;

  function spr(item) {
    var res, val, _i, _ref, _ref0;
    if (isList(item)) {
      res = "";
      _ref = item;
      for (_i = 0; _i < _ref.length; ++_i) {
        val = _ref[_i];
        res += (pr(val) + ", ");
      }
      _ref0 = res.slice(0, res.length - 2);
    } else {
      _ref0 = undefined;
      throw Error("can only print-spread lists");
    }
    return _ref0;
  }
  exports.spr = spr;

  function render(buffer) {
    var i, exp, res, _ref;
    _ref = buffer;
    for (i = 0; i < _ref.length; ++i) {
      exp = _ref[i];
      if (((isList(exp) && (exp.length === 0)) || (typeof exp === "undefined") || (exp === ""))) {
        buffer[i] = undefined;
      } else {
        res = ((typeof exp === "string") ? exp.trim() : pr(exp));
        if ((isHash(exp) || /^function\s*\(/.test(res))) res = "(" + res + ")";
        if (!/:$|\}$|;$/.test(res.slice(-1))) res += ";";
        buffer[i] = res;
      }
    }
    return buffer.join(" ")
      .trim();
  }
  exports.render = render;

  function deParenthesise(str) {
    var _ref;
    if ((typeof str === "string")) {
      while (str.match(/^\({1}/) && str.match(/\){1}$/)) {
        (str = str
          .replace(/^\({1}/, "")
          .replace(/\){1}$/, ""));
      }
      _ref = str;
    } else {
      _ref = str;
    }
    return _ref;
  }
  exports.deParenthesise = deParenthesise;

  function dePairParenthesise(str) {
    var _ref;
    if ((typeof str === "string")) {
      while (str.match(/^\({2}/) && str.match(/\){2}$/)) {
        (str = str
          .replace(/^\({2}/, "(")
          .replace(/\){2}$/, ")"));
      }
      _ref = str;
    } else {
      _ref = str;
    }
    return _ref;
  }
  exports.dePairParenthesise = dePairParenthesise;

  function merge(options, overrides) {
    return extend(extend({}, options), overrides);
  }
  exports.merge = merge;

  function extend(object, properties) {
    var key, val, _ref;
    _ref = properties;
    for (key in _ref) {
      val = _ref[key];
      object[key] = val;
    }
    return object;
  }
  exports.extend = extend;

  function baseFileName(file, stripExt, useWinPathSep) {
    var pathSep, parts;
    if ((typeof stripExt === 'undefined')) stripExt = false;
    if ((typeof useWinPathSep === 'undefined')) useWinPathSep = false;
    pathSep = (useWinPathSep ? /\\|\// : /\//);
    parts = file.split(pathSep);
    file = parts.slice(-1)[0];
    if (!(stripExt && (file.indexOf(".") >= 0))) return file;
    parts = file.split(".");
    parts.pop();
    if (((parts.slice(-1)[0] === "jisp") && (parts.length > 1))) parts.pop();
    return parts.join(".");
  }
  exports.baseFileName = baseFileName;

  function repeat(str, n) {
    var res;
    res = "";
    while (n > 0) {
      if ((n & 1)) res += str;
      n >>>= 1;
      str += str;
    }
    return res;
  }
  exports.repeat = repeat;

  function isJisp(file) {
    return /\.jisp$/.test(file);
  }
  return exports.isJisp = isJisp;
}).call(this);
      return module.exports;
    })();require['./functions'] = (function() {
      var exports = {}, module = {exports: exports};
      (function() {
  function concat() {
    var _res, lst, _i, _i0, _ref;
    var lists = 1 <= arguments.length ? [].slice.call(arguments, 0, _i = arguments.length - 0) : (_i = 0, []);
    _res = [];
    _ref = lists;
    for (_i0 = 0; _i0 < _ref.length; ++_i0) {
      lst = _ref[_i0];
      _res = _res.concat(lst);
    }
    return _res;
  }
  exports.concat = concat;

  function list() {
    var _i;
    var args = 1 <= arguments.length ? [].slice.call(arguments, 0, _i = arguments.length - 0) : (_i = 0, []);
    return [].concat(args);
  }
  exports.list = list;

  function range(start, end) {
    var a, _res, _ref;
    if ((typeof end === 'undefined')) {
      end = start;
      start = 0;
    }
    _res = [];
    while (true) {
      if ((start <= end)) {
        a = start;
        ++start;
        _ref = a;
      } else {
        _ref = undefined;
        break;
      } if (typeof _ref !== 'undefined') _res.push(_ref);
    }
    return _res;
  }
  return exports.range = range;
}).call(this);
      return module.exports;
    })();require['./operators'] = (function() {
      var exports = {}, module = {exports: exports};
      (function() {
  var utils, pr, spr, render, isIdentifier, assertForm, operators, singops, op, ops, stateops, opFuncs, _i, _ref, _i0, _ref0, _i1, _ref1;
  utils = require("./utils");
  pr = utils.pr;
  spr = utils.spr;
  render = utils.render;
  isIdentifier = utils.isIdentifier;
  assertForm = utils.assertForm;

  function makeop(op, zv, min, max, drop) {
    if ((typeof min === 'undefined')) min = 0;
    if ((typeof max === 'undefined')) max = Infinity;
    if ((typeof drop === 'undefined')) drop = false;
    return (function(args, innerType) {
      var i, arg, res, _ref, _ref0, _ref1;
      if (assertForm(args, min, max)) {
        if ((args.length === 0)) {
          _ref0 = pr(zv);
        } else if ((args.length === 1) && (typeof zv !== 'undefined')) {
          res = zv + op + spr(args);
          if ((innerType && (innerType !== "parens"))) res = "(" + res + ")";
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
          if ((innerType && (innerType !== "parens"))) res = "(" + res + ")";
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
    if ((typeof min === 'undefined')) min = 0;
    if ((typeof max === 'undefined')) max = Infinity;
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
      var subj, arg, res, _i, _res, _ref, _ref0, _ref1;
      if ((args.length === 0)) {
        _ref1 = true;
      } else if (args.length === 1) {
        _ref1 = ("!!" + spr(args));
      } else {
        subj = args.shift();
        _res = [];
        _ref = args;
        for (_i = 0; _i < _ref.length; ++_i) {
          arg = _ref[_i];
          if (typeof(_ref0 = (pr(subj) + " === " + pr(arg))) !== 'undefined') _res.push(_ref0);
        }
        res = _res
          .join(" || ");
        if ((innerType && (innerType !== "parens"))) res = "(" + res + ")";
        _ref1 = res;
      }
      return _ref1;
    }),
    "isnt": (function(args, innerType) {
      var subj, arg, res, _i, _res, _ref, _ref0, _ref1;
      if ((args.length === 0)) {
        _ref1 = false;
      } else if (args.length === 1) {
        _ref1 = ("!" + spr(args));
      } else {
        subj = args.shift();
        _res = [];
        _ref = args;
        for (_i = 0; _i < _ref.length; ++_i) {
          arg = _ref[_i];
          if (typeof(_ref0 = (pr(subj) + " !== " + pr(arg))) !== 'undefined') _res.push(_ref0);
        }
        res = _res
          .join(" && ");
        if ((innerType && (innerType !== "parens"))) res = "(" + res + ")";
        _ref1 = res;
      }
      return _ref1;
    }),
    "or": makeop("||", undefined, 1, Infinity, true),
    "and": makeop("&&", undefined, 1, Infinity, true),
    "in": (function(args, innerType) {
      var res, _ref;
      if (assertForm(args, 2, 2)) {
        res = "[].indexOf.call(" + pr(args[1]) + ", " + pr(args[0]) + ") >= 0";
        if ((innerType && (innerType !== "parens"))) res = "(" + res + ")";
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
      return module.exports;
    })();require['./tokenise'] = (function() {
      var exports = {}, module = {exports: exports};
      (function() {
  var tokens, recode, recomment, redstring, resstring, rereg;
  tokens = [];
  recode = /^[^]*?(?=;.*[\n\r]?|""|"[^]*?(?:[^\\]")|''|'[^]*?(?:[^\\]')|\/[^\s]+\/[\w]*)/;
  recomment = /^;.*[\n\r]?/;
  redstring = /^""|^"[^]*?(?:[^\\]")[^\s):\]\}]*/;
  resstring = /^''|^'[^]*?(?:[^\\]')[^\s):\]\}]*/;
  rereg = /^\/[^\s]+\/[\w]*[^\s)]*/;

  function grate(str) {
    return str
      .replace(/;.*$/gm, "")
      .replace(/\{/g, "(fn (")
      .replace(/\}/g, "))")
      .replace(/\(/g, " ( ")
      .replace(/\)/g, " ) ")
      .replace(/\[$/g, " [ ")
      .replace(/\['/g, " [ '")
      .replace(/\["/g, ' [ "')
      .replace(/'\]/g, "' ] ")
      .replace(/"\]/g, '" ] ')
      .replace(/\[[\s]*\(/g, " [ ( ")
      .replace(/\)[\s]*\]/g, " ) ] ")
      .replace(/([^:]):(?!\:)/g, "$1 : ")
      .replace(/`/g, " ` ")
      .replace(/,/g, " , ")
      .replace(/\.\.\./g, " ... ")
      .replace(/…/g, " … ")
      .trim()
      .split(/\s+/);
  }
  grate;

  function concatNewLines(str) {
    return str.replace(/\n|\n\r/g, "\\n");
  }
  concatNewLines;

  function match(str, re) {
    var mask;
    return (((mask = str.match(re)) && (mask[0].length > 0)) ? mask[0] : null);
  }
  match;

  function tokenise(str) {
    var mask;
    tokens = [];
    while ((str = str.trim()).length > 0) {
      if ((mask = match(str, recode))) {
        tokens.push.apply(tokens, [].concat(grate(mask)));
        str = str.replace(recode, "");
      } else if (mask = match(str, recomment)) {
        str = str.replace(recomment, "");
      } else if (mask = match(str, redstring)) {
        tokens.push(concatNewLines(mask));
        str = str.replace(redstring, "");
      } else if (mask = match(str, resstring)) {
        tokens.push(concatNewLines(mask));
        str = str.replace(resstring, "");
      } else if (mask = match(str, rereg)) {
        tokens.push(mask);
        str = str.replace(rereg, "");
      } else {
        tokens.push.apply(tokens, [].concat(grate(str)));
        str = "";
      }
    }
    return tokens.filter((function(x) {
      return ((typeof x !== 'undefined') && (x !== "" && x !== undefined && x !== null));
    }));
  }
  tokenise;
  return module.exports = tokenise;
}).call(this);
      return module.exports;
    })();require['./lex'] = (function() {
      var exports = {}, module = {exports: exports};
      (function() {
  function concat() {
    var _res, lst, _i, _i0, _ref;
    var lists = 1 <= arguments.length ? [].slice.call(arguments, 0, _i = arguments.length - 0) : (_i = 0, []);
    _res = [];
    _ref = lists;
    for (_i0 = 0; _i0 < _ref.length; ++_i0) {
      lst = _ref[_i0];
      _res = _res.concat(lst);
    }
    return _res;
  }
  var utils, pr, spr, isList, isAtom, isaString, isNum, isRegex, isIdentifier, isString, isKey, isDotName, isBracketName, isBracketString, isPropSyntax;
  utils = require("./utils");
  pr = utils.pr;
  spr = utils.spr;
  isList = utils.isList;
  isAtom = utils.isAtom;
  isaString = utils.isaString;
  isNum = utils.isNum;
  isRegex = utils.isRegex;
  isIdentifier = utils.isIdentifier;
  isString = utils.isString;
  isKey = utils.isKey;
  isDotName = utils.isDotName;
  isBracketName = utils.isBracketName;
  isBracketString = utils.isBracketString;
  isPropSyntax = utils.isPropSyntax;

  function printConditions(conditions) {
    var cond, _i, _res, _ref, _ref0;
    _res = [];
    _ref = concat(conditions);
    for (_i = 0; _i < _ref.length; ++_i) {
      cond = _ref[_i];
      if (((typeof cond === "function") && ((typeof cond !== 'undefined') && (typeof cond.name !== 'undefined')))) {
        _ref0 = cond.name;
      } else if (isList(cond)) {
        _ref0 = printConditions(cond);
      } else {
        _ref0 = pr(cond);
      } if (typeof _ref0 !== 'undefined') _res.push(_ref0);
    }
    return _res
      .join("  ");
  }
  printConditions;

  function maketest(condition) {
    var _ref;
    if ((typeof condition === "function")) {
      _ref = (function(tokens) {
        return condition(tokens[0]);
      });
    } else if (isRegex(condition)) {
      _ref = (function(tokens) {
        return condition.test(tokens[0]);
      });
    } else if (isAtom(condition)) {
      _ref = (function(tokens) {
        return (tokens[0] === condition);
      });
    } else if (isList(condition)) {
      _ref = (function(tokens) {
        var i, cond, _res, _ref0, _ref1;
        _res = [];
        _ref0 = condition;
        for (i = 0; i < _ref0.length; ++i) {
          cond = _ref0[i];
          if (!maketest(cond)(tokens.slice(i))) {
            return _ref1 = false;
          } else {
            _ref1 = undefined;
          } if (typeof _ref1 !== 'undefined') _res.push(_ref1);
        }
        return (_res ? true : undefined);
      });
    } else {
      _ref = undefined;
      throw Error("can't test against " + pr(condition));
    }
    return _ref;
  }
  maketest;

  function demand(tokens) {
    var conditions, modes, condition, mode, test, err, _i;
    var args = 2 <= arguments.length ? [].slice.call(arguments, 1, _i = arguments.length - 0) : (_i = 1, []);
    conditions = [];
    modes = [];
    while (args.length > 0) {
      condition = args.shift();
      mode = args.shift();
      conditions.push(condition);
      modes.push(mode);
      test = maketest(condition);
      if (test(tokens)) return lex(tokens, mode);
    }
    err = ((typeof tokens[0] === 'undefined') ? Error("unexpected end of input, probably missing ) ] }") : Error("unexpected " + pr(tokens[0]) + " in possible modes: " + modes.join(" | ") + "\n\nTested against: " + printConditions(conditions) + "\n\nTokens: " + spr(tokens.slice(0, 10)) + ((tokens.length > 10) ? " ..." : " ")));
    throw err;
  }
  demand;

  function expect(tokens) {
    var condition, mode, test, _i, _ref;
    var args = 2 <= arguments.length ? [].slice.call(arguments, 1, _i = arguments.length - 0) : (_i = 1, []);
    while (args.length > 0) {
      condition = args.shift();
      mode = args.shift();
      test = maketest(condition);
      if (test(tokens)) {
        return _ref = lex(tokens, mode);
      } else {
        _ref = undefined;
      }
      _ref;
    }
    return undefined;
  }
  expect;

  function forbid(tokens) {
    var condition, _i, _i0, _res, _ref, _ref0;
    var args = 2 <= arguments.length ? [].slice.call(arguments, 1, _i = arguments.length - 0) : (_i = 1, []);
    _res = [];
    _ref = args;
    for (_i0 = 0; _i0 < _ref.length; ++_i0) {
      condition = _ref[_i0];
      if (maketest(condition)(tokens)) {
        _ref0 = undefined;
        throw Error("unexpected " + pr(tokens[0]));
      } else {
        _ref0 = undefined;
      } if (typeof _ref0 !== 'undefined') _res.push(_ref0);
    }
    return _res;
  }
  forbid;

  function addProperties(tokens, lexed) {
    while (tokens[0] === "[") {
      lexed = ["get", lexed, lex(tokens, "property")];
    }
    return lexed;
  }
  addProperties;

  function lex(tokens, mode) {
    var lexed, prop, key, _ref, _res, _ref0, _ref1;
    if ((typeof mode === 'undefined')) mode = "default";
    switch (mode) {
      case "default":
        _res = [];
        while (tokens.length > 0) {
          if (typeof(_ref0 = demand(tokens, ["(", ":", ")"], "emptyhash", ["(", isKey, ":"], "hash", "(", "list", "`", "quote", ",", "unquote", "...", "spread", "…", "spread", isaString, "atom", undefined, "drop")) !== 'undefined') _res.push(_ref0);
        }
        _ref = _res;
        break;
      case "list":
        demand(tokens, "(", "drop");
        lexed = [];
        if ((prop = expect(tokens, "[", "property", isPropSyntax, "property"))) lexed.push(["get", prop]);
        while (tokens[0] !== ")") {
          lexed.push(demand(tokens, ["(", ":", ")"], "emptyhash", ["(", isKey, ":"], "hash", "(", "list", "`", "quote", ",", "unquote", "...", "spread", "…", "spread", isaString, "atom"));
        }
        demand(tokens, ")", "drop");
        _ref = addProperties(tokens, lexed);
        break;
      case "emptyhash":
        demand(tokens, "(", "drop");
        demand(tokens, ":", "drop");
        demand(tokens, ")", "drop");
        _ref = addProperties(tokens, {});
        break;
      case "hash":
        lexed = {};
        demand(tokens, "(", "drop");
        while (tokens[0] !== ")") {
          key = demand(tokens, isKey, "key");
          demand(tokens, ":", "drop");
          prop = demand(tokens, ["(", ":", ")"], "emptyhash", ["(", isKey, ":"], "hash", "(", "list", "`", "quote", ",", "unquote", isaString, "atom");
          lexed[key] = prop;
        }
        demand(tokens, ")", "drop");
        _ref = addProperties(tokens, lexed);
        break;
      case "property":
        if (isDotName(tokens[0])) {
          _ref1 = demand(tokens, isDotName, "drop").slice(1);
        } else if (isBracketName(tokens[0]) || isBracketString(tokens[0])) {
          _ref1 = demand(tokens, isBracketName, "drop", isBracketString, "drop");
        } else {
          demand(tokens, "[", "drop");
          prop = demand(tokens, "(", "list", ",", "quote", isIdentifier, "atom", isNum, "atom", isString, "atom");
          demand(tokens, "]", "drop");
          _ref1 = prop;
        }
        _ref = _ref1;
        break;
      case "quote":
        demand(tokens, "`", "drop");
        _ref = (lexed = ["quote", demand(tokens, ["(", ":", ")"], "emptyhash", ["(", isKey, ":"], "hash", "(", "list", "`", "quote", ",", "unquote", isaString, "atom")]);
        break;
      case "unquote":
        demand(tokens, ",", "drop");
        _ref = ["unquote", addProperties(tokens, demand(tokens, "(", "list", "`", "quote", "...", "spread", "…", "spread", isIdentifier, "atom"))];
        break;
      case "spread":
        demand(tokens, "...", "drop", "…", "drop");
        _ref = ["spread", addProperties(tokens, demand(tokens, "(", "list", "`", "quote", isIdentifier, "atom"))];
        break;
      case "key":
        key = demand(tokens, isKey, "drop");
        forbid("[", isPropSyntax);
        _ref = key;
        break;
      case "atom":
        _ref = addProperties(tokens, demand(tokens, isaString, "drop"));
        break;
      case "drop":
        _ref = tokens.shift();
        break;
      default:
        _ref = undefined;
        throw Error("unspecified lex mode: " + mode);
    }
    return _ref;
  }
  lex;
  return module.exports = lex;
}).call(this);
      return module.exports;
    })();require['./parse'] = (function() {
      var exports = {}, module = {exports: exports};
      (function() {
  var utils;
  utils = require("./utils");

  function parse(form) {
    var i, val, key, _ref, _ref0, _ref1;
    if (utils.isList(form)) {
      _ref = form;
      for (i = 0; i < _ref.length; ++i) {
        val = _ref[i];
        form[i] = parse(val);
      }
      _ref0 = form;
    } else if (utils.isHash(form)) {
      _ref1 = form;
      for (key in _ref1) {
        val = _ref1[key];
        form[key] = parse(val);
      }
      _ref0 = form;
    } else {
      form = utils.typify(form);
      _ref0 = (/^#(\d+)/.test(form) ? form.replace(/^#(\d+)/, "arguments[$1]") : form);
    }
    return _ref0;
  }
  return module.exports = parse;
}).call(this);
      return module.exports;
    })();require['./macros'] = (function() {
      var exports = {}, module = {exports: exports};
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
      ["get", x, "slice"], 1
    ];
  };
  var macInit = function(x) {
    var _i;
    var other = 2 <= arguments.length ? [].slice.call(arguments, 1, _i = arguments.length - 0) : (_i = 1, []);
    if (((typeof x === 'undefined') || (other.length > 0))) throw Error("expecting one argument, got: " + x + ", " + other);
    return [
      ["get", x, "slice"], 0, -1
    ];
  };
  var macLast = function(x) {
    var _i;
    var other = 2 <= arguments.length ? [].slice.call(arguments, 1, _i = arguments.length - 0) : (_i = 1, []);
    if (((typeof x === 'undefined') || (other.length > 0))) throw Error("expecting one argument, got: " + x + ", " + other);
    return ["get", [
      ["get", x, "slice"], -1
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
      return module.exports;
    })();require['./jisp'] = (function() {
      var exports = {}, module = {exports: exports};
      (function() {
  function list() {
    var _i;
    var args = 1 <= arguments.length ? [].slice.call(arguments, 0, _i = arguments.length - 0) : (_i = 0, []);
    return [].concat(args);
  }

  function range(start, end) {
    var a, _res, _ref;
    if ((typeof end === 'undefined')) {
      end = start;
      start = 0;
    }
    _res = [];
    while (true) {
      if ((start <= end)) {
        a = start;
        ++start;
        _ref = a;
      } else {
        _ref = undefined;
        break;
      } if (typeof _ref !== 'undefined') _res.push(_ref);
    }
    return _res;
  }
  var vm, fs, path, beautify, utils, ops, operators, opFuncs, tokenise, lex, parse, pr, spr, render, isAtom, isHash, isList, isVarName, isIdentifier, isService, getServicePart, assertExp, functionsRedeclare, functionsRedefine, specials, macros, functions;
  exports.version = "0.2.28";
  vm = require("vm");
  fs = require("fs");
  path = require("path");
  beautify = require("js-beautify");
  utils = require("./utils");
  ops = require("./operators");
  operators = ops.operators;
  opFuncs = ops.opFuncs;
  tokenise = require("./tokenise");
  lex = require("./lex");
  parse = require("./parse");
  pr = utils.pr;
  spr = utils.spr;
  render = utils.render;
  isAtom = utils.isAtom;
  isHash = utils.isHash;
  isList = utils.isList;
  isVarName = utils.isVarName;
  isIdentifier = utils.isIdentifier;
  isService = utils.isService;
  getServicePart = utils.getServicePart;
  assertExp = utils.assertExp;
  functionsRedeclare = [];
  functionsRedefine = [];

  function plusname(name) {
    return (isNaN(Number(name.slice(-1)[0])) ? (name + 0) : (name.slice(0, -1) + (1 + Number(name.slice(-1)[0]))));
  }
  plusname;

  function declareVar(name, scope) {
    var _ref;
    if (([].indexOf.call(scope.hoist, name) >= 0)) {
      _ref = scope;
    } else {
      scope.hoist.push(name);
      _ref = scope;
    }
    return _ref;
  }
  declareVar;

  function declareService(name, scope) {
    while (([].indexOf.call(scope.hoist, name) >= 0) || ([].indexOf.call(scope.service, name) >= 0)) {
      name = plusname(name);
    }
    scope.service.push(name);
    return [name, scope];
  }
  declareService;

  function hasSpread(form) {
    return (isList(form) && (form[0] === "spread"));
  }
  hasSpread;

  function compileResolve(form, buffer, scope, opts, nested) {
    var compiled, i, name, newname, re, subst, str, _ref, _i, _ref0, _ref1;
    _ref = compileForm(form, scope, opts, nested);
    compiled = _ref[0];
    scope = _ref[1];
    _ref0 = scope.service;
    for (i in _ref0) {
      name = _ref0[i];
      if (([].indexOf.call(scope.hoist, name) >= 0)) {
        newname = name;
        while ([].indexOf.call(scope.hoist, newname) >= 0) {
          newname = plusname(newname);
        }
        scope.service[i] = newname;
        re = RegExp("(?=(?:[^$#_A-Za-z0-9]{1}|^)" + name + "(?:[^$#_A-Za-z0-9]{1}|$))([^$#_A-Za-z0-9]|^)" + name, "g");
        subst = "$1" + newname;
        _ref1 = buffer;
        for (i = 0; i < _ref1.length; ++i) {
          str = _ref1[i];
          if (((typeof str !== 'undefined') && (typeof str === "string"))) buffer[i] = str.replace(re, subst);
        }
      }
    }
    return [compiled, buffer, scope];
  }
  compileResolve;

  function compileAdd(form, buffer, scope, opts, nested) {
    var compiled, _ref, _i;
    _ref = compileResolve(form, buffer, scope, opts, nested);
    compiled = _ref[0];
    buffer = _ref[1];
    scope = _ref[2];
    buffer.push.apply(buffer, [].concat(compiled));
    return [buffer, scope];
  }
  compileAdd;

  function compileGetLast(form, buffer, scope, opts, nested) {
    var lastItem, _ref, _i;
    _ref = compileAdd(form, buffer, scope, opts, nested);
    buffer = _ref[0];
    scope = _ref[1];
    lastItem = buffer.pop();
    return [lastItem, buffer, scope];
  }
  compileGetLast;

  function returnify(form) {
    var _ref;
    if ((isAtom(form) || isHash(form))) {
      _ref = ["return", form];
    } else if (isList(form) && utils.isBlankObject(form)) {
      _ref = form;
    } else if (isList(form) && (form.length === 1) && utils.isBlankObject(form[0])) {
      _ref = form[0];
    } else if (isList(form) && (form[0] !== "return")) {
      _ref = ["return", form];
    } else {
      _ref = form;
    }
    return _ref;
  }
  returnify;

  function getArgNames(args) {
    var arr, arg, _i, _ref;
    arr = [];
    _ref = args;
    for (_i = 0; _i < _ref.length; ++_i) {
      arg = _ref[_i];
      if ((isAtom(arg) && isVarName(arg))) {
        arr.push(arg);
      } else if (isList(arg) && isVarName(arg[0]) && !([].indexOf.call(Object.keys(specials), arg[0]) >= 0) && !([].indexOf.call(Object.keys(macros), arg[0]) >= 0) && !(arg[0] === "mac")) {
        arr.push(arg[0]);
      }
    }
    return arr;
  }
  getArgNames;

  function notRedefined(name) {
    return (!([].indexOf.call(functionsRedeclare, name) >= 0) && !([].indexOf.call(functionsRedefine, name) >= 0));
  }
  notRedefined;

  function isPropertyExp(form) {
    return (isList(form) && ((isList(form[0]) && (form[0].length === 2) && (form[0][0] === "get")) || utils.isPropSyntax(form[0])));
  }
  isPropertyExp;

  function compileForm(form, scope, opts, nested) {
    var buffer, nestedLocal, first, isOuterOperator, innerType, i, arg, argsSpread, split, method, name, collector, oldReplace, serv, re, key, val, _ref, _i, _ref0, _i0, _ref1, _i1, _ref2, _ref3, _i2, _ref4, _i3, _ref5, _i4, _ref6, _i5, _ref7, _i6, _ref8, _i7, _ref9, _i8, _ref10, _ref11, _i9, _ref12, _i10, _ref13, _i11, _ref14, _ref15, _i12;
    if ((typeof opts === 'undefined')) opts = {};
    if ((isList(form) && utils.isBlankObject(form))) {
      _ref10 = [
        [""], scope
      ];
    } else if (isAtom(form)) {
      if (((([].indexOf.call(Object.keys(functions), form) >= 0) && notRedefined(form)) || ([].indexOf.call(Object.keys(macros), form) >= 0))) {
        if (isService(form)) {
          _ref11 = compileGetLast(form, buffer, scope, opts, nested);
          form = _ref11[0];
          buffer = _ref11[1];
          scope = _ref11[2];
        } else {
          assertExp(form, isVarName, "valid identifier");
          scope = declareVar(form, scope);
        }
      } else if ([].indexOf.call(Object.keys(opFuncs), form) >= 0) {
        if (isService(form)) {
          _ref12 = compileGetLast(form, buffer, scope, opts, nested);
          form = _ref12[0];
          buffer = _ref12[1];
          scope = _ref12[2];
        } else {
          assertExp(form, isVarName, "valid identifier");
          scope = declareVar(form, scope);
        }
        form = opFuncs[form].name;
      }
      if (isService(form)) {
        serv = getServicePart(form);
        re = RegExp("^" + serv);
        if (!([].indexOf.call(Object.keys(scope.replace), serv) >= 0)) {
          _ref13 = declareService(serv.slice(1), scope, (opts.function ? args : undefined));
          scope.replace[serv] = _ref13[0];
          scope = _ref13[1];
        }
        form = form.replace(re, scope.replace[serv]);
      }
      _ref10 = [
        [form], scope
      ];
    } else if (isHash(form)) {
      buffer = [];
      nested = undefined;
      _ref14 = form;
      for (key in _ref14) {
        val = _ref14[key];
        _ref15 = compileGetLast(val, buffer, scope, opts, nested);
        form[key] = _ref15[0];
        buffer = _ref15[1];
        scope = _ref15[2];
      }
      buffer.push(form);
      _ref10 = [buffer, scope];
    } else {
      if (!isList(form)) throw Error("expecting list, got: " + pr(form));
      buffer = [];
      form = form.slice();
      if (([].indexOf.call(Object.keys(specials), form[0]) >= 0)) {
        _ref = specials[form[0]](form, scope, opts, nested);
        buffer = _ref[0];
        scope = _ref[1];
      } else if (form[0] === "mac") {
        _ref8 = compileAdd(parseMacros(form), buffer, scope, opts, nested);
        buffer = _ref8[0];
        scope = _ref8[1];
      } else if ([].indexOf.call(Object.keys(macros), form[0]) >= 0) {
        oldReplace = scope.replace;
        scope.replace = {};
        _ref9 = compileAdd(expandMacros(form), buffer, scope, opts, nested);
        buffer = _ref9[0];
        scope = _ref9[1];
        scope.replace = oldReplace;
      } else {
        nestedLocal = nested;
        nested = undefined;
        _ref0 = compileGetLast(form.shift(), buffer, scope, opts, nested);
        first = _ref0[0];
        buffer = _ref0[1];
        scope = _ref0[2];
        if ((([].indexOf.call(Object.keys(functions), first) >= 0) && notRedefined(first))) {
          if (isService(first)) {
            _ref1 = compileGetLast(first, buffer, scope, opts, nested);
            first = _ref1[0];
            buffer = _ref1[1];
            scope = _ref1[2];
          } else {
            assertExp(first, isVarName, "valid identifier");
            scope = declareVar(first, scope);
          }
        }
        if (([].indexOf.call(Object.keys(operators), first) >= 0)) {
          if (!opts.compilingOperator) isOuterOperator = true;
          innerType = nestedLocal || !!opts.compilingOperator;
          opts.compilingOperator = true;
        } else {
          opts = JSON.parse(JSON.stringify(opts));
          delete opts.compilingOperator;
        }
        _ref2 = form;
        for (i = 0; i < _ref2.length; ++i) {
          arg = _ref2[i];
          if (hasSpread(arg)) {
            argsSpread = true;
            _ref3 = compileGetLast(arg, buffer, scope, opts, nested);
            arg = _ref3[0];
            buffer = _ref3[1];
            scope = _ref3[2];
            form[i] = ["spread", arg];
          } else {
            _ref4 = compileGetLast(arg, buffer, scope, opts, nested);
            arg = _ref4[0];
            buffer = _ref4[1];
            scope = _ref4[2];
            form[i] = arg;
          }
        }
        if ((typeof argsSpread === 'undefined')) {
          ([].indexOf.call(Object.keys(operators), first) >= 0) ? buffer.push(operators[first](form, innerType)) : buffer.push(pr(first) + "(" + spr(form) + ")");
        } else {
          form = ["quote", form];
          _ref5 = compileGetLast(form, buffer, scope, opts, nested);
          form = _ref5[0];
          buffer = _ref5[1];
          scope = _ref5[2];
          if (([].indexOf.call(Object.keys(operators), first) >= 0)) {
            if ((([].indexOf.call(Object.keys(opFuncs), first) >= 0) && spr(opFuncs[first]))) {
              if (isService(first)) {
                _ref6 = compileGetLast(first, buffer, scope, opts, nested);
                first = _ref6[0];
                buffer = _ref6[1];
                scope = _ref6[2];
              } else {
                assertExp(first, isVarName, "valid identifier");
                scope = declareVar(first, scope);
              }
              first = opFuncs[first].name;
            } else {
              throw Error(pr(first) + " can't spread arguments (yet)");
            }
          }
          split = utils.splitName(first);
          if ((split.length > 1)) {
            method = split.pop();
            name = split.join("");
          } else {
            method = "";
            name = split[0];
          } if (isIdentifier(name)) {
            buffer.push(name + method + ".apply(" + name + ", " + pr(form) + ")");
          } else {
            _ref7 = declareService("_ref", scope);
            collector = _ref7[0];
            scope = _ref7[1];
            buffer.push("(" + collector + " = " + name + ")" + method + ".apply(" + collector + ", " + pr(form) + ")");
          }
        }
      } if ((typeof isOuterOperator !== 'undefined')) delete opts.compilingOperator;
      _ref10 = [buffer, scope];
    }
    return _ref10;
  }
  compileForm;
  specials = {};
  specials.do = (function(form, scope, opts, nested) {
    var buffer, formName, nestedLocal, isTopLevel, outerScope, i, exp, ref, vars, funcs, dec, args, name, func, _ref, _ref0, _i, _ref1, _i0, _i1, _ref2, _i2, _ref3, _i3, _ref4;
    if ((typeof opts === 'undefined')) opts = {};
    buffer = [];
    form = form.slice();
    formName = form.shift();
    nestedLocal = ((typeof nested !== 'undefined') ? nested : true);
    nested = undefined;
    if (opts.isTopLevel) {
      isTopLevel = true;
      delete opts.isTopLevel;
    }
    if (isTopLevel) {
      outerScope = scope;
      scope = JSON.parse(JSON.stringify(outerScope));
      delete opts.topScope;
    }
    _ref = form;
    for (i = 0; i < _ref.length; ++i) {
      exp = _ref[i];
      nested = (!isTopLevel && (i === (form.length - 1)) && nestedLocal) || isPropertyExp(form[i + 1]);
      if ((typeof exp === 'undefined')) {
        buffer.push(exp);
      } else {
        if (isPropertyExp(exp)) {
          ref = buffer.pop();
          if ((typeof ref === 'undefined')) ref = "";
          _ref0 = compileAdd(exp, buffer, scope, opts, nested);
          buffer = _ref0[0];
          scope = _ref0[1];
          buffer.push(ref + "\n" + buffer.pop());
        } else {
          _ref1 = compileAdd(exp, buffer, scope, opts, nested);
          buffer = _ref1[0];
          scope = _ref1[1];
        }
      }
    }
    if (isTopLevel) {
      vars = [];
      funcs = [];
      dec = "var ";
      if ((typeof args === 'undefined')) args = [];
      _ref2 = scope.hoist;
      for (_i1 = 0; _i1 < _ref2.length; ++_i1) {
        name = _ref2[_i1];
        if ((!([].indexOf.call(outerScope.hoist, name) >= 0) && !([].indexOf.call(args, name) >= 0))) {
          if (([].indexOf.call(Object.keys(functions), name) >= 0)) {
            if ((opts.topScope && ([].indexOf.call(functionsRedeclare, name) >= 0))) {
              vars.push(name);
            } else {
              if (notRedefined(name)) funcs.push(name);
            }
          } else if (([].indexOf.call(Object.keys(opFuncs), name) >= 0) || ([].indexOf.call(Object.keys(macros), name) >= 0)) {
            funcs.push(name);
          } else {
            vars.push(name);
          }
        }
      }
      _ref3 = scope.service;
      for (_i2 = 0; _i2 < _ref3.length; ++_i2) {
        name = _ref3[_i2];
        if (!([].indexOf.call(outerScope.service, name) >= 0)) vars.push(name);
      }
      while (vars.length > 0) {
        name = vars.shift();
        if (([].indexOf.call(vars, name) >= 0)) throw Error("compiler error: duplicate var in declarations:" + name);
        dec += (name + ", ");
      }
      if ((dec.length > 4)) {
        dec = dec.slice(0, dec.length - 2);
        buffer
          .unshift(dec);
      }
      if (((typeof isTopLevel !== 'undefined') && isTopLevel)) {
        while (funcs.length > 0) {
          func = funcs.pop();
          if (([].indexOf.call(funcs, func) >= 0)) throw Error("compiler error: duplicate func in declarations:" + func);
          if (([].indexOf.call(Object.keys(functions), func) >= 0)) {
            if (notRedefined(func)) {
              if ((((typeof functions !== 'undefined') && (typeof functions[func] !== 'undefined') && (typeof functions[func].name !== 'undefined')) && (functions[func].name !== ""))) {
                buffer
                  .unshift(functions[func].toString());
              } else {
                if (isVarName(func)) buffer
                  .unshift("var " + func + " = " + functions[func].toString() + ";");
              }
            }
          } else if (([].indexOf.call(Object.keys(macros), func) >= 0) && isVarName(func)) {
            buffer
              .unshift("var " + func + " = " + macros[func].toString() + ";");
          } else if (([].indexOf.call(Object.keys(opFuncs), func) >= 0) && isVarName(func)) {
            buffer
              .unshift("var " + opFuncs[func].name + " = " + opFuncs[func].func.toString() + ";");
          } else {
            throw Error("unrecognised func: " + pr(func));
          }
        }
      } else {
        _ref4 = funcs;
        for (_i3 = 0; _i3 < _ref4.length; ++_i3) {
          func = _ref4[_i3];
          if (!([].indexOf.call(outerScope.hoist, func) >= 0)) outerScope.hoist.push(func);
        }
      }
      scope = outerScope;
    }
    return Array(buffer, scope);
  });
  specials.quote = (function(form, scope, opts, nested) {
    var buffer, formName, nestedLocal, arr, res, exp, i, item, key, newform, _i, _ref, _ref0, _i0, _ref1, _i1, _ref2, _i2, _ref3, _i3, _ref4, _i4, _ref5, _ref6, _i5, _ref7, _i6, _ref8, _ref9, _i7, _ref10, _ref11, _i8;
    if ((typeof opts === 'undefined')) opts = {};
    buffer = [];
    form = form.slice();
    formName = form.shift();
    if ((form.length < 1)) throw Error(pr(formName) + " expects no less than " + pr(1) + " arguments");
    if ((form.length > 1)) throw Error(pr(formName) + " expects no more than " + pr(1) + " arguments");
    nestedLocal = ((typeof nested !== 'undefined') ? nested : true);
    nested = undefined;
    form = form[0];
    if ((isAtom(form) && !utils.isPrimitive(form) && !utils.isSpecialValue(form))) {
      buffer.push(JSON.stringify(form));
    } else if (isAtom(form)) {
      buffer.push(form);
    } else if (isHash(form)) {
      if (!opts.macro) {
        _ref8 = form;
        for (key in _ref8) {
          exp = _ref8[key];
          _ref9 = compileGetLast(exp, buffer, scope, opts, nested);
          form[key] = _ref9[0];
          buffer = _ref9[1];
          scope = _ref9[2];
        }
        buffer.push(form);
      } else {
        newform = {};
        _ref10 = form;
        for (key in _ref10) {
          exp = _ref10[key];
          key = JSON.stringify(key);
          _ref11 = compileGetLast(["quote", exp], buffer, scope, opts, nested);
          newform[key] = _ref11[0];
          buffer = _ref11[1];
          scope = _ref11[2];
        }
        buffer.push(newform);
      }
    } else {
      arr = [];
      res = "[]";
      _ref = form;
      for (_i = 0; _i < _ref.length; ++_i) {
        exp = _ref[_i];
        if ((isList(exp) && (exp[0] === "quote") && isList(exp[1]) && (exp[1].length === 0))) {
          arr.push([]);
        } else if (isList(exp) && (exp[0] === "unquote") && isList(exp[1]) && (exp[1][0] === "spread")) {
          _ref2 = compileGetLast(exp.slice(1)[0], buffer, scope, opts, nested);
          exp = _ref2[0];
          buffer = _ref2[1];
          scope = _ref2[2];
          if ((typeof exp !== 'undefined')) {
            if ((arr.length > 0)) {
              res += (".concat(" + pr(arr) + ")");
              arr = [];
            }
            res += (".concat(" + pr(exp) + ")");
          }
        } else if (isList(exp) && (exp[0] === "quote")) {
          _ref3 = compileGetLast(exp, buffer, scope, opts, nested);
          exp = _ref3[0];
          buffer = _ref3[1];
          scope = _ref3[2];
          if ((typeof exp !== 'undefined')) arr.push(exp);
        } else if (isList(exp) && (exp[0] === "unquote")) {
          _ref4 = compileGetLast(exp, buffer, scope, opts, nested);
          exp = _ref4[0];
          buffer = _ref4[1];
          scope = _ref4[2];
          if (((typeof exp !== 'undefined') && opts.macro)) {
            if (isList(exp)) {
              _ref5 = exp;
              for (i = 0; i < _ref5.length; ++i) {
                item = _ref5[i];
                if (isAtom(item)) {
                  _ref6 = compileGetLast(["quote", item], buffer, scope, opts, nested);
                  exp[i] = _ref6[0];
                  buffer = _ref6[1];
                  scope = _ref6[2];
                }
              }
            }
          }
          if ((typeof exp !== 'undefined')) arr.push(exp);
        } else if (isList(exp) && (exp[0] === "spread") && !opts.macro) {
          _ref7 = compileGetLast(exp, buffer, scope, opts, nested);
          exp = _ref7[0];
          buffer = _ref7[1];
          scope = _ref7[2];
          if ((typeof exp !== 'undefined')) {
            if ((arr.length > 0)) {
              res += (".concat(" + pr(arr) + ")");
              arr = [];
            }
            res += (".concat(" + pr(exp) + ")");
          }
        } else {
          if ((isAtom(exp) && !opts.macro)) {
            _ref0 = compileGetLast(exp, buffer, scope, opts, nested);
            exp = _ref0[0];
            buffer = _ref0[1];
            scope = _ref0[2];
          } else {
            _ref1 = compileGetLast(["quote", exp], buffer, scope, opts, nested);
            exp = _ref1[0];
            buffer = _ref1[1];
            scope = _ref1[2];
          } if ((typeof exp !== 'undefined')) arr.push(exp);
        }
      }
      if ((arr.length > 0))(res === "[]") ? res = pr(arr) : res += (".concat(" + pr(arr) + ")");
      buffer.push(res);
    }
    return Array(buffer, scope);
  });
  specials.unquote = (function(form, scope, opts, nested) {
    var buffer, formName, nestedLocal, _ref, _i, _ref0, _i0;
    if ((typeof opts === 'undefined')) opts = {};
    buffer = [];
    form = form.slice();
    formName = form.shift();
    if ((form.length < 1)) throw Error(pr(formName) + " expects no less than " + pr(1) + " arguments");
    if ((form.length > 1)) throw Error(pr(formName) + " expects no more than " + pr(1) + " arguments");
    nestedLocal = ((typeof nested !== 'undefined') ? nested : true);
    nested = undefined;
    form = form[0];
    if ((isList(form) && (form[0] === "quote"))) {
      _ref = compileGetLast(form, buffer, scope, opts, nested);
      form = _ref[0];
      buffer = _ref[1];
      scope = _ref[2];
    }
    _ref0 = compileAdd(form, buffer, scope, opts, nested);
    buffer = _ref0[0];
    scope = _ref0[1];
    return Array(buffer, scope);
  });
  specials["="] = (function(form, scope, opts, nested) {
    var buffer, formName, nestedLocal, left, right, lastAssign, res, ref, ind, spreads, i, name, spreadname, spreadind, _ref, _i, _ref0, _i0, _ref1, _i1, _ref2, _i2, _ref3, _i3, _ref4, _i4, _ref5, _i5, _ref6, _i6, _ref7, _ref8, _i7, _ref9, _i8, _ref10, _i9, _ref11, _i10;
    if ((typeof opts === 'undefined')) opts = {};
    buffer = [];
    form = form.slice();
    formName = form.shift();
    if ((form.length < 1)) throw Error(pr(formName) + " expects no less than " + pr(1) + " arguments");
    nestedLocal = ((typeof nested !== 'undefined') ? nested : true);
    nested = undefined;
    if ((form.length === 1)) {
      if (isService(form[0])) {
        _ref = compileGetLast(form[0], buffer, scope, opts, nested);
        form[0] = _ref[0];
        buffer = _ref[1];
        scope = _ref[2];
      } else {
        assertExp(form[0], isVarName, "valid identifier");
        if ((opts.topScope && ([].indexOf.call(Object.keys(functions), form[0]) >= 0) && !([].indexOf.call(scope.hoist, form[0]) >= 0) && notRedefined(form[0]))) functionsRedeclare.push(form[0]);
        scope = declareVar(form[0], scope);
      }
      _ref0 = compileAdd(form[0], buffer, scope, opts, nested);
      buffer = _ref0[0];
      scope = _ref0[1];
    } else {
      assertExp(form, (function() {
        return ((arguments[0].length % 2) === 0);
      }), "an even number of arguments");
      while (form.length > 0) {
        left = form.shift();
        right = form.shift();
        lastAssign = ((form.length === 0) ? true : undefined);
        _ref1 = compileGetLast(right, buffer, scope, opts, nested);
        right = _ref1[0];
        buffer = _ref1[1];
        scope = _ref1[2];
        if ((isList(left) && ([].indexOf.call(Object.keys(macros), left[0]) >= 0))) {
          _ref2 = compileGetLast(left, buffer, scope, opts, nested);
          left = _ref2[0];
          buffer = _ref2[1];
          scope = _ref2[2];
        }
        if ((isList(left) && (left[0] === "get"))) {
          _ref3 = compileGetLast(left, buffer, scope, opts, nested);
          left = _ref3[0];
          buffer = _ref3[1];
          scope = _ref3[2];
          res = pr(left) + " = " + pr(right);
          if ((lastAssign && nestedLocal && (nestedLocal !== "parens"))) res = "(" + res + ")";
          buffer.push(res);
        } else if (isList(left)) {
          _ref5 = declareService("_ref", scope, (opts.function ? args : undefined));
          ref = _ref5[0];
          scope = _ref5[1];
          _ref6 = declareService("_i", scope, (opts.function ? args : undefined));
          ind = _ref6[0];
          scope = _ref6[1];
          buffer.push(ref + " = " + pr(right));
          spreads = 0;
          _ref7 = left;
          for (i = 0; i < _ref7.length; ++i) {
            name = _ref7[i];
            if ((name[0] === "spread")) {
              if ((++spreads > 1)) throw Error("an assignment can only have one spread");
              _ref8 = compileGetLast(name, buffer, scope, opts, nested);
              name = _ref8[0];
              buffer = _ref8[1];
              scope = _ref8[2];
              if (isService(name)) {
                _ref9 = compileGetLast(name, buffer, scope, opts, nested);
                name = _ref9[0];
                buffer = _ref9[1];
                scope = _ref9[2];
              } else {
                assertExp(name, isVarName, "valid identifier");
                if ((opts.topScope && ([].indexOf.call(Object.keys(functions), name) >= 0) && !([].indexOf.call(scope.hoist, name) >= 0) && notRedefined(name))) functionsRedeclare.push(name);
                scope = declareVar(name, scope);
              }
              spreadname = name;
              spreadind = i;
              buffer.push("var " + spreadname + " = " + left.length + " <= " + ref + ".length ? [].slice.call(" + ref + ", " + spreadind + ", " + ind + " = " + ref + ".length - " + (left.length - spreadind - 1) + ") : (" + ind + " = " + spreadind + ", [])");
            } else if (typeof spreadname === 'undefined') {
              if (isVarName(name)) {
                if (isService(name)) {
                  _ref11 = compileGetLast(name, buffer, scope, opts, nested);
                  name = _ref11[0];
                  buffer = _ref11[1];
                  scope = _ref11[2];
                } else {
                  assertExp(name, isVarName, "valid identifier");
                  if ((opts.topScope && ([].indexOf.call(Object.keys(functions), name) >= 0) && !([].indexOf.call(scope.hoist, name) >= 0) && notRedefined(name))) functionsRedeclare.push(name);
                  scope = declareVar(name, scope);
                }
              }
              buffer.push(pr(name) + " = " + ref + "[" + i + "]");
            } else {
              if (isVarName(name)) {
                if (isService(name)) {
                  _ref10 = compileGetLast(name, buffer, scope, opts, nested);
                  name = _ref10[0];
                  buffer = _ref10[1];
                  scope = _ref10[2];
                } else {
                  assertExp(name, isVarName, "valid identifier");
                  if ((opts.topScope && ([].indexOf.call(Object.keys(functions), name) >= 0) && !([].indexOf.call(scope.hoist, name) >= 0) && notRedefined(name))) functionsRedeclare.push(name);
                  scope = declareVar(name, scope);
                }
              }
              buffer.push(pr(name) + " = " + ref + "[" + ind + "++]");
            }
          }
        } else {
          if (isVarName(left)) {
            if (isService(left)) {
              _ref4 = compileGetLast(left, buffer, scope, opts, nested);
              left = _ref4[0];
              buffer = _ref4[1];
              scope = _ref4[2];
            } else {
              assertExp(left, isVarName, "valid identifier");
              if ((opts.topScope && ([].indexOf.call(Object.keys(functions), left) >= 0) && !([].indexOf.call(scope.hoist, left) >= 0) && notRedefined(left))) functionsRedeclare.push(left);
              scope = declareVar(left, scope);
            }
          }
          assertExp(left, isIdentifier);
          res = pr(left) + " = " + pr(right);
          if ((isHash(right) && !nestedLocal)) res += ";";
          if ((lastAssign && nestedLocal && (nestedLocal !== "parens"))) res = "(" + res + ")";
          buffer.push(res);
        }
      }
    }
    return Array(buffer, scope);
  });
  specials.fn = (function(form, scope, opts, nested) {
    var buffer, formName, nestedLocal, outerScope, args, body, optionals, spreads, i, arg, ind, name, restname, restind, rest, vars, funcs, dec, func, _ref, _i, _ref0, _ref1, _i0, _ref2, _i1, _ref3, _i2, _ref4, _i3, _i4, _ref5, _i5, _ref6, _i6, _ref7;
    if ((typeof opts === 'undefined')) opts = {};
    buffer = [];
    form = form.slice();
    formName = form.shift();
    nestedLocal = ((typeof nested !== 'undefined') ? nested : true);
    nested = undefined;
    outerScope = scope;
    scope = JSON.parse(JSON.stringify(outerScope));
    delete opts.topScope;
    _ref = form;
    var args = 2 <= _ref.length ? [].slice.call(_ref, 0, _i = _ref.length - 1) : (_i = 0, []);
    body = _ref[_i++];
    scope.hoist.push.apply(scope.hoist, [].concat(getArgNames(args)));
    if ((typeof body === 'undefined')) body = [];
    optionals = [];
    spreads = 0;
    _ref0 = args;
    for (i = 0; i < _ref0.length; ++i) {
      arg = _ref0[i];
      if ((isList(arg) && ([].indexOf.call(Object.keys(macros), arg[0]) >= 0))) {
        _ref1 = compileGetLast(arg, buffer, scope, opts, nested);
        arg = _ref1[0];
        buffer = _ref1[1];
        scope = _ref1[2];
      }
      if (isList(arg)) {
        assertExp(arg, (function() {
          return (arguments[0].length === 2);
        }), "optional or rest parameter");
        if ((arg[0] === "spread")) {
          if ((++spreads > 1)) throw Error("cannot define more than one rest parameter");
          _ref2 = declareService("_i", scope, (opts.function ? args : undefined));
          ind = _ref2[0];
          scope = _ref2[1];
          _ref3 = compileGetLast(arg, buffer, scope, opts, nested);
          name = _ref3[0];
          buffer = _ref3[1];
          scope = _ref3[2];
          assertExp(name, isVarName, "valid identifier");
          restname = name;
          restind = i;
          args[i] = restname;
          rest = list("var " + name + " = " + args.length + " <= arguments.length ? [].slice.call(arguments, " + i + ", " + ind + " = arguments.length - " + (args.length - i - 1) + ") : (" + ind + " = " + restind + ", [])");
        } else {
          assertExp((name = arg[0]), isVarName, "valid parameter name");
          args[i] = name;
          optionals.push(["if", ["?!", name],
            ["=", name, arg[1]]
          ]);
        }
      } else if (restname) {
        rest.push(pr(arg) + " = arguments[" + ind + "++]");
      }
    }
    if ((typeof restind !== 'undefined')) args = args.slice(0, restind);
    if ((optionals.length > 0)) body = [].concat(["do"]).concat(optionals).concat([body]);
    body = returnify(body);
    _ref4 = compileResolve(body, buffer, scope, opts, nested);
    body = _ref4[0];
    buffer = _ref4[1];
    scope = _ref4[2];
    if (rest) body.unshift.apply(body, [].concat(rest));
    vars = [];
    funcs = [];
    dec = "var ";
    if ((typeof args === 'undefined')) args = [];
    _ref5 = scope.hoist;
    for (_i4 = 0; _i4 < _ref5.length; ++_i4) {
      name = _ref5[_i4];
      if ((!([].indexOf.call(outerScope.hoist, name) >= 0) && !([].indexOf.call(args, name) >= 0))) {
        if (([].indexOf.call(Object.keys(functions), name) >= 0)) {
          if ((opts.topScope && ([].indexOf.call(functionsRedeclare, name) >= 0))) {
            vars.push(name);
          } else {
            if (notRedefined(name)) funcs.push(name);
          }
        } else if (([].indexOf.call(Object.keys(opFuncs), name) >= 0) || ([].indexOf.call(Object.keys(macros), name) >= 0)) {
          funcs.push(name);
        } else {
          vars.push(name);
        }
      }
    }
    _ref6 = scope.service;
    for (_i5 = 0; _i5 < _ref6.length; ++_i5) {
      name = _ref6[_i5];
      if (!([].indexOf.call(outerScope.service, name) >= 0)) vars.push(name);
    }
    while (vars.length > 0) {
      name = vars.shift();
      if (([].indexOf.call(vars, name) >= 0)) throw Error("compiler error: duplicate var in declarations:" + name);
      dec += (name + ", ");
    }
    if ((dec.length > 4)) {
      dec = dec.slice(0, dec.length - 2);
      body
        .unshift(dec);
    }
    if (((typeof isTopLevel !== 'undefined') && isTopLevel)) {
      while (funcs.length > 0) {
        func = funcs.pop();
        if (([].indexOf.call(funcs, func) >= 0)) throw Error("compiler error: duplicate func in declarations:" + func);
        if (([].indexOf.call(Object.keys(functions), func) >= 0)) {
          if (notRedefined(func)) {
            if ((((typeof functions !== 'undefined') && (typeof functions[func] !== 'undefined') && (typeof functions[func].name !== 'undefined')) && (functions[func].name !== ""))) {
              body
                .unshift(functions[func].toString());
            } else {
              if (isVarName(func)) body
                .unshift("var " + func + " = " + functions[func].toString() + ";");
            }
          }
        } else if (([].indexOf.call(Object.keys(macros), func) >= 0) && isVarName(func)) {
          body
            .unshift("var " + func + " = " + macros[func].toString() + ";");
        } else if (([].indexOf.call(Object.keys(opFuncs), func) >= 0) && isVarName(func)) {
          body
            .unshift("var " + opFuncs[func].name + " = " + opFuncs[func].func.toString() + ";");
        } else {
          throw Error("unrecognised func: " + pr(func));
        }
      }
    } else {
      _ref7 = funcs;
      for (_i6 = 0; _i6 < _ref7.length; ++_i6) {
        func = _ref7[_i6];
        if (!([].indexOf.call(outerScope.hoist, func) >= 0)) outerScope.hoist.push(func);
      }
    }
    scope = outerScope;
    buffer.push("(function(" + spr(args) + ") {" + render(body) + " })");
    return Array(buffer, scope);
  });
  specials.def = (function(form, scope, opts, nested) {
    var buffer, formName, nestedLocal, outerScope, fname, args, body, optionals, spreads, i, arg, ind, name, restname, restind, rest, vars, funcs, dec, func, _ref, _i, _ref0, _i0, _ref1, _ref2, _i1, _ref3, _i2, _ref4, _i3, _ref5, _i4, _i5, _ref6, _i6, _ref7, _i7, _ref8;
    if ((typeof opts === 'undefined')) opts = {};
    buffer = [];
    form = form.slice();
    formName = form.shift();
    nestedLocal = ((typeof nested !== 'undefined') ? nested : true);
    nested = undefined;
    outerScope = scope;
    scope = JSON.parse(JSON.stringify(outerScope));
    delete opts.topScope;
    _ref = form;
    fname = _ref[0];
    var args = 3 <= _ref.length ? [].slice.call(_ref, 1, _i = _ref.length - 1) : (_i = 1, []);
    body = _ref[_i++];
    if (isService(fname)) {
      _ref0 = compileGetLast(fname, buffer, scope, opts, nested);
      fname = _ref0[0];
      buffer = _ref0[1];
      scope = _ref0[2];
    } else {
      assertExp(fname, isVarName, "valid identifier");
      if ((opts.topScope && ([].indexOf.call(Object.keys(functions), fname) >= 0) && !([].indexOf.call(scope.hoist, fname) >= 0) && notRedefined(fname))) functionsRedefine.push(fname);
    }
    scope.hoist.push.apply(scope.hoist, [].concat(getArgNames(args)));
    if ((typeof body === 'undefined')) body = [];
    optionals = [];
    spreads = 0;
    _ref1 = args;
    for (i = 0; i < _ref1.length; ++i) {
      arg = _ref1[i];
      if ((isList(arg) && ([].indexOf.call(Object.keys(macros), arg[0]) >= 0))) {
        _ref2 = compileGetLast(arg, buffer, scope, opts, nested);
        arg = _ref2[0];
        buffer = _ref2[1];
        scope = _ref2[2];
      }
      if (isList(arg)) {
        assertExp(arg, (function() {
          return (arguments[0].length === 2);
        }), "optional or rest parameter");
        if ((arg[0] === "spread")) {
          if ((++spreads > 1)) throw Error("cannot define more than one rest parameter");
          _ref3 = declareService("_i", scope, (opts.function ? args : undefined));
          ind = _ref3[0];
          scope = _ref3[1];
          _ref4 = compileGetLast(arg, buffer, scope, opts, nested);
          name = _ref4[0];
          buffer = _ref4[1];
          scope = _ref4[2];
          assertExp(name, isVarName, "valid identifier");
          restname = name;
          restind = i;
          args[i] = restname;
          rest = list("var " + name + " = " + args.length + " <= arguments.length ? [].slice.call(arguments, " + i + ", " + ind + " = arguments.length - " + (args.length - i - 1) + ") : (" + ind + " = " + restind + ", [])");
        } else {
          assertExp((name = arg[0]), isVarName, "valid parameter name");
          args[i] = name;
          optionals.push(["if", ["?!", name],
            ["=", name, arg[1]]
          ]);
        }
      } else if (restname) {
        rest.push(pr(arg) + " = arguments[" + ind + "++]");
      }
    }
    if ((typeof restind !== 'undefined')) args = args.slice(0, restind);
    if ((optionals.length > 0)) body = [].concat(["do"]).concat(optionals).concat([body]);
    body = returnify(body);
    _ref5 = compileResolve(body, buffer, scope, opts, nested);
    body = _ref5[0];
    buffer = _ref5[1];
    scope = _ref5[2];
    if (rest) body.unshift.apply(body, [].concat(rest));
    vars = [];
    funcs = [];
    dec = "var ";
    if ((typeof args === 'undefined')) args = [];
    _ref6 = scope.hoist;
    for (_i5 = 0; _i5 < _ref6.length; ++_i5) {
      name = _ref6[_i5];
      if ((!([].indexOf.call(outerScope.hoist, name) >= 0) && !([].indexOf.call(args, name) >= 0))) {
        if (([].indexOf.call(Object.keys(functions), name) >= 0)) {
          if ((opts.topScope && ([].indexOf.call(functionsRedeclare, name) >= 0))) {
            vars.push(name);
          } else {
            if (notRedefined(name)) funcs.push(name);
          }
        } else if (([].indexOf.call(Object.keys(opFuncs), name) >= 0) || ([].indexOf.call(Object.keys(macros), name) >= 0)) {
          funcs.push(name);
        } else {
          vars.push(name);
        }
      }
    }
    _ref7 = scope.service;
    for (_i6 = 0; _i6 < _ref7.length; ++_i6) {
      name = _ref7[_i6];
      if (!([].indexOf.call(outerScope.service, name) >= 0)) vars.push(name);
    }
    while (vars.length > 0) {
      name = vars.shift();
      if (([].indexOf.call(vars, name) >= 0)) throw Error("compiler error: duplicate var in declarations:" + name);
      dec += (name + ", ");
    }
    if ((dec.length > 4)) {
      dec = dec.slice(0, dec.length - 2);
      body
        .unshift(dec);
    }
    if (((typeof isTopLevel !== 'undefined') && isTopLevel)) {
      while (funcs.length > 0) {
        func = funcs.pop();
        if (([].indexOf.call(funcs, func) >= 0)) throw Error("compiler error: duplicate func in declarations:" + func);
        if (([].indexOf.call(Object.keys(functions), func) >= 0)) {
          if (notRedefined(func)) {
            if ((((typeof functions !== 'undefined') && (typeof functions[func] !== 'undefined') && (typeof functions[func].name !== 'undefined')) && (functions[func].name !== ""))) {
              body
                .unshift(functions[func].toString());
            } else {
              if (isVarName(func)) body
                .unshift("var " + func + " = " + functions[func].toString() + ";");
            }
          }
        } else if (([].indexOf.call(Object.keys(macros), func) >= 0) && isVarName(func)) {
          body
            .unshift("var " + func + " = " + macros[func].toString() + ";");
        } else if (([].indexOf.call(Object.keys(opFuncs), func) >= 0) && isVarName(func)) {
          body
            .unshift("var " + opFuncs[func].name + " = " + opFuncs[func].func.toString() + ";");
        } else {
          throw Error("unrecognised func: " + pr(func));
        }
      }
    } else {
      _ref8 = funcs;
      for (_i7 = 0; _i7 < _ref8.length; ++_i7) {
        func = _ref8[_i7];
        if (!([].indexOf.call(outerScope.hoist, func) >= 0)) outerScope.hoist.push(func);
      }
    }
    scope = outerScope;
    buffer.push("function " + fname + "(" + spr(args) + ") {" + render(body) + " }");
    buffer.push(fname);
    return Array(buffer, scope);
  });
  specials.mac = (function(form) {
    return makeMacro(form);
  });

  function collect(compiled, collector, isCase, nestedLocal) {
    var plug, lastItem;
    if ((typeof isCase === 'undefined')) isCase = false;
    if ((typeof nestedLocal === 'undefined')) nestedLocal = true;
    if ((isList(compiled) && (compiled.length > 0))) {
      if (/\{$/.test(compiled.slice(-1)[0])) plug = compiled.pop();
      lastItem = compiled.pop();
      if (nestedLocal) {
        if (/^return\s/.test(lastItem)) {
          lastItem = lastItem.replace(/^return\s/, "return " + collector + " = ");
        } else if (utils.kwtest(lastItem)) {
          lastItem = collector + " = undefined; " + lastItem;
        } else {
          lastItem = collector + " = " + pr(lastItem);
        }
      }
      compiled.push(lastItem);
      if (isCase) compiled.push("break");
      if ((typeof plug !== 'undefined')) compiled.push(plug);
    }
    return compiled;
  }
  collect;
  specials.if = (function(form, scope, opts, nested) {
    var buffer, formName, nestedLocal, predicate, prebranch, midcases, postbranch, res, collector, i, mid, midtest, midbranch, comp, _ref, _i, _ref0, _i0, _ref1, _i1, _ref2, _i2, _ref3, _i3, _ref4, _ref5, _i4, _ref6, _i5, _ref7, _i6, _i7, _ref8;
    if ((typeof opts === 'undefined')) opts = {};
    buffer = [];
    form = form.slice();
    formName = form.shift();
    nestedLocal = ((typeof nested !== 'undefined') ? nested : true);
    nested = undefined;
    _ref = form;
    predicate = _ref[0];
    prebranch = _ref[1];
    var midcases = 4 <= _ref.length ? [].slice.call(_ref, 2, _i = _ref.length - 1) : (_i = 2, []);
    postbranch = _ref[_i++];
    if ((isList(postbranch) && (postbranch[0] === "elif"))) {
      midcases.push(postbranch);
      postbranch = undefined;
    }
    nested = true;
    _ref0 = compileGetLast(predicate, buffer, scope, opts, nested);
    predicate = _ref0[0];
    buffer = _ref0[1];
    scope = _ref0[2];
    if ((typeof predicate === 'undefined')) predicate = "false";
    nested = nestedLocal;
    _ref1 = compileResolve(prebranch, buffer, scope, opts, nested);
    prebranch = _ref1[0];
    buffer = _ref1[1];
    scope = _ref1[2];
    _ref2 = compileResolve(postbranch, buffer, scope, opts, nested);
    postbranch = _ref2[0];
    buffer = _ref2[1];
    scope = _ref2[2];
    if ((!nestedLocal && (prebranch.length <= 1) && (midcases.length === 0) && ((postbranch.length === 0) || (typeof postbranch[0] === 'undefined') || (postbranch[0] === "")))) {
      res = "if (" + pr(predicate) + ")" + pr(prebranch[0]) + ";";
      buffer.push(res, "");
    } else if ((prebranch.length === 1) && !utils.kwtest(prebranch[0]) && (midcases.length === 0) && (postbranch.length === 1) && !utils.kwtest(postbranch[0])) {
      res = pr(predicate) + " ? " + (pr(prebranch[0]) || undefined) + " : " + (pr(postbranch[0]) || undefined);
      if ((nestedLocal && (nestedLocal !== "parens"))) res = "(" + res + ")";
      buffer.push(res);
    } else {
      if (nestedLocal) {
        _ref3 = declareService("_ref", scope, (opts.function ? args : undefined));
        collector = _ref3[0];
        scope = _ref3[1];
      }
      prebranch = collect(prebranch, collector, false, nestedLocal);
      postbranch = collect(postbranch, collector, false, nestedLocal);
      _ref4 = midcases;
      for (i = 0; i < _ref4.length; ++i) {
        mid = _ref4[i];
        assertExp(mid, (function(x) {
          return (x.shift() === "elif");
        }), "elif");
        _ref5 = mid;
        midtest = _ref5[0];
        midbranch = _ref5[1];
        _ref6 = compileResolve(midtest, buffer, scope, opts, "parens");
        midtest = _ref6[0];
        buffer = _ref6[1];
        scope = _ref6[2];
        if ((typeof midtest === 'undefined')) midtest = "false";
        if ((midtest.length > 1)) throw Error(pr("elif") + " must compile to single expression (todo fix later); got:" + pr(midtest));
        _ref7 = compileResolve(midbranch, buffer, scope, opts, nested);
        midbranch = _ref7[0];
        buffer = _ref7[1];
        scope = _ref7[2];
        midcases[i] = {
          test: midtest,
          branch: collect(midbranch, collector, false, nestedLocal)
        };
      }
      comp = "if (" + pr(predicate) + ") { " + render(prebranch) + " } ";
      _ref8 = midcases;
      for (_i7 = 0; _i7 < _ref8.length; ++_i7) {
        mid = _ref8[_i7];
        comp += (" else if (" + spr(mid.test) + ") { " + render(mid.branch) + " }");
      }
      if (((typeof postbranch !== 'undefined') && ((postbranch.length > 1) || (typeof postbranch[0] !== 'undefined')))) comp += (" else { " + render(postbranch) + " }");
      buffer.push(comp);
      nestedLocal ? buffer.push(collector) : buffer.push("");
    }
    return Array(buffer, scope);
  });
  specials.switch = (function(form, scope, opts, nested) {
    var buffer, formName, nestedLocal, predicate, midcases, postbranch, collector, i, mid, midtest, midbranch, comp, _ref, _i, _ref0, _i0, _ref1, _i1, _ref2, _ref3, _i2, _ref4, _i3, _ref5, _i4, _ref6, _i5, _i6, _ref7;
    if ((typeof opts === 'undefined')) opts = {};
    buffer = [];
    form = form.slice();
    formName = form.shift();
    nestedLocal = ((typeof nested !== 'undefined') ? nested : true);
    nested = undefined;
    _ref = form;
    predicate = _ref[0];
    var midcases = 3 <= _ref.length ? [].slice.call(_ref, 1, _i = _ref.length - 1) : (_i = 1, []);
    postbranch = _ref[_i++];
    if (((typeof postbranch !== 'undefined') && (postbranch[0] === "case"))) {
      midcases.push(postbranch);
      postbranch = undefined;
    }
    if (nestedLocal) {
      _ref0 = declareService("_ref", scope, (opts.function ? args : undefined));
      collector = _ref0[0];
      scope = _ref0[1];
    }
    _ref1 = compileGetLast(predicate, buffer, scope, opts, "parens");
    predicate = _ref1[0];
    buffer = _ref1[1];
    scope = _ref1[2];
    if ((typeof predicate === 'undefined')) predicate = "false";
    nested = nestedLocal;
    _ref2 = midcases;
    for (i = 0; i < _ref2.length; ++i) {
      mid = _ref2[i];
      assertExp(mid, (function(x) {
        return (x.shift() === "case");
      }), "case");
      _ref3 = mid;
      midtest = _ref3[0];
      midbranch = _ref3[1];
      _ref4 = compileResolve(midtest, buffer, scope, opts, nested);
      midtest = _ref4[0];
      buffer = _ref4[1];
      scope = _ref4[2];
      if ((typeof midtest === 'undefined')) midtest = "false";
      if ((midtest.length > 1)) throw Error(pr("case") + " must compile to single expression (todo fix later); got: " + pr(midtest));
      _ref5 = compileResolve(midbranch, buffer, scope, opts, nested);
      midbranch = _ref5[0];
      buffer = _ref5[1];
      scope = _ref5[2];
      midcases[i] = {
        test: midtest,
        branch: collect(midbranch, collector, true, nestedLocal)
      };
    }
    _ref6 = compileResolve(postbranch, buffer, scope, opts, nested);
    postbranch = _ref6[0];
    buffer = _ref6[1];
    scope = _ref6[2];
    postbranch = collect(postbranch, collector, false, nestedLocal);
    comp = "switch (" + pr(predicate) + ") { ";
    _ref7 = midcases;
    for (_i6 = 0; _i6 < _ref7.length; ++_i6) {
      mid = _ref7[_i6];
      comp += (" case " + spr(mid.test) + ": " + render(mid.branch));
    }
    comp += (" default: " + render(postbranch) + " }");
    buffer.push(comp);
    nestedLocal ? buffer.push(collector) : buffer.push("");
    return Array(buffer, scope);
  });
  specials.for = (function(form, scope, opts, nested) {
    var buffer, formName, nestedLocal, value, key, iterable, body, collector, ref, rear, subst, tested, _ref, _i, _ref0, _i0, _ref1, _i1, _ref2, _i2, _ref3, _i3, _ref4, _i4, _ref5, _i5, _ref6, _i6, _ref7, _i7, _ref8, _i8, _ref9, _i9, _ref10, _i10, _ref11, _i11;
    if ((typeof opts === 'undefined')) opts = {};
    buffer = [];
    form = form.slice();
    formName = form.shift();
    if ((form.length < 2)) throw Error(pr(formName) + " expects no less than " + pr(2) + " arguments");
    if ((form.length > 4)) throw Error(pr(formName) + " expects no more than " + pr(4) + " arguments");
    nestedLocal = ((typeof nested !== 'undefined') ? nested : true);
    nested = undefined;
    _ref = form;
    value = _ref[0];
    key = _ref[1];
    iterable = _ref[2];
    body = _ref[3];
    if ((typeof body === 'undefined')) {
      if ((typeof iterable === 'undefined')) {
        if ((isNaN(Number(value)) || !(parseInt(value) > 0))) throw Error("expecting integer, got " + pr(value));
        body = key;
        iterable = ["quote", [range, 1, [parseInt, value]]];
        _ref0 = declareService("_i", scope, (opts.function ? args : undefined));
        key = _ref0[0];
        scope = _ref0[1];
        _ref1 = declareService("_val", scope, (opts.function ? args : undefined));
        value = _ref1[0];
        scope = _ref1[1];
      } else {
        body = iterable;
        iterable = key;
        _ref2 = declareService("_i", scope, (opts.function ? args : undefined));
        key = _ref2[0];
        scope = _ref2[1];
        if (isService(value)) {
          _ref3 = compileGetLast(value, buffer, scope, opts, nested);
          value = _ref3[0];
          buffer = _ref3[1];
          scope = _ref3[2];
        } else {
          assertExp(value, isVarName, "valid identifier");
          if ((opts.topScope && ([].indexOf.call(Object.keys(functions), value) >= 0) && !([].indexOf.call(scope.hoist, value) >= 0) && notRedefined(value))) functionsRedeclare.push(value);
          scope = declareVar(value, scope);
        }
      }
    } else {
      if (isService(key)) {
        _ref4 = compileGetLast(key, buffer, scope, opts, nested);
        key = _ref4[0];
        buffer = _ref4[1];
        scope = _ref4[2];
      } else {
        assertExp(key, isVarName, "valid identifier");
        if ((opts.topScope && ([].indexOf.call(Object.keys(functions), key) >= 0) && !([].indexOf.call(scope.hoist, key) >= 0) && notRedefined(key))) functionsRedeclare.push(key);
        scope = declareVar(key, scope);
      } if (isService(value)) {
        _ref5 = compileGetLast(value, buffer, scope, opts, nested);
        value = _ref5[0];
        buffer = _ref5[1];
        scope = _ref5[2];
      } else {
        assertExp(value, isVarName, "valid identifier");
        if ((opts.topScope && ([].indexOf.call(Object.keys(functions), value) >= 0) && !([].indexOf.call(scope.hoist, value) >= 0) && notRedefined(value))) functionsRedeclare.push(value);
        scope = declareVar(value, scope);
      }
    }
    assertExp(key, isVarName, "valid identifier");
    assertExp(value, isVarName, "valid identifier");
    if (nestedLocal) {
      _ref6 = declareService("_res", scope, (opts.function ? args : undefined));
      collector = _ref6[0];
      scope = _ref6[1];
      buffer.push(collector + " = []");
    }
    _ref7 = declareService("_ref", scope, (opts.function ? args : undefined));
    ref = _ref7[0];
    scope = _ref7[1];
    _ref8 = compileGetLast(iterable, buffer, scope, opts, nested);
    iterable = _ref8[0];
    buffer = _ref8[1];
    scope = _ref8[2];
    buffer.push(ref + " = " + pr(iterable));
    nested = nestedLocal;
    _ref9 = compileResolve(body, buffer, scope, opts, nested);
    body = _ref9[0];
    buffer = _ref9[1];
    scope = _ref9[2];
    if ((nestedLocal && !utils.kwtest(pr(body.slice(-1)[0])))) {
      rear = body.pop();
      if ((utils.isPrimitive(rear) || utils.isString(rear) || utils.isSpecialValue(rear) || utils.isSpecialValueStr(rear))) {
        body.push(collector + ".push(" + pr(rear) + ")");
      } else if (isIdentifier(rear)) {
        _ref11 = compileGetLast(["?", rear], buffer, scope, opts, "parens");
        tested = _ref11[0];
        buffer = _ref11[1];
        scope = _ref11[2];
        body.push("if (" + tested + ") " + collector + ".push(" + pr(rear) + ")");
      } else {
        _ref10 = declareService("_ref", scope, (opts.function ? args : undefined));
        subst = _ref10[0];
        scope = _ref10[1];
        body.push("if (typeof (" + subst + " = " + pr(rear) + ") !== 'undefined') " + collector + ".push(" + subst + ")");
      }
    }
    buffer.push("for (" + key + " = 0; " + key + " < " + ref + ".length; ++" + key + ") { " + value + " = " + ref + "[" + key + "]; " + render(body) + " }");
    nestedLocal ? buffer.push(collector) : buffer.push("");
    return Array(buffer, scope);
  });
  specials.over = (function(form, scope, opts, nested) {
    var buffer, formName, nestedLocal, value, key, iterable, body, collector, ref, rear, subst, tested, _ref, _i, _ref0, _i0, _ref1, _i1, _ref2, _i2, _ref3, _i3, _ref4, _i4, _ref5, _i5, _ref6, _i6, _ref7, _i7, _ref8, _i8, _ref9, _i9, _ref10, _i10, _ref11, _i11;
    if ((typeof opts === 'undefined')) opts = {};
    buffer = [];
    form = form.slice();
    formName = form.shift();
    if ((form.length < 2)) throw Error(pr(formName) + " expects no less than " + pr(2) + " arguments");
    if ((form.length > 4)) throw Error(pr(formName) + " expects no more than " + pr(4) + " arguments");
    nestedLocal = ((typeof nested !== 'undefined') ? nested : true);
    nested = undefined;
    _ref = form;
    value = _ref[0];
    key = _ref[1];
    iterable = _ref[2];
    body = _ref[3];
    if ((typeof body === 'undefined')) {
      body = iterable;
      iterable = key;
      _ref0 = declareService("_key", scope, (opts.function ? args : undefined));
      key = _ref0[0];
      scope = _ref0[1];
      if (isService(value)) {
        _ref1 = compileGetLast(value, buffer, scope, opts, nested);
        value = _ref1[0];
        buffer = _ref1[1];
        scope = _ref1[2];
      } else {
        assertExp(value, isVarName, "valid identifier");
        if ((opts.topScope && ([].indexOf.call(Object.keys(functions), value) >= 0) && !([].indexOf.call(scope.hoist, value) >= 0) && notRedefined(value))) functionsRedeclare.push(value);
        scope = declareVar(value, scope);
      }
    } else if (typeof iterable === 'undefined') {
      body = key;
      iterable = value;
      _ref4 = declareService("_key", scope, (opts.function ? args : undefined));
      key = _ref4[0];
      scope = _ref4[1];
      _ref5 = declareService("_val", scope, (opts.function ? args : undefined));
      value = _ref5[0];
      scope = _ref5[1];
    } else {
      if (isService(key)) {
        _ref2 = compileGetLast(key, buffer, scope, opts, nested);
        key = _ref2[0];
        buffer = _ref2[1];
        scope = _ref2[2];
      } else {
        assertExp(key, isVarName, "valid identifier");
        if ((opts.topScope && ([].indexOf.call(Object.keys(functions), key) >= 0) && !([].indexOf.call(scope.hoist, key) >= 0) && notRedefined(key))) functionsRedeclare.push(key);
        scope = declareVar(key, scope);
      } if (isService(value)) {
        _ref3 = compileGetLast(value, buffer, scope, opts, nested);
        value = _ref3[0];
        buffer = _ref3[1];
        scope = _ref3[2];
      } else {
        assertExp(value, isVarName, "valid identifier");
        if ((opts.topScope && ([].indexOf.call(Object.keys(functions), value) >= 0) && !([].indexOf.call(scope.hoist, value) >= 0) && notRedefined(value))) functionsRedeclare.push(value);
        scope = declareVar(value, scope);
      }
    }
    assertExp(key, isVarName, "valid identifier");
    assertExp(value, isVarName, "valid identifier");
    if (nestedLocal) {
      _ref6 = declareService("_res", scope, (opts.function ? args : undefined));
      collector = _ref6[0];
      scope = _ref6[1];
      buffer.push(collector + " = []");
    }
    _ref7 = declareService("_ref", scope, (opts.function ? args : undefined));
    ref = _ref7[0];
    scope = _ref7[1];
    _ref8 = compileGetLast(iterable, buffer, scope, opts, nested);
    iterable = _ref8[0];
    buffer = _ref8[1];
    scope = _ref8[2];
    buffer.push(ref + " = " + pr(iterable));
    nested = nestedLocal;
    _ref9 = compileResolve(body, buffer, scope, opts, nested);
    body = _ref9[0];
    buffer = _ref9[1];
    scope = _ref9[2];
    if ((nestedLocal && !utils.kwtest(pr(body.slice(-1)[0])))) {
      rear = body.pop();
      if ((utils.isPrimitive(rear) || utils.isString(rear) || utils.isSpecialValue(rear) || utils.isSpecialValueStr(rear))) {
        body.push(collector + ".push(" + pr(rear) + ")");
      } else if (isIdentifier(rear)) {
        _ref11 = compileGetLast(["?", rear], buffer, scope, opts, "parens");
        tested = _ref11[0];
        buffer = _ref11[1];
        scope = _ref11[2];
        body.push("if (" + tested + ") " + collector + ".push(" + pr(rear) + ")");
      } else {
        _ref10 = declareService("_ref", scope, (opts.function ? args : undefined));
        subst = _ref10[0];
        scope = _ref10[1];
        body.push("if (typeof (" + subst + " = " + pr(rear) + ") !== 'undefined') " + collector + ".push(" + subst + ")");
      }
    }
    buffer.push("for (" + key + " in " + ref + ") { " + value + " = " + ref + "[" + key + "]; " + render(body) + " }");
    nestedLocal ? buffer.push(collector) : buffer.push("");
    return Array(buffer, scope);
  });
  specials.while = (function(form, scope, opts, nested) {
    var buffer, formName, nestedLocal, test, body, rvalue, collector, comp, rear, subst, tested, _ref, _i, _ref0, _i0, _ref1, _i1, _ref2, _i2, _ref3, _i3, _ref4, _i4, _ref5, _i5;
    if ((typeof opts === 'undefined')) opts = {};
    buffer = [];
    form = form.slice();
    formName = form.shift();
    if ((form.length < 2)) throw Error(pr(formName) + " expects no less than " + pr(2) + " arguments");
    if ((form.length > 3)) throw Error(pr(formName) + " expects no more than " + pr(3) + " arguments");
    nestedLocal = ((typeof nested !== 'undefined') ? nested : true);
    nested = undefined;
    _ref = form;
    test = _ref[0];
    body = _ref[1];
    rvalue = _ref[2];
    if ((form.length === 2)) {
      if (nestedLocal) {
        _ref0 = declareService("_res", scope, (opts.function ? args : undefined));
        collector = _ref0[0];
        scope = _ref0[1];
        buffer.push(collector + " = []");
      }
    } else {
      comp = "";
    }
    _ref1 = compileGetLast(test, buffer, scope, opts, "parens");
    test = _ref1[0];
    buffer = _ref1[1];
    scope = _ref1[2];
    nested = nestedLocal;
    _ref2 = compileResolve(body, buffer, scope, opts, nested);
    body = _ref2[0];
    buffer = _ref2[1];
    scope = _ref2[2];
    if ((nestedLocal && (form.length === 2) && !utils.kwtest(pr(body.slice(-1)[0])))) {
      rear = body.pop();
      if ((utils.isPrimitive(rear) || utils.isString(rear) || utils.isSpecialValue(rear) || utils.isSpecialValueStr(rear))) {
        body.push(collector + ".push(" + pr(rear) + ")");
      } else if (isIdentifier(rear)) {
        _ref4 = compileGetLast(["?", rear], buffer, scope, opts, "parens");
        tested = _ref4[0];
        buffer = _ref4[1];
        scope = _ref4[2];
        body.push("if (" + tested + ") " + collector + ".push(" + pr(rear) + ")");
      } else {
        _ref3 = declareService("_ref", scope, (opts.function ? args : undefined));
        subst = _ref3[0];
        scope = _ref3[1];
        body.push("if (typeof (" + subst + " = " + pr(rear) + ") !== 'undefined') " + collector + ".push(" + subst + ")");
      }
    }
    buffer.push("while (" + pr(test) + ") { " + render(body) + " }");
    if ((form.length === 2)) {
      nestedLocal ? buffer.push(collector) : buffer.push("");
    } else {
      _ref5 = compileResolve(rvalue, buffer, scope, opts, nested);
      rvalue = _ref5[0];
      buffer = _ref5[1];
      scope = _ref5[2];
      buffer.push(render(rvalue));
    }
    return Array(buffer, scope);
  });
  specials.try = (function(form, scope, opts, nested) {
    var buffer, formName, nestedLocal, tryForm, catchForm, finalForm, collector, err, res, _ref, _i, _ref0, _i0, _ref1, _i1, _ref2, _i2, _ref3, _i3, _ref4, _i4, _ref5, _i5;
    if ((typeof opts === 'undefined')) opts = {};
    buffer = [];
    form = form.slice();
    formName = form.shift();
    if ((form.length < 1)) throw Error(pr(formName) + " expects no less than " + pr(1) + " arguments");
    if ((form.length > 3)) throw Error(pr(formName) + " expects no more than " + pr(3) + " arguments");
    nestedLocal = ((typeof nested !== 'undefined') ? nested : true);
    nested = undefined;
    _ref = form;
    tryForm = _ref[0];
    catchForm = _ref[1];
    finalForm = _ref[2];
    _ref0 = compileResolve(tryForm, buffer, scope, opts, "parens");
    tryForm = _ref0[0];
    buffer = _ref0[1];
    scope = _ref0[2];
    if (nestedLocal) {
      _ref1 = declareService("_ref", scope, (opts.function ? args : undefined));
      collector = _ref1[0];
      scope = _ref1[1];
      tryForm.push(collector + " = " + pr(tryForm.pop()));
    }
    if ((isList(catchForm) && (catchForm[0] === "catch"))) {
      assertExp(catchForm, (function() {
        return (arguments[0].length === 2 || arguments[0].length === 3);
      }), "valid catch form");
      _ref2 = catchForm;
      catchForm = _ref2[0];
      err = _ref2[1];
      catchForm = _ref2[2];
      assertExp(err, isVarName, "valid identifier");
    } else {
      _ref3 = declareService("_err", scope, (opts.function ? args : undefined));
      err = _ref3[0];
      scope = _ref3[1];
    } if ((typeof catchForm === 'undefined')) catchForm = undefined;
    nested = nestedLocal;
    _ref4 = compileResolve(catchForm, buffer, scope, opts, nested);
    catchForm = _ref4[0];
    buffer = _ref4[1];
    scope = _ref4[2];
    if ((nestedLocal && !utils.kwtest(pr(catchForm.slice(-1)[0])))) catchForm.push(collector + " = " + pr(catchForm.pop()));
    if ((typeof finalForm !== 'undefined')) {
      if ((isList(finalForm) && (finalForm[0] === "finally"))) {
        assertExp(finalForm, (function() {
          return (arguments[0].length === 2);
        }));
        finalForm = finalForm.slice(-1)[0];
      }
      _ref5 = compileResolve(finalForm, buffer, scope, opts, nested);
      finalForm = _ref5[0];
      buffer = _ref5[1];
      scope = _ref5[2];
      if ((nestedLocal && !utils.kwtest(pr(finalForm.slice(-1)[0])))) finalForm.push(collector + " = " + pr(finalForm.pop()));
    }
    res = "try { " + render(tryForm) + " } catch (" + pr(err) + ") { " + render(catchForm) + " }";
    if ((typeof finalForm !== 'undefined')) res += (" finally { " + render(finalForm) + " }");
    buffer.push(res);
    nestedLocal ? buffer.push(collector) : buffer.push("");
    return Array(buffer, scope);
  });
  specials.get = (function(form, scope, opts, nested) {
    var buffer, formName, nestedLocal, object, property, _ref, _i, _ref0, _i0, _ref1, _i1;
    if ((typeof opts === 'undefined')) opts = {};
    buffer = [];
    form = form.slice();
    formName = form.shift();
    if ((form.length < 1)) throw Error(pr(formName) + " expects no less than " + pr(1) + " arguments");
    if ((form.length > 2)) throw Error(pr(formName) + " expects no more than " + pr(2) + " arguments");
    nestedLocal = ((typeof nested !== 'undefined') ? nested : true);
    nested = undefined;
    _ref = form;
    object = _ref[0];
    property = _ref[1];
    if ((typeof property === 'undefined')) {
      property = object;
      object = "";
    }
    _ref0 = compileGetLast(object, buffer, scope, opts, nested);
    object = _ref0[0];
    buffer = _ref0[1];
    scope = _ref0[2];
    _ref1 = compileGetLast(property, buffer, scope, opts, nested);
    property = _ref1[0];
    buffer = _ref1[1];
    scope = _ref1[2];
    assertExp(object, (function() {
      return ((typeof arguments !== 'undefined') && (typeof arguments[0] !== 'undefined'));
    }), "valid object");
    isVarName(property) ? buffer.push(pr(object) + "." + property) : buffer.push(pr(object) + "[" + pr(property) + "]");
    return Array(buffer, scope);
  });
  specials.spread = (function(form, scope, opts, nested) {
    var buffer, formName, nestedLocal, _ref, _i;
    if ((typeof opts === 'undefined')) opts = {};
    buffer = [];
    form = form.slice();
    formName = form.shift();
    if ((form.length < 1)) throw Error(pr(formName) + " expects no less than " + pr(1) + " arguments");
    if ((form.length > 1)) throw Error(pr(formName) + " expects no more than " + pr(1) + " arguments");
    nestedLocal = ((typeof nested !== 'undefined') ? nested : true);
    nested = undefined;
    form = form[0];
    if (isList(form)) {
      _ref = compileAdd(form, buffer, scope, opts, nested);
      buffer = _ref[0];
      scope = _ref[1];
    } else if (isAtom(form)) {
      buffer.push(form);
    } else {
      throw Error("spread requires atom, got: " + pr(form));
    }
    return Array(buffer, scope);
  });
  specials.return = (function(form, scope, opts, nested) {
    var buffer, formName, nestedLocal, _ref, _i;
    if ((typeof opts === 'undefined')) opts = {};
    buffer = [];
    form = form.slice();
    formName = form.shift();
    if ((form.length > 1)) throw Error(pr(formName) + " expects no more than " + pr(1) + " arguments");
    nestedLocal = ((typeof nested !== 'undefined') ? nested : true);
    nested = undefined;
    if ((form.length !== 0)) {
      _ref = compileGetLast(form[0], buffer, scope, opts, true);
      form = _ref[0];
      buffer = _ref[1];
      scope = _ref[2];
      if (!utils.kwtest(form)) form = "return " + pr(form);
      buffer.push(form);
    }
    return Array(buffer, scope);
  });
  macros = {};

  function importMacros() {
    var store, key, val, _i, _i0, _ref, _ref0;
    var stores = 1 <= arguments.length ? [].slice.call(arguments, 0, _i = arguments.length - 0) : (_i = 0, []);
    _ref = stores;
    for (_i0 = 0; _i0 < _ref.length; ++_i0) {
      store = _ref[_i0];
      _ref0 = store;
      for (key in _ref0) {
        val = _ref0[key];
        macros[key] = val;
      }
    }
    return macros;
  }
  exports.importMacros = importMacros;
  importMacros(require("./macros"));

  function parseMacros(form) {
    var key, val, i, _ref, _ref0;
    if (utils.isHash(form)) {
      _ref = form;
      for (key in _ref) {
        val = _ref[key];
        form[key] = parseMacros(val);
      }
    } else if (utils.isList(form)) {
      if ((form[0] === "mac")) {
        form = makeMacro(form.slice(1));
      } else if ((form.length >= 1) && utils.isList(form[0]) && (form[0][0] === "mac")) {
        form[0] = makeMacro(form[0].slice(1), true);
      } else {
        _ref0 = form;
        for (i = 0; i < _ref0.length; ++i) {
          val = _ref0[i];
          form[i] = parseMacros(val);
        }
      }
    }
    return form;
  }
  parseMacros;

  function makeMacro(form, selfExpand) {
    var name, body, compiled, scope, rendered, _ref, _i, _ref0, _i0;
    _ref = form;
    name = _ref[0];
    var body = 2 <= _ref.length ? [].slice.call(_ref, 1, _i = _ref.length - 0) : (_i = 1, []);
    if ((typeof name === 'undefined')) throw Error("a macro requires a name");
    if ((typeof body === 'undefined')) throw Error("a macro requires a body");
    body = ["do", [].concat(["fn"]).concat(body)];
    _ref0 = compileForm(body, {
      hoist: [],
      service: [],
      replace: {}
    }, {
      macro: true,
      isTopLevel: true
    });
    compiled = _ref0[0];
    scope = _ref0[1];
    rendered = render(compiled);
    macros[name] = jispEval(rendered);
    return (selfExpand ? name : []);
  }
  makeMacro;

  function expandMacros(form) {
    var key, val, i, args, _ref, _ref0;
    if (utils.isHash(form)) {
      _ref = form;
      for (key in _ref) {
        val = _ref[key];
        form[key] = expandMacros(val);
      }
    } else if (utils.isList(form)) {
      if ((form[0] === "mac")) {
        form = parseMacros(form);
      } else if ([].indexOf.call(Object.keys(macros), form[0]) >= 0) {
        args = form.slice(1);
        form = macros[form[0]].apply(macros, [].concat(args));
        if ((typeof form === "undefined")) form = [];
      } else {
        _ref0 = form;
        for (i = 0; i < _ref0.length; ++i) {
          val = _ref0[i];
          form[i] = expandMacros(val);
        }
      }
    }
    return form;
  }
  expandMacros;
  functions = {};

  function importFunctions() {
    var store, key, val, _i, _i0, _ref, _ref0;
    var stores = 1 <= arguments.length ? [].slice.call(arguments, 0, _i = arguments.length - 0) : (_i = 0, []);
    _ref = stores;
    for (_i0 = 0; _i0 < _ref.length; ++_i0) {
      store = _ref[_i0];
      _ref0 = store;
      for (key in _ref0) {
        val = _ref0[key];
        if ((typeof val === "function"))(((typeof val !== 'undefined') && (typeof val.name !== 'undefined')) && (val.name !== "")) ? functions[val.name] = val : functions[key] = val;
      }
    }
    return functions;
  }
  exports.importFunctions = importFunctions;
  importFunctions(require("./functions"));
  exports.utils = utils;
  exports.fileExtensions = [".jisp"];
  exports.register = (function() {
    return require("./register");
  });
  exports.tokenise = (function(src) {
    return tokenise(src);
  });
  exports.lex = (function(src) {
    return lex(tokenise(src));
  });
  exports.parse = (function(src) {
    return parse(lex(tokenise(src)));
  });
  exports.macros = macros;
  exports.functions = functions;

  function compile(src, opts) {
    var defaults, parsed, compiled, scope, _ref, _i;
    defaults = {
      wrap: true,
      topScope: true,
      isTopLevel: true,
      pretty: true
    };
    opts = utils.merge(defaults, opts);
    parsed = parse(lex(tokenise(src)));
    parsed.unshift("do");
    if (opts.wrap) parsed = [
      ["get", ["fn", parsed], "call"], "this"
    ];
    if (!opts.repl) {
      functionsRedeclare = [];
      functionsRedefine = [];
    }
    _ref = compileForm(parseMacros(parsed), {
      hoist: [],
      service: [],
      replace: {}
    }, opts);
    compiled = _ref[0];
    scope = _ref[1];
    return ((opts.pretty && (typeof beautify !== 'undefined')) ? beautify(render(compiled), {
      indent_size: 2
    }) : render(compiled));
  }
  exports.compile = compile;

  function jispEval(src) {
    return (((typeof vm !== 'undefined') && ((typeof vm !== 'undefined') && (typeof vm.runInThisContext !== 'undefined'))) ? vm.runInThisContext(src) : eval(src));
  }
  exports.eval = jispEval;

  function compileFile(filename) {
    var raw, stripped, _ref;
    raw = fs.readFileSync(filename, "utf8");
    stripped = ((raw.charCodeAt(0) === 65279) ? raw.substring(1) : raw);
    try {
      _ref = exports.compile(stripped);
    } catch (err) {
      throw err;
    }
    return _ref;
  }
  exports.compileFile = compileFile;

  function run(code, options) {
    var mainModule, dir;
    if ((typeof options === 'undefined')) options = {};
    mainModule = require.main;
    mainModule.filename = (process.argv[1] = (options.filename ? fs.realpathSync(options.filename) : "."));
    if (mainModule.moduleCache) mainModule.moduleCache = {};
    dir = (options.filename ? path.dirname(fs.realpathSync(options.filename)) : fs.realpathSync("."));
    mainModule.paths = require("module")._nodeModulePaths(dir);
    if ((!utils.isJisp(mainModule.filename) || require.extensions)) code = exports.compile(code);
    return mainModule._compile(code, mainModule.filename);
  }
  return exports.run = run;
}).call(this);
      return module.exports;
    })();require['./browser'] = (function() {
      var exports = {}, module = {exports: exports};
      (function() {
  var jisp, compile;
  jisp = require("./jisp");
  jisp.require = require;
  compile = jisp.compile;
  jisp.eval = (function(code, options) {
    if ((typeof options === 'undefined')) options = {};
    options.wrap = false;
    return eval(compile(code, options));
  });
  jisp.run = (function(code, options) {
    var compiled;
    if ((typeof options === 'undefined')) options = {};
    options.wrap = false;
    compiled = compile(code, options);
    return Function(compile(code, options))();
  });
  if ((typeof window === 'undefined')) return;
  jisp.load = (function(url, callback, options, hold) {
    var xhr;
    if ((typeof options === 'undefined')) options = {};
    if ((typeof hold === 'undefined')) hold = false;
    options.sourceFiles = [url];
    xhr = (window.ActiveXObject ? new window.ActiveXObject("Microsoft.XMLHTTP") : new window.XMLHttpRequest());
    xhr.open("GET", url, true);
    if (("overrideMimeType" in xhr)) xhr.overrideMimeType("text/plain");
    xhr.onreadystatechange = (function() {
      var param;
      if ((xhr.readyState === 4)) {
        if ((xhr.status === 0 || xhr.status === 200)) {
          param = [xhr.responseText, options];
          if (!hold) jisp.run.apply(jisp, [].concat(param));
        } else {
          throw new Error(("Could not load " + url));
        }
      }
      return (callback ? callback(param) : undefined);
    });
    return xhr.send(null);
  });

  function runScripts() {
    var scripts, jisps, index, s, i, script, _i, _ref, _ref0;
    scripts = window.document.getElementsByTagName("script");
    jisps = [];
    index = 0;
    _ref = scripts;
    for (_i = 0; _i < _ref.length; ++_i) {
      s = _ref[_i];
      if ((s.type === "text/jisp")) jisps.push(s);
    }

    function execute() {
      var param, _ref0;
      param = jisps[index];
      if ((param instanceof Array)) {
        jisp.run.apply(jisp, [].concat(param));
        ++index;
        _ref0 = execute();
      } else {
        _ref0 = undefined;
      }
      return _ref0;
    }
    execute;
    _ref0 = jisps;
    for (i = 0; i < _ref0.length; ++i) {
      script = _ref0[i];
      (function(script, i) {
        var options, _ref1;
        options = {};
        if (script.src) {
          _ref1 = jisp.load(script.src, (function(param) {
            jisps[i] = param;
            return execute();
          }), options, true);
        } else {
          options.sourceFiles = ["embedded"];
          _ref1 = (jisps[i] = [script.innerHTML, options]);
        }
        return _ref1;
      })(script, i);
    }
    return execute();
  }
  runScripts;
  return window.addEventListener ? window.addEventListener("DOMContentLoaded", runScripts, false) : window.attachEvent("onload", runScripts);
}).call(this);
      return module.exports;
    })();
      return require['./jisp'];
    }();
    root.jisp = jisp;
  }(this));