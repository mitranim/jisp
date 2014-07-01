(function() {
    var jisp = function() {
      function require(path) { return require[path]; }
      require['./util'] = (function() {
      var exports = {}, module = {exports: exports};
      (function() {
  var symbolWhitelist, keywords;
  (exports.symbolWhitelist = (symbolWhitelist = ["+", "-", "*", "/", "%", "++", "--", "?", "?!", "==", "===", "!=", "!==", "&&", "||", "!", ">", "<", ">=", "<=", "&", "|", "^", "<<", ">>", ">>>", "~", "=", "+=", "-=", "*=", "/=", "%=", "<<=", ">>=", ">>>=", "&=", "^=", "|="]));
  (exports.keywords = (keywords = ["return", "break", "continue"]));

  function kwtest(str) {
    return (/^return/.test(str) || /^break/.test(str) || /^continue/.test(str));
  }(exports.kwtest = kwtest);

  function isAtom(form) {
    return (((form === undefined) || (form === null)) || /^\/[^\s\/]+\/[\w]*$/.test(form) || (((typeof form) === "number") || ((typeof form) === "string") || ((typeof form) === "boolean")));
  }(exports.isAtom = isAtom);

  function isAtomString(form) {
    return (isNum(form) || isRegex(form) || isIdentifier(form) || isString(form) || ([].indexOf.call(symbolWhitelist, form) >= 0) || /^#[\d]+$/.test(form) || /^#$/.test(form));
  }(exports.isAtomString = isAtomString);

  function isList(form) {
    return Array.isArray(form);
  }(exports.isList = isList);

  function isHash(form) {
    return ((!isAtom(form)) && (!isList(form)) && (!(((typeof form) === "function"))));
  }(exports.isHash = isHash);

  function isBlankObject(form) {
    var _ref, _err;
    try {
      _ref = ((Object.keys(form).length === 0));
    } catch (_err) {
      _ref = false;
    }
    return _ref;
  }(exports.isBlankObject = isBlankObject);

  function isKey(form) {
    return (isAtom(form) && (isString(form) || isIdentifier(form) || isNum(form)));
  }(exports.isKey = isKey);

  function isVarName(form) {
    return (isAtom(form) && /^[$_A-Za-z]{1}$|^[$_A-Za-z]+[$_\w]*(?:[$_\w](?!\.))+$/.test(form));
  }(exports.isVarName = isVarName);

  function isIdentifier(form) {
    return (isAtom(form) && /^[$_A-Za-z]{1}[$_\w]*((\.[$_A-Za-z]{1}[$_\w]*)|(\[[$_.\w\[\]]+\])|(\['.*'\])|(\[".*"\]))*$/.test(form));
  }(exports.isIdentifier = isIdentifier);

  function isString(form) {
    return (isAtom(form) && /^".*"$|^'.*'$/.test(form));
  }(exports.isString = isString);

  function isRegex(form) {
    return (isAtom(form) && /^\/[^\s]+\/[\w]*[^\s)]*/.test(form));
  }(exports.isRegex = isRegex);

  function isNum(form) {
    return (isAtom(form) && (((typeof typify(form)) === "number")));
  }(exports.isNum = isNum);

  function isPrimitive(form) {
    return (isRegex(form) || isNum(form) || ((form === undefined) || (form === null) || (form === true) || (form === false)));
  }(exports.isPrimitive = isPrimitive);

  function isArgHash(form) {
    return (isAtom(form) && /^#[\d]+$/.test(form));
  }(exports.isArgHash = isArgHash);

  function isArgsHash(form) {
    return (isAtom(form) && /^#$/.test(form));
  }(exports.isArgsHash = isArgsHash);

  function isArgHashNotation(form) {
    return (isArgHash(form) || isArgsHash(form));
  }(exports.isArgHashNotation = isArgHashNotation);

  function isDotName(form) {
    return (isAtom(form) && /^\.[$_A-Za-z]{1}$|^\.[$_A-Za-z]+[$_.\w]*(?:[$_\w](?!\.))+$/.test(form));
  }(exports.isDotName = isDotName);

  function isBracketName(form) {
    return (isAtom(form) && /^\[[$_A-Za-z]{1}\]$|^\[[$_A-Za-z]+[$_.\w]*(?:[$_\w](?!\.))+\]$/.test(form));
  }(exports.isBracketName = isBracketName);

  function isBracketString(form) {
    return (isAtom(form) && /^\[".*"\]$|^\['.*'\]$/.test(form));
  }(exports.isBracketString = isBracketString);

  function isPropSyntax(form) {
    return (isAtom(form) && (isDotName(form) || isBracketName(form) || isBracketString(form)));
  }(exports.isPropSyntax = isPropSyntax);

  function typify(form) {
    var _ref;
    if ((!isAtom(form))) {
      throw Error(("expecting atom, got " + pr(form)));
      _ref = undefined;
    } else if (isBlankObject(form)) {
      _ref = form;
    } else if ((((typeof form) === "undefined"))) {
      _ref = undefined;
    } else if (((form === "null"))) {
      _ref = null;
    } else if (((form === "true") || (form === "yes"))) {
      _ref = true;
    } else if (((form === "false") || (form === "no"))) {
      _ref = false;
    } else if ((!isNaN(Number(form)))) {
      _ref = Number(form);
    } else if (isRegex(form)) {
      _ref = form;
    } else if ((((typeof form) === "string"))) {
      _ref = form;
    } else {
      throw Error(("syntax error: unrecognised type of " + pr(form)));
      _ref = undefined;
    }
    return _ref;
  }(exports.typify = typify);

  function assertForm(form, min, max, first) {
    var _ref;
    (!(typeof min !== 'undefined' && min !== null)) ? (min = 0) : undefined;
    (!(typeof max !== 'undefined' && max !== null)) ? (max = Infinity) : undefined;
    if ((!isList(form))) {
      throw Error(("expecting list, got " + form));
      _ref = undefined;
    } else if ((!((form.length >= min) && (form.length <= max)))) {
      throw Error(("expecting between " + min + " and " + max + " arguments, got " + form.length));
      _ref = undefined;
    } else if (((typeof first !== 'undefined' && first !== null) && ((form[0] !== first)))) {
      throw Error(("expecting " + pr(first) + " as first element, got " + pr(form[0])));
      _ref = undefined;
    } else {
      _ref = form;
    }
    return _ref;
  }(exports.assertForm = assertForm);

  function assertExp(exp, test, expect) {
    var _ref;
    (!(typeof expect !== 'undefined' && expect !== null)) ? (expect = "valid expression") : undefined;
    if (test(exp)) {
      _ref = true;
    } else {
      throw Error(("expecting " + pr(expect) + ", got " + pr(exp)));
      _ref = undefined;
    }
    return _ref;
  }(exports.assertExp = assertExp);

  function pr(item) {
    var res, key, val, _ref, _res, _ref0, _i, _res0, _ref1;
    if (isAtom(item)) {
      _ref = ("" + item);
    } else if (isHash(item)) {
      (res = "");
      _res = [];
      _ref0 = item;
      for (key in _ref0) {
        val = _ref0[key];
        _res.push((res += (key + ": " + pr(val) + ", ")));
      }
      _res;
      _ref = ("({ " + res.slice(0, -2) + " })");
    } else if (isList(item)) {
      (res = "");
      _res0 = [];
      _ref1 = item;
      for (_i = 0; _i < _ref1.length; ++_i) {
        val = _ref1[_i];
        _res0.push((res += (pr(val) + ", ")));
      }
      _res0;
      _ref = ("[ " + res.slice(0, -2) + " ]");
    } else {
      _ref = ("" + item);
    }
    return _ref;
  }(exports.pr = pr);

  function spr(item) {
    var res, val, _i, _res, _ref, _ref0;
    if (isList(item)) {
      (res = "");
      _res = [];
      _ref = item;
      for (_i = 0; _i < _ref.length; ++_i) {
        val = _ref[_i];
        _res.push((res += (pr(val) + ", ")));
      }
      _res;
      _ref0 = res.slice(0, (res.length - 2));
    } else {
      throw Error("can only print-spread lists");
      _ref0 = undefined;
    }
    return _ref0;
  }(exports.spr = spr);

  function render(buffer) {
    var i, exp, _res, _ref, _ref0;
    _res = [];
    _ref = buffer;
    for (i = 0; i < _ref.length; ++i) {
      exp = _ref[i];
      if (((isList(exp) && ((exp.length === 0))) || (((typeof exp) === "undefined")) || ((exp === "")))) {
        _ref0 = (buffer[i] = undefined);
      } else {
        (buffer[i] = pr(exp));
        _ref0 = (!/:$|\}$|;$/.test(buffer[i].slice(-1))) ? (buffer[i] += ";") : undefined;
      }
      _res.push(_ref0);
    }
    _res;
    return buffer.join(" ");
  }(exports.render = render);

  function merge(options, overrides) {
    return extend(extend(({}), options), overrides);
  }(exports.merge = merge);

  function extend(object, properties) {
    var key, val, _res, _ref;
    _res = [];
    _ref = properties;
    for (key in _ref) {
      val = _ref[key];
      _res.push((object[key] = val));
    }
    _res;
    return object;
  }(exports.extend = extend);

  function baseFileName(file, stripExt, useWinPathSep) {
    var pathSep, parts, _ref;
    (!(typeof stripExt !== 'undefined' && stripExt !== null)) ? (stripExt = false) : undefined;
    (!(typeof useWinPathSep !== 'undefined' && useWinPathSep !== null)) ? (useWinPathSep = false) : undefined;
    (pathSep = useWinPathSep ? /\\|\// : /\//);
    (parts = file.split(pathSep));
    (file = parts.slice(-1)[0]);
    if ((!(stripExt && (file.indexOf(".") >= 0)))) {
      return _ref = file;
    } else {
      _ref = undefined;
    }
    _ref;
    (parts = file.split("."));
    parts.pop();
    (((parts.slice(-1)[0] === "jisp")) && (parts.length > 1)) ? parts.pop() : undefined;
    return parts.join(".");
  }(exports.baseFileName = baseFileName);

  function repeat(str, n) {
    var res, _res;
    (res = "");
    _res = [];
    while ((n > 0)) {
      (n & 1) ? (res += str) : undefined;
      (n >>>= 1);
      _res.push((str += str));
    }
    _res;
    return res;
  }(exports.repeat = repeat);

  function isJisp(file) {
    return /\.jisp$/.test(file);
  }
  return (exports.isJisp = isJisp);
}).call(this);
      return module.exports;
    })();require['./toplevel'] = (function() {
      var exports = {}, module = {exports: exports};
      (function() {
  function concat() {
    var res, lst, _i, _i0, _res, _ref;
    lists = 1 <= arguments.length ? [].slice.call(arguments, 0, _i = arguments.length - 0) : (_i = 0, []);
    (res = []);
    _res = [];
    _ref = lists;
    for (_i0 = 0; _i0 < _ref.length; ++_i0) {
      lst = _ref[_i0];
      _res.push((res = res.concat(lst)));
    }
    _res;
    return res;
  }(exports.concat = concat);

  function list() {
    var _i;
    args = 1 <= arguments.length ? [].slice.call(arguments, 0, _i = arguments.length - 0) : (_i = 0, []);
    return [].concat(args);
  }(exports.list = list);

  function range(start, end) {
    var a, _ref, _res, _ref0;
    if ((!(typeof end !== 'undefined' && end !== null))) {
      (end = start);
      _ref = (start = 0);
    } else {
      _ref = undefined;
    }
    _ref;
    _res = [];
    while (true) {
      if ((start <= end)) {
        (a = start);
        ++start;
        _ref0 = a;
      } else {
        break;
        _ref0 = undefined;
      }
      _res.push(_ref0);
    }
    return _res;
  }
  return (exports.range = range);
}).call(this);
      return module.exports;
    })();require['./util'] = (function() {
      var exports = {}, module = {exports: exports};
      (function() {
  var symbolWhitelist, keywords;
  (exports.symbolWhitelist = (symbolWhitelist = ["+", "-", "*", "/", "%", "++", "--", "?", "?!", "==", "===", "!=", "!==", "&&", "||", "!", ">", "<", ">=", "<=", "&", "|", "^", "<<", ">>", ">>>", "~", "=", "+=", "-=", "*=", "/=", "%=", "<<=", ">>=", ">>>=", "&=", "^=", "|="]));
  (exports.keywords = (keywords = ["return", "break", "continue"]));

  function kwtest(str) {
    return (/^return/.test(str) || /^break/.test(str) || /^continue/.test(str));
  }(exports.kwtest = kwtest);

  function isAtom(form) {
    return (((form === undefined) || (form === null)) || /^\/[^\s\/]+\/[\w]*$/.test(form) || (((typeof form) === "number") || ((typeof form) === "string") || ((typeof form) === "boolean")));
  }(exports.isAtom = isAtom);

  function isAtomString(form) {
    return (isNum(form) || isRegex(form) || isIdentifier(form) || isString(form) || ([].indexOf.call(symbolWhitelist, form) >= 0) || /^#[\d]+$/.test(form) || /^#$/.test(form));
  }(exports.isAtomString = isAtomString);

  function isList(form) {
    return Array.isArray(form);
  }(exports.isList = isList);

  function isHash(form) {
    return ((!isAtom(form)) && (!isList(form)) && (!(((typeof form) === "function"))));
  }(exports.isHash = isHash);

  function isBlankObject(form) {
    var _ref, _err;
    try {
      _ref = ((Object.keys(form).length === 0));
    } catch (_err) {
      _ref = false;
    }
    return _ref;
  }(exports.isBlankObject = isBlankObject);

  function isKey(form) {
    return (isAtom(form) && (isString(form) || isIdentifier(form) || isNum(form)));
  }(exports.isKey = isKey);

  function isVarName(form) {
    return (isAtom(form) && /^[$_A-Za-z]{1}$|^[$_A-Za-z]+[$_\w]*(?:[$_\w](?!\.))+$/.test(form));
  }(exports.isVarName = isVarName);

  function isIdentifier(form) {
    return (isAtom(form) && /^[$_A-Za-z]{1}[$_\w]*((\.[$_A-Za-z]{1}[$_\w]*)|(\[[$_.\w\[\]]+\])|(\['.*'\])|(\[".*"\]))*$/.test(form));
  }(exports.isIdentifier = isIdentifier);

  function isString(form) {
    return (isAtom(form) && /^".*"$|^'.*'$/.test(form));
  }(exports.isString = isString);

  function isRegex(form) {
    return (isAtom(form) && /^\/[^\s]+\/[\w]*[^\s)]*/.test(form));
  }(exports.isRegex = isRegex);

  function isNum(form) {
    return (isAtom(form) && (((typeof typify(form)) === "number")));
  }(exports.isNum = isNum);

  function isPrimitive(form) {
    return (isRegex(form) || isNum(form) || ((form === undefined) || (form === null) || (form === true) || (form === false)));
  }(exports.isPrimitive = isPrimitive);

  function isArgHash(form) {
    return (isAtom(form) && /^#[\d]+$/.test(form));
  }(exports.isArgHash = isArgHash);

  function isArgsHash(form) {
    return (isAtom(form) && /^#$/.test(form));
  }(exports.isArgsHash = isArgsHash);

  function isArgHashNotation(form) {
    return (isArgHash(form) || isArgsHash(form));
  }(exports.isArgHashNotation = isArgHashNotation);

  function isDotName(form) {
    return (isAtom(form) && /^\.[$_A-Za-z]{1}$|^\.[$_A-Za-z]+[$_.\w]*(?:[$_\w](?!\.))+$/.test(form));
  }(exports.isDotName = isDotName);

  function isBracketName(form) {
    return (isAtom(form) && /^\[[$_A-Za-z]{1}\]$|^\[[$_A-Za-z]+[$_.\w]*(?:[$_\w](?!\.))+\]$/.test(form));
  }(exports.isBracketName = isBracketName);

  function isBracketString(form) {
    return (isAtom(form) && /^\[".*"\]$|^\['.*'\]$/.test(form));
  }(exports.isBracketString = isBracketString);

  function isPropSyntax(form) {
    return (isAtom(form) && (isDotName(form) || isBracketName(form) || isBracketString(form)));
  }(exports.isPropSyntax = isPropSyntax);

  function typify(form) {
    var _ref;
    if ((!isAtom(form))) {
      throw Error(("expecting atom, got " + pr(form)));
      _ref = undefined;
    } else if (isBlankObject(form)) {
      _ref = form;
    } else if ((((typeof form) === "undefined"))) {
      _ref = undefined;
    } else if (((form === "null"))) {
      _ref = null;
    } else if (((form === "true") || (form === "yes"))) {
      _ref = true;
    } else if (((form === "false") || (form === "no"))) {
      _ref = false;
    } else if ((!isNaN(Number(form)))) {
      _ref = Number(form);
    } else if (isRegex(form)) {
      _ref = form;
    } else if ((((typeof form) === "string"))) {
      _ref = form;
    } else {
      throw Error(("syntax error: unrecognised type of " + pr(form)));
      _ref = undefined;
    }
    return _ref;
  }(exports.typify = typify);

  function assertForm(form, min, max, first) {
    var _ref;
    (!(typeof min !== 'undefined' && min !== null)) ? (min = 0) : undefined;
    (!(typeof max !== 'undefined' && max !== null)) ? (max = Infinity) : undefined;
    if ((!isList(form))) {
      throw Error(("expecting list, got " + form));
      _ref = undefined;
    } else if ((!((form.length >= min) && (form.length <= max)))) {
      throw Error(("expecting between " + min + " and " + max + " arguments, got " + form.length));
      _ref = undefined;
    } else if (((typeof first !== 'undefined' && first !== null) && ((form[0] !== first)))) {
      throw Error(("expecting " + pr(first) + " as first element, got " + pr(form[0])));
      _ref = undefined;
    } else {
      _ref = form;
    }
    return _ref;
  }(exports.assertForm = assertForm);

  function assertExp(exp, test, expect) {
    var _ref;
    (!(typeof expect !== 'undefined' && expect !== null)) ? (expect = "valid expression") : undefined;
    if (test(exp)) {
      _ref = true;
    } else {
      throw Error(("expecting " + pr(expect) + ", got " + pr(exp)));
      _ref = undefined;
    }
    return _ref;
  }(exports.assertExp = assertExp);

  function pr(item) {
    var res, key, val, _ref, _res, _ref0, _i, _res0, _ref1;
    if (isAtom(item)) {
      _ref = ("" + item);
    } else if (isHash(item)) {
      (res = "");
      _res = [];
      _ref0 = item;
      for (key in _ref0) {
        val = _ref0[key];
        _res.push((res += (key + ": " + pr(val) + ", ")));
      }
      _res;
      _ref = ("({ " + res.slice(0, -2) + " })");
    } else if (isList(item)) {
      (res = "");
      _res0 = [];
      _ref1 = item;
      for (_i = 0; _i < _ref1.length; ++_i) {
        val = _ref1[_i];
        _res0.push((res += (pr(val) + ", ")));
      }
      _res0;
      _ref = ("[ " + res.slice(0, -2) + " ]");
    } else {
      _ref = ("" + item);
    }
    return _ref;
  }(exports.pr = pr);

  function spr(item) {
    var res, val, _i, _res, _ref, _ref0;
    if (isList(item)) {
      (res = "");
      _res = [];
      _ref = item;
      for (_i = 0; _i < _ref.length; ++_i) {
        val = _ref[_i];
        _res.push((res += (pr(val) + ", ")));
      }
      _res;
      _ref0 = res.slice(0, (res.length - 2));
    } else {
      throw Error("can only print-spread lists");
      _ref0 = undefined;
    }
    return _ref0;
  }(exports.spr = spr);

  function render(buffer) {
    var i, exp, _res, _ref, _ref0;
    _res = [];
    _ref = buffer;
    for (i = 0; i < _ref.length; ++i) {
      exp = _ref[i];
      if (((isList(exp) && ((exp.length === 0))) || (((typeof exp) === "undefined")) || ((exp === "")))) {
        _ref0 = (buffer[i] = undefined);
      } else {
        (buffer[i] = pr(exp));
        _ref0 = (!/:$|\}$|;$/.test(buffer[i].slice(-1))) ? (buffer[i] += ";") : undefined;
      }
      _res.push(_ref0);
    }
    _res;
    return buffer.join(" ");
  }(exports.render = render);

  function merge(options, overrides) {
    return extend(extend(({}), options), overrides);
  }(exports.merge = merge);

  function extend(object, properties) {
    var key, val, _res, _ref;
    _res = [];
    _ref = properties;
    for (key in _ref) {
      val = _ref[key];
      _res.push((object[key] = val));
    }
    _res;
    return object;
  }(exports.extend = extend);

  function baseFileName(file, stripExt, useWinPathSep) {
    var pathSep, parts, _ref;
    (!(typeof stripExt !== 'undefined' && stripExt !== null)) ? (stripExt = false) : undefined;
    (!(typeof useWinPathSep !== 'undefined' && useWinPathSep !== null)) ? (useWinPathSep = false) : undefined;
    (pathSep = useWinPathSep ? /\\|\// : /\//);
    (parts = file.split(pathSep));
    (file = parts.slice(-1)[0]);
    if ((!(stripExt && (file.indexOf(".") >= 0)))) {
      return _ref = file;
    } else {
      _ref = undefined;
    }
    _ref;
    (parts = file.split("."));
    parts.pop();
    (((parts.slice(-1)[0] === "jisp")) && (parts.length > 1)) ? parts.pop() : undefined;
    return parts.join(".");
  }(exports.baseFileName = baseFileName);

  function repeat(str, n) {
    var res, _res;
    (res = "");
    _res = [];
    while ((n > 0)) {
      (n & 1) ? (res += str) : undefined;
      (n >>>= 1);
      _res.push((str += str));
    }
    _res;
    return res;
  }(exports.repeat = repeat);

  function isJisp(file) {
    return /\.jisp$/.test(file);
  }
  return (exports.isJisp = isJisp);
}).call(this);
      return module.exports;
    })();require['./operators'] = (function() {
      var exports = {}, module = {exports: exports};
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
    "of": makeop("in", undefined, 2, 2),
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
      return module.exports;
    })();require['./tokenise'] = (function() {
      var exports = {}, module = {exports: exports};
      (function() {
  var tokens, recode, recomment, redstring, resstring, rereg;
  (module.exports = tokenise);
  (tokens = []);
  (recode = /^[^]*?(?=;.*[\n\r]?|""|"[^]*?(?:[^\\]")|''|'[^]*?(?:[^\\]')|\/[^\s]+\/[\w]*)/);
  (recomment = /^;.*[\n\r]?/);
  (redstring = /^""|^"[^]*?(?:[^\\]")[^\s):]*/);
  (resstring = /^''|^'[^]*?(?:[^\\]')[^\s):]*/);
  (rereg = /^\/[^\s]+\/[\w]*[^\s)]*/);

  function grate(str) {
    return str.replace(/;.*$/gm, "").replace(/\{/g, "(fn (").replace(/\}/g, "))").replace(/\(/g, " ( ").replace(/\)/g, " ) ").replace(/\[[\s]*\(/g, " [ ( ").replace(/\)[\s]*\]/g, " ) ] ").replace(/:/g, " : ").replace(/`/g, " ` ").replace(/,/g, " , ").replace(/\.\.\./g, " ... ").replace(/…/g, " … ").trim().split(/\s+/);
  }
  grate;

  function concatNewLines(str) {
    return str.replace(/\n|\n\r/g, "\\n");
  }
  concatNewLines;

  function match(str, re) {
    var mask;
    return ((mask = str.match(re)) && (mask[0].length > 0)) ? mask[0] : null;
  }
  match;

  function tokenise(str) {
    var mask, _res, _ref;
    (tokens = []);
    _res = [];
    while (((str = str.trim()).length > 0)) {
      if ((mask = match(str, recode))) {
        tokens.push.apply(tokens, [].concat(grate(mask)));
        _ref = (str = str.replace(recode, ""));
      } else if ((mask = match(str, recomment))) {
        _ref = (str = str.replace(recomment, ""));
      } else if ((mask = match(str, redstring))) {
        tokens.push(concatNewLines(mask));
        _ref = (str = str.replace(redstring, ""));
      } else if ((mask = match(str, resstring))) {
        tokens.push(concatNewLines(mask));
        _ref = (str = str.replace(resstring, ""));
      } else if ((mask = match(str, rereg))) {
        tokens.push(mask);
        _ref = (str = str.replace(rereg, ""));
      } else {
        tokens.push.apply(tokens, [].concat(grate(str)));
        _ref = (str = "");
      }
      _res.push(_ref);
    }
    _res;
    return tokens.filter((function(x) {
      return ((typeof x !== 'undefined' && x !== null) && ((x !== "") && (x !== undefined) && (x !== null)));
    }));
  }
  return tokenise;
}).call(this);
      return module.exports;
    })();require['./lex'] = (function() {
      var exports = {}, module = {exports: exports};
      (function() {
  var util, pr, isList, isAtom, isAtomString, isNum, isRegex, isIdentifier, isString, isKey, isDotName, isBracketName, isBracketString, isPropSyntax;
  (util = require("./util"));
  (pr = util.pr);
  (isList = util.isList);
  (isAtom = util.isAtom);
  (isAtomString = util.isAtomString);
  (isNum = util.isNum);
  (isRegex = util.isRegex);
  (isIdentifier = util.isIdentifier);
  (isString = util.isString);
  (isKey = util.isKey);
  (isDotName = util.isDotName);
  (isBracketName = util.isBracketName);
  (isBracketString = util.isBracketString);
  (isPropSyntax = util.isPropSyntax);
  (module.exports = lex);

  function maketest(condition) {
    var _ref;
    if ((((typeof condition) === "function"))) {
      _ref = (function(tokens) {
        return condition(tokens[0]);
      });
    } else if (isRegex(condition)) {
      _ref = (function(tokens) {
        return condition.test(tokens[0]);
      });
    } else if (isAtom(condition)) {
      _ref = (function(tokens) {
        return ((tokens[0] === condition));
      });
    } else if (isList(condition)) {
      _ref = (function(tokens) {
        var i, cond, _res, _ref0, _ref1;
        _res = [];
        _ref0 = condition;
        for (i = 0; i < _ref0.length; ++i) {
          cond = _ref0[i];
          if ((!maketest(cond)(tokens.slice(i)))) {
            return _ref1 = false;
          } else {
            _ref1 = undefined;
          }
          _res.push(_ref1);
        }
        return _res ? true : undefined;
      });
    } else {
      throw Error(("can't test against " + pr(condition)));
      _ref = undefined;
    }
    return _ref;
  }
  maketest;

  function demand(tokens) {
    var conditions, modes, condition, mode, test, _i, _res, _ref;
    args = 2 <= arguments.length ? [].slice.call(arguments, 1, _i = arguments.length - 0) : (_i = 1, []);
    (conditions = []);
    (modes = []);
    _res = [];
    while ((args.length > 0)) {
      (condition = args.shift());
      (mode = args.shift());
      conditions.push(condition);
      modes.push(mode);
      (test = maketest(condition));
      if (test(tokens)) {
        return _ref = lex(tokens, mode);
      } else {
        _ref = undefined;
      }
      _res.push(_ref);
    }
    _res;
    throw Error(("unexpected " + pr(tokens[0]) + " in possible modes: " + modes.join(" | ") + "\nTested against: " + conditions.join("   ") + "\nTokens: " + pr(tokens.slice(0, 10)) + " ..."));
    return undefined;
  }
  demand;

  function expect(tokens) {
    var condition, mode, test, _i, _ref;
    args = 2 <= arguments.length ? [].slice.call(arguments, 1, _i = arguments.length - 0) : (_i = 1, []);
    while ((args.length > 0)) {
      (condition = args.shift());
      (mode = args.shift());
      (test = maketest(condition));
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
    args = 2 <= arguments.length ? [].slice.call(arguments, 1, _i = arguments.length - 0) : (_i = 1, []);
    _res = [];
    _ref = args;
    for (_i0 = 0; _i0 < _ref.length; ++_i0) {
      condition = _ref[_i0];
      if (maketest(condition)(tokens)) {
        throw Error(("unexpected " + pr(tokens[0])));
        _ref0 = undefined;
      } else {
        _ref0 = undefined;
      }
      _res.push(_ref0);
    }
    return _res;
  }
  forbid;

  function addProperties(tokens, lexed) {
    var _res;
    _res = [];
    while (((tokens[0] === "["))) {
      _res.push((lexed = ["get", lexed, lex(tokens, "property")]));
    }
    _res;
    return lexed;
  }
  addProperties;

  function lex(tokens, mode) {
    var lexed, prop, key, _ref, _res, _res0, _res1, _ref0;
    (!(typeof mode !== 'undefined' && mode !== null)) ? (mode = "default") : undefined;
    switch (mode) {
      case "default":
        _res = [];
        while ((tokens.length > 0)) {
          _res.push(demand(tokens, ["(", ":", ")"], "emptyhash", ["(", isKey, ":"], "hash", "(", "list", "`", "quote", ",", "unquote", "...", "spread", "…", "spread", isAtomString, "atom", undefined, "drop"));
        }
        _ref = _res;
        break;
      case "list":
        demand(tokens, "(", "drop");
        (lexed = []);
        (prop = expect(tokens, "[", "property", isPropSyntax, "property")) ? lexed.push(["get", prop]) : undefined;
        _res0 = [];
        while (((tokens[0] !== ")"))) {
          _res0.push(lexed.push(demand(tokens, ["(", ":", ")"], "emptyhash", ["(", isKey, ":"], "hash", "(", "list", "`", "quote", ",", "unquote", "...", "spread", "…", "spread", isAtomString, "atom")));
        }
        _res0;
        demand(tokens, ")", "drop");
        _ref = addProperties(tokens, lexed);
        break;
      case "emptyhash":
        demand(tokens, "(", "drop");
        demand(tokens, ":", "drop");
        demand(tokens, ")", "drop");
        _ref = addProperties(tokens, ({}));
        break;
      case "hash":
        (lexed = ({}));
        demand(tokens, "(", "drop");
        _res1 = [];
        while (((tokens[0] !== ")"))) {
          (key = demand(tokens, isKey, "key"));
          demand(tokens, ":", "drop");
          (prop = demand(tokens, ["(", ":", ")"], "emptyhash", ["(", isKey, ":"], "hash", "(", "list", "`", "quote", ",", "unquote", isAtomString, "atom"));
          _res1.push((lexed[key] = prop));
        }
        _res1;
        demand(tokens, ")", "drop");
        _ref = addProperties(tokens, lexed);
        break;
      case "property":
        if (isDotName(tokens[0])) {
          _ref0 = demand(tokens, isDotName, "drop").slice(1);
        } else if ((isBracketName(tokens[0]) || isBracketString(tokens[0]))) {
          _ref0 = demand(tokens, isBracketName, "drop", isBracketString, "drop");
        } else {
          demand(tokens, "[", "drop");
          (prop = demand(tokens, "(", "list", ",", "quote", isIdentifier, "atom", isNum, "atom", isString, "atom"));
          demand(tokens, "]", "drop");
          _ref0 = prop;
        }
        _ref = _ref0;
        break;
      case "quote":
        demand(tokens, "`", "drop");
        _ref = (lexed = ["quote", demand(tokens, ["(", ":", ")"], "emptyhash", ["(", isKey, ":"], "hash", "(", "list", "`", "quote", ",", "unquote", isAtomString, "atom")]);
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
        (key = demand(tokens, isKey, "drop"));
        forbid("[", isPropSyntax);
        _ref = key;
        break;
      case "atom":
        _ref = addProperties(tokens, demand(tokens, isAtomString, "drop"));
        break;
      case "drop":
        _ref = tokens.shift();
        break;
      default:
        throw Error(("unspecified lex mode: " + mode));
        _ref = undefined;
    }
    return _ref;
  }
  return lex;
}).call(this);
      return module.exports;
    })();require['./parse'] = (function() {
      var exports = {}, module = {exports: exports};
      (function() {
  var util;
  (util = require("./util"));

  function parse(form) {
    var i, val, key, _res, _ref, _ref0, _res0, _ref1;
    if (util.isList(form)) {
      _res = [];
      _ref = form;
      for (i = 0; i < _ref.length; ++i) {
        val = _ref[i];
        _res.push((form[i] = parse(val)));
      }
      _res;
      _ref0 = form;
    } else if (util.isHash(form)) {
      _res0 = [];
      _ref1 = form;
      for (key in _ref1) {
        val = _ref1[key];
        _res0.push((form[key] = parse(val)));
      }
      _res0;
      _ref0 = form;
    } else {
      (form = util.typify(form));
      _ref0 = /^#[\d]+$/.test(form) ? ("arguments[" + form.slice(1) + "]") : form;
    }
    return _ref0;
  }
  return (module.exports = parse);
}).call(this);
      return module.exports;
    })();require['./macros'] = (function() {
      var exports = {}, module = {exports: exports};
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
  var macInit = function(x) {
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
      ["get", x, "slice"], 0, -1
    ];
  };
  var macLast = function(x) {
    var _i, _ref;
    other = 2 <= arguments.length ? [].slice.call(arguments, 1, _i = arguments.length - 0) : (_i = 1, []);
    if (((!(typeof x !== 'undefined' && x !== null)) || (other.length > 0))) {
      throw Error("expecting one argument");
      _ref = undefined;
    } else {
      _ref = undefined;
    }
    _ref;
    return ["get", [
      ["get", x, "slice"], -1
    ], 0];
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
  (exports.init = macInit);
  (exports.last = macLast);
  (exports.let = macLet);
  (exports["?!"] = macNotExist);
  return (exports.isa = macIsA);
}).call(this);
      return module.exports;
    })();require['./jisp'] = (function() {
      var exports = {}, module = {exports: exports};
      (function() {
  function list() {
    var _i;
    args = 1 <= arguments.length ? [].slice.call(arguments, 0, _i = arguments.length - 0) : (_i = 0, []);
    return [].concat(args);
  }

  function range(start, end) {
    var a, _ref, _res, _ref0;
    if ((!(typeof end !== 'undefined' && end !== null))) {
      (end = start);
      _ref = (start = 0);
    } else {
      _ref = undefined;
    }
    _ref;
    _res = [];
    while (true) {
      if ((start <= end)) {
        (a = start);
        ++start;
        _ref0 = a;
      } else {
        break;
        _ref0 = undefined;
      }
      _res.push(_ref0);
    }
    return _res;
  }
  var vm, fs, path, beautify, toplevel, util, ops, operators, opFuncs, tokenise, lex, parse, pr, spr, render, isAtom, isHash, isList, isVarName, isIdentifier, assertExp, specials, macros;
  (exports.version = "0.1.1");
  (vm = require("vm"));
  (fs = require("fs"));
  (path = require("path"));
  (beautify = require("js-beautify"));
  (toplevel = require("./toplevel"));
  (util = require("./util"));
  (ops = require("./operators"));
  (operators = ops.operators);
  (opFuncs = ops.opFuncs);
  (tokenise = require("./tokenise"));
  (lex = require("./lex"));
  (parse = require("./parse"));
  (pr = util.pr);
  (spr = util.spr);
  (render = util.render);
  (isAtom = util.isAtom);
  (isHash = util.isHash);
  (isList = util.isList);
  (isVarName = util.isVarName);
  (isIdentifier = util.isIdentifier);
  (assertExp = util.assertExp);

  function plusname(name) {
    return isNaN(Number(name.slice(-1)[0])) ? (name + 0) : (name.slice(0, -1) + (1 + Number(name.slice(-1)[0])));
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
    var _res;
    _res = [];
    while ((([].indexOf.call(scope.hoist, name) >= 0) || ([].indexOf.call(scope.service, name) >= 0))) {
      _res.push((name = plusname(name)));
    }
    _res;
    scope.service.push(name);
    return [name, scope];
  }
  declareService;

  function hasSpread(form) {
    return (isList(form) && ((form[0] === "spread")));
  }
  hasSpread;

  function compileResolve(form, buffer, scope, opts) {
    var compiled, i, name, newname, re, subst, str, _ref, _i, _res, _ref0, _res0, _res1, _ref1, _ref2;
    (_ref = compileForm(form, scope, opts));
    compiled = _ref[0];
    scope = _ref[1];
    _res = [];
    _ref0 = scope.service;
    for (i in _ref0) {
      name = _ref0[i];
      if (([].indexOf.call(scope.hoist, name) >= 0)) {
        (newname = name);
        _res0 = [];
        while (([].indexOf.call(scope.hoist, newname) >= 0)) {
          _res0.push((newname = plusname(newname)));
        }
        _res0;
        (scope.service[i] = newname);
        (re = RegExp(("(?=(?:[^$_A-Za-z0-9]{1}|^)" + name + "(?:[^$_A-Za-z0-9]{1}|$))([^$A-Za-z0-9]|^)" + name), "g"));
        (subst = ("$1" + newname));
        _res1 = [];
        _ref1 = buffer;
        for (i = 0; i < _ref1.length; ++i) {
          str = _ref1[i];
          _res1.push(((typeof str !== 'undefined' && str !== null) && (((typeof str) === "string"))) ? (buffer[i] = str.replace(re, subst)) : undefined);
        }
        _ref2 = _res1;
      } else {
        _ref2 = undefined;
      }
      _res.push(_ref2);
    }
    _res;
    return [compiled, buffer, scope];
  }
  compileResolve;

  function compileAdd(form, buffer, scope, opts) {
    var compiled, _ref, _i;
    (_ref = compileResolve(form, buffer, scope, opts));
    compiled = _ref[0];
    buffer = _ref[1];
    scope = _ref[2];
    buffer.push.apply(buffer, [].concat(compiled));
    return [buffer, scope];
  }
  compileAdd;

  function compileGetLast(form, buffer, scope, opts) {
    var lastItem, _ref, _i;
    (_ref = compileAdd(form, buffer, scope, opts));
    buffer = _ref[0];
    scope = _ref[1];
    (lastItem = buffer.pop());
    return [lastItem, buffer, scope];
  }
  compileGetLast;

  function splitName(name) {
    var obj, method, _ref;
    if ((obj = name.match(/^[$_A-Za-z]{1}$|^[$_A-Za-z]+[$_\w]*([$_\w](?!\.))+$|^([$_.\[\]\w])+(?=\.|(\[.*(?=\[+).*\]))+|^(?:[$_.\[\]\w])+(?=\.|\[)+/))) {
      (obj = obj[0]);
      (method = name.replace(obj, ""));
      _ref = [obj, method];
    } else {
      _ref = [name, ""];
    }
    return _ref;
  }
  splitName;

  function returnify(form) {
    var _ref;
    if ((isAtom(form) || isHash(form))) {
      _ref = ["return", form];
    } else if ((isList(form) && ((form[0] !== "return")))) {
      _ref = ["return", form];
    } else {
      _ref = form;
    }
    return _ref;
  }
  returnify;

  function getArgNames(args) {
    var arr, arg, _i, _res, _ref, _ref0;
    (arr = []);
    _res = [];
    _ref = args;
    for (_i = 0; _i < _ref.length; ++_i) {
      arg = _ref[_i];
      if ((isAtom(arg) && isVarName(arg))) {
        _ref0 = arr.push(arg);
      } else if ((isList(arg) && isVarName(arg[0]) && (!((arg[0] === "spread"))))) {
        _ref0 = arr.push(arg[0]);
      } else {
        _ref0 = undefined;
      }
      _res.push(_ref0);
    }
    _res;
    return arr;
  }
  getArgNames;

  function compileForm(form, scope, opts) {
    var buffer, first, i, arg, argsSpread, name, method, collector, key, val, _ref, _ref0, _i, _ref1, _i0, _ref2, _res, _ref3, _ref4, _i1, _ref5, _i2, _ref6, _ref7, _i3, _ref8, _ref9, _ref10, _i4, _ref11, _i5, _ref12, _ref13, _ref14, _ref15, _i6, _ref16, _ref17, _res0, _ref18, _ref19, _i7;
    (!(typeof opts !== 'undefined' && opts !== null)) ? (opts = ({})) : undefined;
    if ((isList(form) && util.isBlankObject(form))) {
      _ref16 = [
        [""], scope
      ];
    } else if (isAtom(form)) {
      if ((([].indexOf.call(Object.keys(toplevel), form) >= 0) || ([].indexOf.call(Object.keys(macros), form) >= 0))) {
        assertExp(form, isVarName, "valid identifier");
        _ref17 = (scope = declareVar(form, scope));
      } else if (([].indexOf.call(Object.keys(opFuncs), form) >= 0)) {
        assertExp(form, isVarName, "valid identifier");
        (scope = declareVar(form, scope));
        _ref17 = (form = opFuncs[form].name);
      } else {
        _ref17 = undefined;
      }
      _ref17;
      _ref16 = [
        [form], scope
      ];
    } else if (isHash(form)) {
      (buffer = []);
      _res0 = [];
      _ref18 = form;
      for (key in _ref18) {
        val = _ref18[key];
        (_ref19 = compileGetLast(val, buffer, scope, opts));
        form[key] = _ref19[0];
        buffer = _ref19[1];
        _res0.push(scope = _ref19[2]);
      }
      _res0;
      buffer.push(form);
      _ref16 = [buffer, scope];
    } else {
      if ((!isList(form))) {
        throw Error(("expecting list, got: " + pr(form)));
        _ref = undefined;
      } else {
        _ref = undefined;
      }
      _ref;
      (buffer = []);
      (form = form.slice());
      if (([].indexOf.call(Object.keys(specials), form[0]) >= 0)) {
        (_ref0 = specials[form[0]](form, scope, opts));
        buffer = _ref0[0];
        _ref14 = scope = _ref0[1];
      } else if (([].indexOf.call(Object.keys(macros), form[0]) >= 0)) {
        (_ref15 = compileAdd(expandMacros(form), buffer, scope, opts));
        buffer = _ref15[0];
        _ref14 = scope = _ref15[1];
      } else {
        (_ref1 = compileGetLast(form.shift(), buffer, scope, opts));
        first = _ref1[0];
        buffer = _ref1[1];
        scope = _ref1[2];
        if (([].indexOf.call(Object.keys(toplevel), first) >= 0)) {
          assertExp(first, isVarName, "valid identifier");
          _ref2 = (scope = declareVar(first, scope));
        } else {
          _ref2 = undefined;
        }
        _ref2;
        _res = [];
        _ref3 = form;
        for (i = 0; i < _ref3.length; ++i) {
          arg = _ref3[i];
          if (hasSpread(arg)) {
            (argsSpread = true);
            (_ref4 = compileGetLast(arg, buffer, scope, opts));
            arg = _ref4[0];
            buffer = _ref4[1];
            scope = _ref4[2];
            _ref6 = (form[i] = ["spread", arg]);
          } else {
            (_ref5 = compileGetLast(arg, buffer, scope, opts));
            arg = _ref5[0];
            buffer = _ref5[1];
            scope = _ref5[2];
            _ref6 = (form[i] = arg);
          }
          _res.push(_ref6);
        }
        _res;
        if ((!(typeof argsSpread !== 'undefined' && argsSpread !== null))) {
          _ref13 = ([].indexOf.call(Object.keys(operators), first) >= 0) ? buffer.push.apply(buffer, [].concat(operators[first](form))) : buffer.push((pr(first) + "(" + spr(form) + ")"));
        } else {
          (form = ["quote", form]);
          (_ref7 = compileGetLast(form, buffer, scope, opts));
          form = _ref7[0];
          buffer = _ref7[1];
          scope = _ref7[2];
          if (([].indexOf.call(Object.keys(operators), first) >= 0)) {
            if ((([].indexOf.call(Object.keys(opFuncs), first) >= 0) && spr(opFuncs[first]))) {
              assertExp(first, isVarName, "valid identifier");
              (scope = declareVar(first, scope));
              _ref8 = (first = opFuncs[first].name);
            } else {
              throw Error((pr(first) + " can't spread arguments (yet)"));
              _ref8 = undefined;
            }
            _ref9 = _ref8;
          } else {
            _ref9 = undefined;
          }
          _ref9;
          (_ref10 = splitName(first));
          name = _ref10[0];
          method = _ref10[1];
          if (isIdentifier(name)) {
            _ref12 = buffer.push((name + method + ".apply(" + name + ", " + pr(form) + ")"));
          } else {
            (_ref11 = declareService("_ref", scope));
            collector = _ref11[0];
            scope = _ref11[1];
            _ref12 = buffer.push(("(" + collector + " = " + name + ")" + method + ".apply(" + collector + ", " + pr(form) + ")"));
          }
          _ref13 = _ref12;
        }
        _ref14 = _ref13;
      }
      _ref14;
      _ref16 = [buffer, scope];
    }
    return _ref16;
  }
  compileForm;
  (specials = ({}));
  (specials.do = (function(form, scope, opts) {
    var buffer, formName, isTopLevel, outerScope, exp, ref, vars, funcs, dec, args, name, func, _ref, _ref0, _i, _res, _ref1, _ref2, _i0, _ref3, _i1, _ref4, _ref5, _i2, _res0, _ref6, _i3, _res1, _ref7, _res2, _ref8, _ref9, _res3, _ref10, _ref11, _i4, _res4, _ref12, _ref13, _ref14;
    (!(typeof opts !== 'undefined' && opts !== null)) ? (opts = ({})) : undefined;
    (buffer = []);
    (form = form.slice());
    (formName = form.shift());
    if (opts.toplevel) {
      (isTopLevel = true);
      _ref = (delete opts.toplevel);
    } else {
      _ref = undefined;
    }
    _ref;
    if (isTopLevel) {
      (outerScope = scope);
      _ref0 = (scope = ({
        hoist: outerScope.hoist.slice(),
        service: outerScope.service.slice()
      }));
    } else {
      _ref0 = undefined;
    }
    _ref0;
    _res = [];
    _ref1 = form;
    for (_i = 0; _i < _ref1.length; ++_i) {
      exp = _ref1[_i];
      if ((!(typeof exp !== 'undefined' && exp !== null))) {
        _ref5 = buffer.push(exp);
      } else {
        if (((isList(exp[0]) && ((exp[0].length === 2)) && ((exp[0][0] === "get"))) || util.isPropSyntax(exp[0]))) {
          (ref = buffer.pop());
          (!(typeof ref !== 'undefined' && ref !== null)) ? (ref = "") : undefined;
          (_ref2 = compileAdd(exp, buffer, scope, opts));
          buffer = _ref2[0];
          scope = _ref2[1];
          _ref4 = buffer.push((ref + buffer.pop()));
        } else {
          (_ref3 = compileAdd(exp, buffer, scope, opts));
          buffer = _ref3[0];
          _ref4 = scope = _ref3[1];
        }
        _ref5 = _ref4;
      }
      _res.push(_ref5);
    }
    _res;
    if (isTopLevel) {
      (vars = []);
      (funcs = []);
      (dec = "var ");
      (!(typeof args !== 'undefined' && args !== null)) ? (args = []) : undefined;
      _res0 = [];
      _ref6 = scope.hoist;
      for (_i2 = 0; _i2 < _ref6.length; ++_i2) {
        name = _ref6[_i2];
        _res0.push(((!([].indexOf.call(outerScope.hoist, name) >= 0)) && (!([].indexOf.call(args, name) >= 0))) ? (([].indexOf.call(Object.keys(toplevel), name) >= 0) || ([].indexOf.call(Object.keys(opFuncs), name) >= 0) || ([].indexOf.call(Object.keys(macros), name) >= 0)) ? funcs.push(name) : vars.push(name) : undefined);
      }
      _res0;
      _res1 = [];
      _ref7 = scope.service;
      for (_i3 = 0; _i3 < _ref7.length; ++_i3) {
        name = _ref7[_i3];
        _res1.push((!([].indexOf.call(outerScope.service, name) >= 0)) ? vars.push(name) : undefined);
      }
      _res1;
      _res2 = [];
      while ((vars.length > 0)) {
        (name = vars.shift());
        if (([].indexOf.call(vars, name) >= 0)) {
          throw Error(("compiler error: duplicate var in declarations:" + name));
          _ref8 = undefined;
        } else {
          _ref8 = undefined;
        }
        _ref8;
        _res2.push((dec += (name + ", ")));
      }
      _res2;
      if ((dec.length > 4)) {
        (dec = dec.slice(0, (dec.length - 2)));
        _ref9 = buffer.unshift(dec);
      } else {
        _ref9 = undefined;
      }
      _ref9;
      if (((typeof isTopLevel !== 'undefined' && isTopLevel !== null) && isTopLevel)) {
        _res3 = [];
        while ((funcs.length > 0)) {
          (func = funcs.pop());
          if (([].indexOf.call(funcs, func) >= 0)) {
            throw Error(("compiler error: duplicate func in declarations:" + func));
            _ref10 = undefined;
          } else {
            _ref10 = undefined;
          }
          _ref10;
          if (([].indexOf.call(Object.keys(toplevel), func) >= 0)) {
            _ref11 = buffer.unshift(toplevel[func].toString());
          } else if (([].indexOf.call(Object.keys(macros), func) >= 0)) {
            _ref11 = buffer.unshift(("var " + func + " = " + macros[func] + ";"));
          } else if (([].indexOf.call(Object.keys(opFuncs), func) >= 0)) {
            _ref11 = buffer.unshift(("var " + opFuncs[func].name + " = " + opFuncs[func].func + ";"));
          } else {
            throw Error(("unrecognised func: " + pr(func)));
            _ref11 = undefined;
          }
          _res3.push(_ref11);
        }
        _ref13 = _res3;
      } else {
        _res4 = [];
        _ref12 = funcs;
        for (_i4 = 0; _i4 < _ref12.length; ++_i4) {
          func = _ref12[_i4];
          _res4.push((!([].indexOf.call(outerScope.hoist, func) >= 0)) ? outerScope.hoist.push(func) : undefined);
        }
        _ref13 = _res4;
      }
      _ref13;
      _ref14 = (scope = outerScope);
    } else {
      _ref14 = undefined;
    }
    _ref14;
    return Array(buffer, scope);
  }));
  (specials.quote = (function(form, scope, opts) {
    var buffer, formName, arr, res, exp, i, item, key, newform, _ref, _ref0, _i, _res, _ref1, _ref2, _i0, _ref3, _i1, _ref4, _ref5, _ref6, _i2, _ref7, _ref8, _ref9, _i3, _ref10, _i4, _res0, _ref11, _ref12, _i5, _ref13, _ref14, _ref15, _ref16, _i6, _ref17, _ref18, _ref19, _res1, _ref110, _ref111, _i7, _res2, _ref112, _ref113, _i8, _ref114;
    (!(typeof opts !== 'undefined' && opts !== null)) ? (opts = ({})) : undefined;
    (buffer = []);
    (form = form.slice());
    (formName = form.shift());
    if ((form.length < 1)) {
      throw Error((pr(formName) + " expects no less than " + pr(1) + " arguments"));
      _ref = undefined;
    } else {
      _ref = undefined;
    }
    _ref;
    if ((form.length > 1)) {
      throw Error((pr(formName) + " expects no more than " + pr(1) + " arguments"));
      _ref0 = undefined;
    } else {
      _ref0 = undefined;
    }
    _ref0;
    (form = form[0]);
    if ((isAtom(form) && (!util.isPrimitive(form)))) {
      _ref19 = buffer.push(JSON.stringify(form));
    } else if (isAtom(form)) {
      _ref19 = buffer.push(form);
    } else if (isHash(form)) {
      if ((!opts.macro)) {
        _res1 = [];
        _ref110 = form;
        for (key in _ref110) {
          exp = _ref110[key];
          (_ref111 = compileGetLast(exp, buffer, scope, opts));
          form[key] = _ref111[0];
          buffer = _ref111[1];
          _res1.push(scope = _ref111[2]);
        }
        _res1;
        _ref114 = buffer.push(form);
      } else {
        (newform = ({}));
        _res2 = [];
        _ref112 = form;
        for (key in _ref112) {
          exp = _ref112[key];
          (key = JSON.stringify(key));
          (_ref113 = compileGetLast(["quote", exp], buffer, scope, opts));
          newform[key] = _ref113[0];
          buffer = _ref113[1];
          _res2.push(scope = _ref113[2]);
        }
        _res2;
        _ref114 = buffer.push(newform);
      }
      _ref19 = _ref114;
    } else {
      (arr = []);
      (res = "[]");
      _res = [];
      _ref1 = form;
      for (_i = 0; _i < _ref1.length; ++_i) {
        exp = _ref1[_i];
        if ((isList(exp) && ((exp[0] === "quote")) && isList(exp[1]) && ((exp[1].length === 0)))) {
          _ref5 = arr.push([]);
        } else if ((isList(exp) && ((exp[0] === "unquote")) && isList(exp[1]) && ((exp[1][0] === "spread")))) {
          (_ref6 = compileGetLast(exp.slice(1)[0], buffer, scope, opts));
          exp = _ref6[0];
          buffer = _ref6[1];
          scope = _ref6[2];
          if ((typeof exp !== 'undefined' && exp !== null)) {
            if ((arr.length > 0)) {
              (res += (".concat(" + pr(arr) + ")"));
              _ref7 = (arr = []);
            } else {
              _ref7 = undefined;
            }
            _ref7;
            _ref8 = (res += (".concat(" + pr(exp) + ")"));
          } else {
            _ref8 = undefined;
          }
          _ref5 = _ref8;
        } else if ((isList(exp) && ((exp[0] === "quote")))) {
          (_ref9 = compileGetLast(exp, buffer, scope, opts));
          exp = _ref9[0];
          buffer = _ref9[1];
          scope = _ref9[2];
          _ref5 = (typeof exp !== 'undefined' && exp !== null) ? arr.push(exp) : undefined;
        } else if ((isList(exp) && ((exp[0] === "unquote")))) {
          (_ref10 = compileGetLast(exp, buffer, scope, opts));
          exp = _ref10[0];
          buffer = _ref10[1];
          scope = _ref10[2];
          if (((typeof exp !== 'undefined' && exp !== null) && opts.macro)) {
            if (isList(exp)) {
              _res0 = [];
              _ref11 = exp;
              for (i = 0; i < _ref11.length; ++i) {
                item = _ref11[i];
                if (isAtom(item)) {
                  (_ref12 = compileGetLast(["quote", item], buffer, scope, opts));
                  exp[i] = _ref12[0];
                  buffer = _ref12[1];
                  _ref13 = scope = _ref12[2];
                } else {
                  _ref13 = undefined;
                }
                _res0.push(_ref13);
              }
              _ref14 = _res0;
            } else {
              _ref14 = undefined;
            }
            _ref15 = _ref14;
          } else {
            _ref15 = undefined;
          }
          _ref15;
          _ref5 = (typeof exp !== 'undefined' && exp !== null) ? arr.push(exp) : undefined;
        } else if ((isList(exp) && ((exp[0] === "spread")) && (!opts.macro))) {
          (_ref16 = compileGetLast(exp, buffer, scope, opts));
          exp = _ref16[0];
          buffer = _ref16[1];
          scope = _ref16[2];
          if ((typeof exp !== 'undefined' && exp !== null)) {
            if ((arr.length > 0)) {
              (res += (".concat(" + pr(arr) + ")"));
              _ref17 = (arr = []);
            } else {
              _ref17 = undefined;
            }
            _ref17;
            _ref18 = (res += (".concat(" + pr(exp) + ")"));
          } else {
            _ref18 = undefined;
          }
          _ref5 = _ref18;
        } else {
          if ((isAtom(exp) && (!opts.macro))) {
            (_ref2 = compileGetLast(exp, buffer, scope, opts));
            exp = _ref2[0];
            buffer = _ref2[1];
            _ref4 = scope = _ref2[2];
          } else {
            (_ref3 = compileGetLast(["quote", exp], buffer, scope, opts));
            exp = _ref3[0];
            buffer = _ref3[1];
            _ref4 = scope = _ref3[2];
          }
          _ref4;
          _ref5 = (typeof exp !== 'undefined' && exp !== null) ? arr.push(exp) : undefined;
        }
        _res.push(_ref5);
      }
      _res;
      (arr.length > 0) ? ((res === "[]")) ? (res = pr(arr)) : (res += (".concat(" + pr(arr) + ")")) : undefined;
      _ref19 = buffer.push(res);
    }
    _ref19;
    return Array(buffer, scope);
  }));
  (specials.unquote = (function(form, scope, opts) {
    var buffer, formName, _ref, _ref0, _ref1, _i, _ref2, _ref3, _i0;
    (!(typeof opts !== 'undefined' && opts !== null)) ? (opts = ({})) : undefined;
    (buffer = []);
    (form = form.slice());
    (formName = form.shift());
    if ((form.length < 1)) {
      throw Error((pr(formName) + " expects no less than " + pr(1) + " arguments"));
      _ref = undefined;
    } else {
      _ref = undefined;
    }
    _ref;
    if ((form.length > 1)) {
      throw Error((pr(formName) + " expects no more than " + pr(1) + " arguments"));
      _ref0 = undefined;
    } else {
      _ref0 = undefined;
    }
    _ref0;
    (form = form[0]);
    if ((isList(form) && ((form[0] === "quote")))) {
      (_ref1 = compileGetLast(form, buffer, scope, opts));
      form = _ref1[0];
      buffer = _ref1[1];
      _ref2 = scope = _ref1[2];
    } else {
      _ref2 = undefined;
    }
    _ref2;
    (_ref3 = compileAdd(form, buffer, scope, opts));
    buffer = _ref3[0];
    scope = _ref3[1];
    return Array(buffer, scope);
  }));
  (specials["="] = (function(form, scope, opts) {
    var buffer, formName, left, right, ref, ind, spreads, i, name, spreadname, spreadind, _ref, _ref0, _i, _res, _ref1, _i0, _ref2, _i1, _ref3, _ref4, _ref5, _i2, _ref6, _i3, _res0, _ref7, _ref8, _ref9, _i4, _ref10, _ref11, _ref12, _ref13;
    (!(typeof opts !== 'undefined' && opts !== null)) ? (opts = ({})) : undefined;
    (buffer = []);
    (form = form.slice());
    (formName = form.shift());
    if ((form.length < 1)) {
      throw Error((pr(formName) + " expects no less than " + pr(1) + " arguments"));
      _ref = undefined;
    } else {
      _ref = undefined;
    }
    _ref;
    if (((form.length === 1))) {
      assertExp(form[0], isVarName, "valid identifier");
      (scope = declareVar(form[0], scope));
      (_ref0 = compileAdd(form[0], buffer, scope, opts));
      buffer = _ref0[0];
      _ref13 = scope = _ref0[1];
    } else {
      assertExp(form, (function() {
        return (((arguments[0].length % 2) === 0));
      }), "an even number of arguments");
      _res = [];
      while ((form.length > 0)) {
        (left = form.shift());
        (right = form.shift());
        (_ref1 = compileGetLast(right, buffer, scope, opts));
        right = _ref1[0];
        buffer = _ref1[1];
        scope = _ref1[2];
        if ((isList(left) && ((left[0] === "get")))) {
          (_ref2 = compileGetLast(left, buffer, scope, opts));
          left = _ref2[0];
          buffer = _ref2[1];
          scope = _ref2[2];
          _ref4 = buffer.push(("(" + pr(left) + " = " + pr(right) + ")"));
        } else if (isList(left)) {
          (_ref5 = declareService("_ref", scope, opts.function ? args : undefined));
          ref = _ref5[0];
          scope = _ref5[1];
          (_ref6 = declareService("_i", scope, opts.function ? args : undefined));
          ind = _ref6[0];
          scope = _ref6[1];
          buffer.push(("(" + ref + " = " + pr(right) + ")"));
          (spreads = 0);
          _res0 = [];
          _ref7 = left;
          for (i = 0; i < _ref7.length; ++i) {
            name = _ref7[i];
            if (((name[0] === "spread"))) {
              if ((++spreads > 1)) {
                throw Error("an assignment can only have one spread");
                _ref8 = undefined;
              } else {
                _ref8 = undefined;
              }
              _ref8;
              (_ref9 = compileGetLast(name, buffer, scope, opts));
              name = _ref9[0];
              buffer = _ref9[1];
              scope = _ref9[2];
              assertExp(name, isVarName, "valid identifier");
              (scope = declareVar(name, scope));
              (spreadname = name);
              (spreadind = i);
              _ref11 = buffer.push(("var " + spreadname + " = " + left.length + " <= " + ref + ".length ? [].slice.call(" + ref + ", " + spreadind + ", " + ind + " = " + ref + ".length - " + (left.length - spreadind - 1) + ") : (" + ind + " = " + spreadind + ", [])"));
            } else if ((!(typeof spreadname !== 'undefined' && spreadname !== null))) {
              if (isVarName(name)) {
                assertExp(name, isVarName, "valid identifier");
                _ref12 = (scope = declareVar(name, scope));
              } else {
                _ref12 = undefined;
              }
              _ref12;
              _ref11 = buffer.push((pr(name) + " = " + ref + "[" + i + "]"));
            } else {
              if (isVarName(name)) {
                assertExp(name, isVarName, "valid identifier");
                _ref10 = (scope = declareVar(name, scope));
              } else {
                _ref10 = undefined;
              }
              _ref10;
              _ref11 = buffer.push((pr(name) + " = " + ref + "[" + ind + "++]"));
            }
            _res0.push(_ref11);
          }
          _ref4 = _res0;
        } else {
          if (isVarName(left)) {
            assertExp(left, isVarName, "valid identifier");
            _ref3 = (scope = declareVar(left, scope));
          } else {
            _ref3 = undefined;
          }
          _ref3;
          assertExp(left, isIdentifier);
          _ref4 = buffer.push(("(" + pr(left) + " = " + pr(right) + ")"));
        }
        _res.push(_ref4);
      }
      _ref13 = _res;
    }
    _ref13;
    return Array(buffer, scope);
  }));
  (specials.fn = (function(form, scope, opts) {
    var buffer, formName, outerScope, args, body, optionals, spreads, i, arg, ind, name, restname, restind, rest, vars, funcs, dec, func, _ref, _i, _res, _ref0, _ref1, _ref2, _i0, _ref3, _i1, _ref4, _ref5, _ref6, _i2, _i3, _res0, _ref7, _i4, _res1, _ref8, _res2, _ref9, _ref10, _res3, _ref11, _ref12, _i5, _res4, _ref13, _ref14;
    (!(typeof opts !== 'undefined' && opts !== null)) ? (opts = ({})) : undefined;
    (buffer = []);
    (form = form.slice());
    (formName = form.shift());
    (outerScope = scope);
    (scope = ({
      hoist: outerScope.hoist.slice(),
      service: outerScope.service.slice()
    }));
    (_ref = form);
    var args = 2 <= _ref.length ? [].slice.call(_ref, 0, _i = _ref.length - 1) : (_i = 0, []);
    body = _ref[_i++];
    scope.hoist.push.apply(scope.hoist, [].concat(getArgNames(args)));
    (!(typeof body !== 'undefined' && body !== null)) ? (body = []) : undefined;
    (optionals = []);
    (spreads = 0);
    _res = [];
    _ref0 = args;
    for (i = 0; i < _ref0.length; ++i) {
      arg = _ref0[i];
      if (isList(arg)) {
        assertExp(arg, (function() {
          return ((arguments[0].length === 2));
        }), "optional or rest parameter");
        if (((arg[0] === "spread"))) {
          if ((++spreads > 1)) {
            throw Error("cannot define more than one rest parameter");
            _ref1 = undefined;
          } else {
            _ref1 = undefined;
          }
          _ref1;
          (_ref2 = declareService("_i", scope, opts.function ? args : undefined));
          ind = _ref2[0];
          scope = _ref2[1];
          (_ref3 = compileGetLast(arg, buffer, scope, opts));
          name = _ref3[0];
          buffer = _ref3[1];
          scope = _ref3[2];
          assertExp(name, isVarName, "valid identifier");
          (restname = name);
          (restind = i);
          (args[i] = restname);
          _ref4 = (rest = list((name + " = " + args.length + " <= arguments.length ? [].slice.call(arguments, " + i + ", " + ind + " = arguments.length - " + (args.length - i - 1) + ") : (" + ind + " = " + restind + ", [])")));
        } else {
          assertExp((name = arg[0]), isVarName, "valid parameter name");
          (args[i] = name);
          _ref4 = optionals.push(["if", ["not", ["?", name]],
            ["=", name, arg[1]]
          ]);
        }
        _ref5 = _ref4;
      } else if (restname) {
        _ref5 = rest.push((pr(arg) + " = arguments[" + ind + "++]"));
      } else {
        _ref5 = undefined;
      }
      _res.push(_ref5);
    }
    _res;
    (typeof restind !== 'undefined' && restind !== null) ? (args = args.slice(0, restind)) : undefined;
    (optionals.length > 0) ? (body = [].concat(["do"]).concat(optionals).concat([body])) : undefined;
    (body = returnify(body));
    (_ref6 = compileResolve(body, buffer, scope, opts));
    body = _ref6[0];
    buffer = _ref6[1];
    scope = _ref6[2];
    rest ? body.unshift.apply(body, [].concat(rest)) : undefined;
    (vars = []);
    (funcs = []);
    (dec = "var ");
    (!(typeof args !== 'undefined' && args !== null)) ? (args = []) : undefined;
    _res0 = [];
    _ref7 = scope.hoist;
    for (_i3 = 0; _i3 < _ref7.length; ++_i3) {
      name = _ref7[_i3];
      _res0.push(((!([].indexOf.call(outerScope.hoist, name) >= 0)) && (!([].indexOf.call(args, name) >= 0))) ? (([].indexOf.call(Object.keys(toplevel), name) >= 0) || ([].indexOf.call(Object.keys(opFuncs), name) >= 0) || ([].indexOf.call(Object.keys(macros), name) >= 0)) ? funcs.push(name) : vars.push(name) : undefined);
    }
    _res0;
    _res1 = [];
    _ref8 = scope.service;
    for (_i4 = 0; _i4 < _ref8.length; ++_i4) {
      name = _ref8[_i4];
      _res1.push((!([].indexOf.call(outerScope.service, name) >= 0)) ? vars.push(name) : undefined);
    }
    _res1;
    _res2 = [];
    while ((vars.length > 0)) {
      (name = vars.shift());
      if (([].indexOf.call(vars, name) >= 0)) {
        throw Error(("compiler error: duplicate var in declarations:" + name));
        _ref9 = undefined;
      } else {
        _ref9 = undefined;
      }
      _ref9;
      _res2.push((dec += (name + ", ")));
    }
    _res2;
    if ((dec.length > 4)) {
      (dec = dec.slice(0, (dec.length - 2)));
      _ref10 = body.unshift(dec);
    } else {
      _ref10 = undefined;
    }
    _ref10;
    if (((typeof isTopLevel !== 'undefined' && isTopLevel !== null) && isTopLevel)) {
      _res3 = [];
      while ((funcs.length > 0)) {
        (func = funcs.pop());
        if (([].indexOf.call(funcs, func) >= 0)) {
          throw Error(("compiler error: duplicate func in declarations:" + func));
          _ref11 = undefined;
        } else {
          _ref11 = undefined;
        }
        _ref11;
        if (([].indexOf.call(Object.keys(toplevel), func) >= 0)) {
          _ref12 = body.unshift(toplevel[func].toString());
        } else if (([].indexOf.call(Object.keys(macros), func) >= 0)) {
          _ref12 = body.unshift(("var " + func + " = " + macros[func] + ";"));
        } else if (([].indexOf.call(Object.keys(opFuncs), func) >= 0)) {
          _ref12 = body.unshift(("var " + opFuncs[func].name + " = " + opFuncs[func].func + ";"));
        } else {
          throw Error(("unrecognised func: " + pr(func)));
          _ref12 = undefined;
        }
        _res3.push(_ref12);
      }
      _ref14 = _res3;
    } else {
      _res4 = [];
      _ref13 = funcs;
      for (_i5 = 0; _i5 < _ref13.length; ++_i5) {
        func = _ref13[_i5];
        _res4.push((!([].indexOf.call(outerScope.hoist, func) >= 0)) ? outerScope.hoist.push(func) : undefined);
      }
      _ref14 = _res4;
    }
    _ref14;
    (scope = outerScope);
    buffer.push(("(function(" + spr(args) + ") {" + render(body) + " })"));
    return Array(buffer, scope);
  }));
  (specials.def = (function(form, scope, opts) {
    var buffer, formName, outerScope, fname, args, body, optionals, spreads, i, arg, ind, name, restname, restind, rest, vars, funcs, dec, func, _ref, _i, _res, _ref0, _ref1, _ref2, _i0, _ref3, _i1, _ref4, _ref5, _ref6, _i2, _i3, _res0, _ref7, _i4, _res1, _ref8, _res2, _ref9, _ref10, _res3, _ref11, _ref12, _i5, _res4, _ref13, _ref14;
    (!(typeof opts !== 'undefined' && opts !== null)) ? (opts = ({})) : undefined;
    (buffer = []);
    (form = form.slice());
    (formName = form.shift());
    (outerScope = scope);
    (scope = ({
      hoist: outerScope.hoist.slice(),
      service: outerScope.service.slice()
    }));
    (_ref = form);
    fname = _ref[0];
    var args = 3 <= _ref.length ? [].slice.call(_ref, 1, _i = _ref.length - 1) : (_i = 1, []);
    body = _ref[_i++];
    assertExp(fname, isVarName, "valid function name");
    scope.hoist.push.apply(scope.hoist, [].concat(getArgNames(args)));
    (!(typeof body !== 'undefined' && body !== null)) ? (body = []) : undefined;
    (optionals = []);
    (spreads = 0);
    _res = [];
    _ref0 = args;
    for (i = 0; i < _ref0.length; ++i) {
      arg = _ref0[i];
      if (isList(arg)) {
        assertExp(arg, (function() {
          return ((arguments[0].length === 2));
        }), "optional or rest parameter");
        if (((arg[0] === "spread"))) {
          if ((++spreads > 1)) {
            throw Error("cannot define more than one rest parameter");
            _ref1 = undefined;
          } else {
            _ref1 = undefined;
          }
          _ref1;
          (_ref2 = declareService("_i", scope, opts.function ? args : undefined));
          ind = _ref2[0];
          scope = _ref2[1];
          (_ref3 = compileGetLast(arg, buffer, scope, opts));
          name = _ref3[0];
          buffer = _ref3[1];
          scope = _ref3[2];
          assertExp(name, isVarName, "valid identifier");
          (restname = name);
          (restind = i);
          (args[i] = restname);
          _ref4 = (rest = list((name + " = " + args.length + " <= arguments.length ? [].slice.call(arguments, " + i + ", " + ind + " = arguments.length - " + (args.length - i - 1) + ") : (" + ind + " = " + restind + ", [])")));
        } else {
          assertExp((name = arg[0]), isVarName, "valid parameter name");
          (args[i] = name);
          _ref4 = optionals.push(["if", ["not", ["?", name]],
            ["=", name, arg[1]]
          ]);
        }
        _ref5 = _ref4;
      } else if (restname) {
        _ref5 = rest.push((pr(arg) + " = arguments[" + ind + "++]"));
      } else {
        _ref5 = undefined;
      }
      _res.push(_ref5);
    }
    _res;
    (typeof restind !== 'undefined' && restind !== null) ? (args = args.slice(0, restind)) : undefined;
    (optionals.length > 0) ? (body = [].concat(["do"]).concat(optionals).concat([body])) : undefined;
    (body = returnify(body));
    (_ref6 = compileResolve(body, buffer, scope, opts));
    body = _ref6[0];
    buffer = _ref6[1];
    scope = _ref6[2];
    rest ? body.unshift.apply(body, [].concat(rest)) : undefined;
    (vars = []);
    (funcs = []);
    (dec = "var ");
    (!(typeof args !== 'undefined' && args !== null)) ? (args = []) : undefined;
    _res0 = [];
    _ref7 = scope.hoist;
    for (_i3 = 0; _i3 < _ref7.length; ++_i3) {
      name = _ref7[_i3];
      _res0.push(((!([].indexOf.call(outerScope.hoist, name) >= 0)) && (!([].indexOf.call(args, name) >= 0))) ? (([].indexOf.call(Object.keys(toplevel), name) >= 0) || ([].indexOf.call(Object.keys(opFuncs), name) >= 0) || ([].indexOf.call(Object.keys(macros), name) >= 0)) ? funcs.push(name) : vars.push(name) : undefined);
    }
    _res0;
    _res1 = [];
    _ref8 = scope.service;
    for (_i4 = 0; _i4 < _ref8.length; ++_i4) {
      name = _ref8[_i4];
      _res1.push((!([].indexOf.call(outerScope.service, name) >= 0)) ? vars.push(name) : undefined);
    }
    _res1;
    _res2 = [];
    while ((vars.length > 0)) {
      (name = vars.shift());
      if (([].indexOf.call(vars, name) >= 0)) {
        throw Error(("compiler error: duplicate var in declarations:" + name));
        _ref9 = undefined;
      } else {
        _ref9 = undefined;
      }
      _ref9;
      _res2.push((dec += (name + ", ")));
    }
    _res2;
    if ((dec.length > 4)) {
      (dec = dec.slice(0, (dec.length - 2)));
      _ref10 = body.unshift(dec);
    } else {
      _ref10 = undefined;
    }
    _ref10;
    if (((typeof isTopLevel !== 'undefined' && isTopLevel !== null) && isTopLevel)) {
      _res3 = [];
      while ((funcs.length > 0)) {
        (func = funcs.pop());
        if (([].indexOf.call(funcs, func) >= 0)) {
          throw Error(("compiler error: duplicate func in declarations:" + func));
          _ref11 = undefined;
        } else {
          _ref11 = undefined;
        }
        _ref11;
        if (([].indexOf.call(Object.keys(toplevel), func) >= 0)) {
          _ref12 = body.unshift(toplevel[func].toString());
        } else if (([].indexOf.call(Object.keys(macros), func) >= 0)) {
          _ref12 = body.unshift(("var " + func + " = " + macros[func] + ";"));
        } else if (([].indexOf.call(Object.keys(opFuncs), func) >= 0)) {
          _ref12 = body.unshift(("var " + opFuncs[func].name + " = " + opFuncs[func].func + ";"));
        } else {
          throw Error(("unrecognised func: " + pr(func)));
          _ref12 = undefined;
        }
        _res3.push(_ref12);
      }
      _ref14 = _res3;
    } else {
      _res4 = [];
      _ref13 = funcs;
      for (_i5 = 0; _i5 < _ref13.length; ++_i5) {
        func = _ref13[_i5];
        _res4.push((!([].indexOf.call(outerScope.hoist, func) >= 0)) ? outerScope.hoist.push(func) : undefined);
      }
      _ref14 = _res4;
    }
    _ref14;
    (scope = outerScope);
    buffer.push(("function " + fname + "(" + spr(args) + ") {" + render(body) + " }"));
    buffer.push(fname);
    return Array(buffer, scope);
  }));
  (specials.mac = (function(form) {
    return makeMacro(form);
  }));

  function collect(compiled, collector, isCase) {
    var plug, lastItem, _ref, _ref0;
    (!(typeof isCase !== 'undefined' && isCase !== null)) ? (isCase = false) : undefined;
    if ((isList(compiled) && (compiled.length > 0))) {
      /\{$/.test(compiled.slice(-1)[0]) ? (plug = compiled.pop()) : undefined;
      (lastItem = compiled.pop());
      if (/^return\s/.test(lastItem)) {
        _ref = (lastItem = lastItem.replace(/^return\s/, ("return " + collector + " = ")));
      } else if (util.kwtest(lastItem)) {
        _ref = (lastItem = (collector + " = undefined; " + lastItem));
      } else {
        _ref = (lastItem = (collector + " = " + pr(lastItem)));
      }
      _ref;
      compiled.push(lastItem);
      isCase ? compiled.push("break") : undefined;
      _ref0 = (typeof plug !== 'undefined' && plug !== null) ? compiled.push(plug) : undefined;
    } else {
      _ref0 = undefined;
    }
    _ref0;
    return compiled;
  }
  collect;
  (specials.if = (function(form, scope, opts) {
    var buffer, formName, predicate, prebranch, midcases, postbranch, collector, i, mid, midtest, midbranch, comp, _ref, _i, _ref0, _ref1, _i0, _ref2, _i1, _ref3, _i2, _ref4, _i3, _res, _ref5, _ref6, _i4, _ref7, _i5, _ref8, _ref9, _i6, _i7, _res0, _ref10, _ref11;
    (!(typeof opts !== 'undefined' && opts !== null)) ? (opts = ({})) : undefined;
    (buffer = []);
    (form = form.slice());
    (formName = form.shift());
    (_ref = form);
    predicate = _ref[0];
    prebranch = _ref[1];
    var midcases = 4 <= _ref.length ? [].slice.call(_ref, 2, _i = _ref.length - 1) : (_i = 2, []);
    postbranch = _ref[_i++];
    if (((typeof postbranch !== 'undefined' && postbranch !== null) && ((postbranch[0] === "elif")))) {
      midcases.push(postbranch);
      _ref0 = (postbranch = undefined);
    } else {
      _ref0 = undefined;
    }
    _ref0;
    (_ref1 = compileGetLast(predicate, buffer, scope, opts));
    predicate = _ref1[0];
    buffer = _ref1[1];
    scope = _ref1[2];
    (!(typeof predicate !== 'undefined' && predicate !== null)) ? (predicate = "false") : undefined;
    (_ref2 = compileResolve(prebranch, buffer, scope, opts));
    prebranch = _ref2[0];
    buffer = _ref2[1];
    scope = _ref2[2];
    (_ref3 = compileResolve(postbranch, buffer, scope, opts));
    postbranch = _ref3[0];
    buffer = _ref3[1];
    scope = _ref3[2];
    if ((((prebranch.length === 1)) && (!util.kwtest(prebranch[0])) && ((midcases.length === 0)) && ((postbranch.length === 1)) && (!util.kwtest(postbranch[0])))) {
      _ref11 = buffer.push((pr(predicate) + " ? " + pr(prebranch[0]) + " : " + pr(postbranch[0])));
    } else {
      (_ref4 = declareService("_ref", scope, opts.function ? args : undefined));
      collector = _ref4[0];
      scope = _ref4[1];
      (prebranch = collect(prebranch, collector));
      (postbranch = collect(postbranch, collector));
      _res = [];
      _ref5 = midcases;
      for (i = 0; i < _ref5.length; ++i) {
        mid = _ref5[i];
        assertExp(mid, (function(x) {
          return ((x.shift() === "elif"));
        }), "elif");
        (_ref6 = mid);
        midtest = _ref6[0];
        midbranch = _ref6[1];
        (_ref7 = compileResolve(midtest, buffer, scope, opts));
        midtest = _ref7[0];
        buffer = _ref7[1];
        scope = _ref7[2];
        (!(typeof midtest !== 'undefined' && midtest !== null)) ? (midtest = "false") : undefined;
        if ((midtest.length > 1)) {
          throw Error((pr("elif") + " must compile to single expression (todo fix later); got:" + pr(midtest)));
          _ref8 = undefined;
        } else {
          _ref8 = undefined;
        }
        _ref8;
        (_ref9 = compileResolve(midbranch, buffer, scope, opts));
        midbranch = _ref9[0];
        buffer = _ref9[1];
        scope = _ref9[2];
        _res.push((midcases[i] = ({
          test: midtest,
          branch: collect(midbranch, collector)
        })));
      }
      _res;
      (comp = ("if (" + pr(predicate) + ") { " + render(prebranch) + " } "));
      _res0 = [];
      _ref10 = midcases;
      for (_i7 = 0; _i7 < _ref10.length; ++_i7) {
        mid = _ref10[_i7];
        _res0.push((comp += (" else if (" + spr(mid.test) + ") { " + render(mid.branch) + " }")));
      }
      _res0;
      (typeof postbranch !== 'undefined' && postbranch !== null) ? (comp += (" else { " + render(postbranch) + " }")) : undefined;
      _ref11 = buffer.push(comp, collector);
    }
    _ref11;
    return Array(buffer, scope);
  }));
  (specials.switch = (function(form, scope, opts) {
    var buffer, formName, predicate, midcases, postbranch, collector, i, mid, midtest, midbranch, comp, _ref, _i, _ref0, _ref1, _i0, _ref2, _i1, _res, _ref3, _ref4, _i2, _ref5, _i3, _ref6, _ref7, _i4, _ref8, _i5, _i6, _res0, _ref9;
    (!(typeof opts !== 'undefined' && opts !== null)) ? (opts = ({})) : undefined;
    (buffer = []);
    (form = form.slice());
    (formName = form.shift());
    (_ref = form);
    predicate = _ref[0];
    var midcases = 3 <= _ref.length ? [].slice.call(_ref, 1, _i = _ref.length - 1) : (_i = 1, []);
    postbranch = _ref[_i++];
    if (((typeof postbranch !== 'undefined' && postbranch !== null) && ((postbranch[0] === "case")))) {
      midcases.push(postbranch);
      _ref0 = (postbranch = undefined);
    } else {
      _ref0 = undefined;
    }
    _ref0;
    (_ref1 = declareService("_ref", scope, opts.function ? args : undefined));
    collector = _ref1[0];
    scope = _ref1[1];
    (_ref2 = compileGetLast(predicate, buffer, scope, opts));
    predicate = _ref2[0];
    buffer = _ref2[1];
    scope = _ref2[2];
    (!(typeof predicate !== 'undefined' && predicate !== null)) ? (predicate = "false") : undefined;
    _res = [];
    _ref3 = midcases;
    for (i = 0; i < _ref3.length; ++i) {
      mid = _ref3[i];
      assertExp(mid, (function(x) {
        return ((x.shift() === "case"));
      }), "case");
      (_ref4 = mid);
      midtest = _ref4[0];
      midbranch = _ref4[1];
      (_ref5 = compileResolve(midtest, buffer, scope, opts));
      midtest = _ref5[0];
      buffer = _ref5[1];
      scope = _ref5[2];
      (!(typeof midtest !== 'undefined' && midtest !== null)) ? (midtest = "false") : undefined;
      if ((midtest.length > 1)) {
        throw Error((pr("case") + " must compile to single expression (todo fix later); got:" + pr(midtest)));
        _ref6 = undefined;
      } else {
        _ref6 = undefined;
      }
      _ref6;
      (_ref7 = compileResolve(midbranch, buffer, scope, opts));
      midbranch = _ref7[0];
      buffer = _ref7[1];
      scope = _ref7[2];
      _res.push((midcases[i] = ({
        test: midtest,
        branch: collect(midbranch, collector, true)
      })));
    }
    _res;
    (_ref8 = compileResolve(postbranch, buffer, scope, opts));
    postbranch = _ref8[0];
    buffer = _ref8[1];
    scope = _ref8[2];
    (postbranch = collect(postbranch, collector));
    (comp = ("switch (" + pr(predicate) + ") { "));
    _res0 = [];
    _ref9 = midcases;
    for (_i6 = 0; _i6 < _ref9.length; ++_i6) {
      mid = _ref9[_i6];
      _res0.push((comp += (" case " + spr(mid.test) + ": " + render(mid.branch))));
    }
    _res0;
    (comp += (" default: " + render(postbranch) + " }"));
    buffer.push(comp, collector);
    return Array(buffer, scope);
  }));
  (specials.for = (function(form, scope, opts) {
    var buffer, formName, value, key, iterable, body, collector, ref, _ref, _ref0, _ref1, _i, _ref2, _ref3, _i0, _ref4, _i1, _ref5, _i2, _ref6, _ref7, _ref8, _i3, _ref9, _i4, _ref10, _i5, _ref11, _i6;
    (!(typeof opts !== 'undefined' && opts !== null)) ? (opts = ({})) : undefined;
    (buffer = []);
    (form = form.slice());
    (formName = form.shift());
    if ((form.length < 2)) {
      throw Error((pr(formName) + " expects no less than " + pr(2) + " arguments"));
      _ref = undefined;
    } else {
      _ref = undefined;
    }
    _ref;
    if ((form.length > 4)) {
      throw Error((pr(formName) + " expects no more than " + pr(4) + " arguments"));
      _ref0 = undefined;
    } else {
      _ref0 = undefined;
    }
    _ref0;
    (_ref1 = form);
    value = _ref1[0];
    key = _ref1[1];
    iterable = _ref1[2];
    body = _ref1[3];
    if ((!(typeof body !== 'undefined' && body !== null))) {
      if ((!(typeof iterable !== 'undefined' && iterable !== null))) {
        if ((isNaN(Number(value)) || (!(parseInt(value) > 0)))) {
          throw Error(("expecting integer, got " + pr(value)));
          _ref2 = undefined;
        } else {
          _ref2 = undefined;
        }
        _ref2;
        (body = key);
        (iterable = ["quote", [range, 1, [parseInt, value]]]);
        (_ref3 = declareService("_i", scope, opts.function ? args : undefined));
        key = _ref3[0];
        scope = _ref3[1];
        (_ref4 = declareService("_val", scope, opts.function ? args : undefined));
        value = _ref4[0];
        _ref6 = scope = _ref4[1];
      } else {
        (body = iterable);
        (iterable = key);
        (_ref5 = declareService("_i", scope, opts.function ? args : undefined));
        key = _ref5[0];
        scope = _ref5[1];
        assertExp(value, isVarName, "valid identifier");
        _ref6 = (scope = declareVar(value, scope));
      }
      _ref7 = _ref6;
    } else {
      assertExp(key, isVarName, "valid identifier");
      (scope = declareVar(key, scope));
      assertExp(value, isVarName, "valid identifier");
      _ref7 = (scope = declareVar(value, scope));
    }
    _ref7;
    assertExp(key, isVarName, "valid identifier");
    assertExp(value, isVarName, "valid identifier");
    (_ref8 = declareService("_res", scope, opts.function ? args : undefined));
    collector = _ref8[0];
    scope = _ref8[1];
    (_ref9 = declareService("_ref", scope, opts.function ? args : undefined));
    ref = _ref9[0];
    scope = _ref9[1];
    buffer.push((collector + " = []"));
    (_ref10 = compileGetLast(iterable, buffer, scope, opts));
    iterable = _ref10[0];
    buffer = _ref10[1];
    scope = _ref10[2];
    buffer.push((ref + " = " + pr(iterable)));
    (_ref11 = compileResolve(body, buffer, scope, opts));
    body = _ref11[0];
    buffer = _ref11[1];
    scope = _ref11[2];
    (!util.kwtest(pr(body.slice(-1)[0]))) ? body.push((collector + ".push(" + pr(body.pop()) + ")")) : undefined;
    buffer.push(("for (" + key + " = 0; " + key + " < " + ref + ".length; ++" + key + ") { " + value + " = " + ref + "[" + key + "]; " + render(body) + " }"));
    buffer.push(collector);
    return Array(buffer, scope);
  }));
  (specials.over = (function(form, scope, opts) {
    var buffer, formName, value, key, iterable, body, collector, ref, _ref, _ref0, _ref1, _i, _ref2, _i0, _ref3, _ref4, _i1, _ref5, _i2, _ref6, _i3, _ref7, _i4, _ref8, _i5, _ref9, _i6;
    (!(typeof opts !== 'undefined' && opts !== null)) ? (opts = ({})) : undefined;
    (buffer = []);
    (form = form.slice());
    (formName = form.shift());
    if ((form.length < 2)) {
      throw Error((pr(formName) + " expects no less than " + pr(2) + " arguments"));
      _ref = undefined;
    } else {
      _ref = undefined;
    }
    _ref;
    if ((form.length > 4)) {
      throw Error((pr(formName) + " expects no more than " + pr(4) + " arguments"));
      _ref0 = undefined;
    } else {
      _ref0 = undefined;
    }
    _ref0;
    (_ref1 = form);
    value = _ref1[0];
    key = _ref1[1];
    iterable = _ref1[2];
    body = _ref1[3];
    if ((!(typeof body !== 'undefined' && body !== null))) {
      (body = iterable);
      (iterable = key);
      (_ref2 = declareService("_key", scope, opts.function ? args : undefined));
      key = _ref2[0];
      scope = _ref2[1];
      assertExp(value, isVarName, "valid identifier");
      _ref3 = (scope = declareVar(value, scope));
    } else if ((!(typeof iterable !== 'undefined' && iterable !== null))) {
      (body = key);
      (iterable = value);
      (_ref4 = declareService("_key", scope, opts.function ? args : undefined));
      key = _ref4[0];
      scope = _ref4[1];
      (_ref5 = declareService("_val", scope, opts.function ? args : undefined));
      value = _ref5[0];
      _ref3 = scope = _ref5[1];
    } else {
      assertExp(key, isVarName, "valid identifier");
      (scope = declareVar(key, scope));
      assertExp(value, isVarName, "valid identifier");
      _ref3 = (scope = declareVar(value, scope));
    }
    _ref3;
    assertExp(key, isVarName, "valid identifier");
    assertExp(value, isVarName, "valid identifier");
    (_ref6 = declareService("_res", scope, opts.function ? args : undefined));
    collector = _ref6[0];
    scope = _ref6[1];
    (_ref7 = declareService("_ref", scope, opts.function ? args : undefined));
    ref = _ref7[0];
    scope = _ref7[1];
    buffer.push((collector + " = []"));
    (_ref8 = compileGetLast(iterable, buffer, scope, opts));
    iterable = _ref8[0];
    buffer = _ref8[1];
    scope = _ref8[2];
    buffer.push((ref + " = " + pr(iterable)));
    (_ref9 = compileResolve(body, buffer, scope, opts));
    body = _ref9[0];
    buffer = _ref9[1];
    scope = _ref9[2];
    (!util.kwtest(pr(body.slice(-1)[0]))) ? body.push((collector + ".push(" + pr(body.pop()) + ")")) : undefined;
    buffer.push(("for (" + key + " in " + ref + ") { " + value + " = " + ref + "[" + key + "]; " + render(body) + " }"));
    buffer.push(collector);
    return Array(buffer, scope);
  }));
  (specials.while = (function(form, scope, opts) {
    var buffer, formName, test, body, rvalue, collector, comp, _ref, _ref0, _ref1, _i, _ref2, _i0, _ref3, _ref4, _i1, _ref5, _i2, _ref6, _i3, _ref7;
    (!(typeof opts !== 'undefined' && opts !== null)) ? (opts = ({})) : undefined;
    (buffer = []);
    (form = form.slice());
    (formName = form.shift());
    if ((form.length < 2)) {
      throw Error((pr(formName) + " expects no less than " + pr(2) + " arguments"));
      _ref = undefined;
    } else {
      _ref = undefined;
    }
    _ref;
    if ((form.length > 3)) {
      throw Error((pr(formName) + " expects no more than " + pr(3) + " arguments"));
      _ref0 = undefined;
    } else {
      _ref0 = undefined;
    }
    _ref0;
    (_ref1 = form);
    test = _ref1[0];
    body = _ref1[1];
    rvalue = _ref1[2];
    if (((form.length === 2))) {
      (_ref2 = declareService("_res", scope, opts.function ? args : undefined));
      collector = _ref2[0];
      scope = _ref2[1];
      _ref3 = buffer.push((collector + " = []"));
    } else {
      _ref3 = (comp = "");
    }
    _ref3;
    (_ref4 = compileGetLast(test, buffer, scope, opts));
    test = _ref4[0];
    buffer = _ref4[1];
    scope = _ref4[2];
    (_ref5 = compileResolve(body, buffer, scope, opts));
    body = _ref5[0];
    buffer = _ref5[1];
    scope = _ref5[2];
    (((form.length === 2)) && (!util.kwtest(pr(body.slice(-1)[0])))) ? body.push((collector + ".push(" + pr(body.pop()) + ")")) : undefined;
    buffer.push(("while (" + pr(test) + ") { " + render(body) + " }"));
    if (((form.length === 2))) {
      _ref7 = buffer.push(collector);
    } else {
      (_ref6 = compileResolve(rvalue, buffer, scope, opts));
      rvalue = _ref6[0];
      buffer = _ref6[1];
      scope = _ref6[2];
      _ref7 = buffer.push(render(rvalue));
    }
    _ref7;
    return Array(buffer, scope);
  }));
  (specials.try = (function(form, scope, opts) {
    var buffer, formName, collector, tryForm, catchForm, finalForm, err, res, _ref, _ref0, _ref1, _i, _ref2, _i0, _ref3, _i1, _ref4, _i2, _ref5, _i3, _ref6, _ref7, _i4, _ref8, _ref9, _i5, _ref10;
    (!(typeof opts !== 'undefined' && opts !== null)) ? (opts = ({})) : undefined;
    (buffer = []);
    (form = form.slice());
    (formName = form.shift());
    if ((form.length < 1)) {
      throw Error((pr(formName) + " expects no less than " + pr(1) + " arguments"));
      _ref = undefined;
    } else {
      _ref = undefined;
    }
    _ref;
    if ((form.length > 3)) {
      throw Error((pr(formName) + " expects no more than " + pr(3) + " arguments"));
      _ref0 = undefined;
    } else {
      _ref0 = undefined;
    }
    _ref0;
    (_ref1 = declareService("_ref", scope, opts.function ? args : undefined));
    collector = _ref1[0];
    scope = _ref1[1];
    (_ref2 = form);
    tryForm = _ref2[0];
    catchForm = _ref2[1];
    finalForm = _ref2[2];
    (_ref3 = compileResolve(tryForm, buffer, scope, opts));
    tryForm = _ref3[0];
    buffer = _ref3[1];
    scope = _ref3[2];
    tryForm.push((collector + " = " + pr(tryForm.pop())));
    if ((isList(catchForm) && ((catchForm[0] === "catch")))) {
      assertExp(catchForm, (function() {
        return ((arguments[0].length === 2) || (arguments[0].length === 3));
      }), "valid catch form");
      (_ref4 = catchForm);
      catchForm = _ref4[0];
      err = _ref4[1];
      catchForm = _ref4[2];
      assertExp(err, isVarName, "valid identifier");
      _ref6 = (scope = declareVar(err, scope));
    } else {
      (_ref5 = declareService("_err", scope, opts.function ? args : undefined));
      err = _ref5[0];
      _ref6 = scope = _ref5[1];
    }
    _ref6;
    (!(typeof catchForm !== 'undefined' && catchForm !== null)) ? (catchForm = []) : undefined;
    (_ref7 = compileResolve(catchForm, buffer, scope, opts));
    catchForm = _ref7[0];
    buffer = _ref7[1];
    scope = _ref7[2];
    (!util.kwtest(pr(catchForm.slice(-1)[0]))) ? catchForm.push((collector + " = " + pr(catchForm.pop()))) : undefined;
    if ((typeof finalForm !== 'undefined' && finalForm !== null)) {
      if ((isList(finalForm) && ((finalForm[0] === "finally")))) {
        assertExp(finalForm, (function() {
          return ((arguments[0].length === 2));
        }));
        _ref8 = (finalForm = finalForm.slice(-1)[0]);
      } else {
        _ref8 = undefined;
      }
      _ref8;
      (_ref9 = compileResolve(finalForm, buffer, scope, opts));
      finalForm = _ref9[0];
      buffer = _ref9[1];
      scope = _ref9[2];
      _ref10 = (!util.kwtest(pr(finalForm.slice(-1)[0]))) ? finalForm.push((collector + " = " + pr(finalForm.pop()))) : undefined;
    } else {
      _ref10 = undefined;
    }
    _ref10;
    (res = ("try { " + render(tryForm) + " } catch (" + pr(err) + ") { " + render(catchForm) + " }"));
    (typeof finalForm !== 'undefined' && finalForm !== null) ? (res += (" finally { " + render(finalForm) + " }")) : undefined;
    buffer.push(res, collector);
    return Array(buffer, scope);
  }));
  (specials.get = (function(form, scope, opts) {
    var buffer, formName, object, property, _ref, _ref0, _ref1, _i, _ref2, _ref3, _i0, _ref4, _i1;
    (!(typeof opts !== 'undefined' && opts !== null)) ? (opts = ({})) : undefined;
    (buffer = []);
    (form = form.slice());
    (formName = form.shift());
    if ((form.length < 1)) {
      throw Error((pr(formName) + " expects no less than " + pr(1) + " arguments"));
      _ref = undefined;
    } else {
      _ref = undefined;
    }
    _ref;
    if ((form.length > 2)) {
      throw Error((pr(formName) + " expects no more than " + pr(2) + " arguments"));
      _ref0 = undefined;
    } else {
      _ref0 = undefined;
    }
    _ref0;
    (_ref1 = form);
    object = _ref1[0];
    property = _ref1[1];
    if ((!(typeof property !== 'undefined' && property !== null))) {
      (property = object);
      _ref2 = (object = "");
    } else {
      _ref2 = undefined;
    }
    _ref2;
    (_ref3 = compileGetLast(object, buffer, scope, opts));
    object = _ref3[0];
    buffer = _ref3[1];
    scope = _ref3[2];
    (_ref4 = compileGetLast(property, buffer, scope, opts));
    property = _ref4[0];
    buffer = _ref4[1];
    scope = _ref4[2];
    assertExp(object, (function() {
      return (typeof arguments[0] !== 'undefined' && arguments[0] !== null);
    }), "valid object");
    isVarName(property) ? buffer.push((pr(object) + "." + property)) : buffer.push((pr(object) + "[" + pr(property) + "]"));
    return Array(buffer, scope);
  }));
  (specials.spread = (function(form, scope, opts) {
    var buffer, formName, _ref, _ref0, _ref1, _i, _ref2;
    (!(typeof opts !== 'undefined' && opts !== null)) ? (opts = ({})) : undefined;
    (buffer = []);
    (form = form.slice());
    (formName = form.shift());
    if ((form.length < 1)) {
      throw Error((pr(formName) + " expects no less than " + pr(1) + " arguments"));
      _ref = undefined;
    } else {
      _ref = undefined;
    }
    _ref;
    if ((form.length > 1)) {
      throw Error((pr(formName) + " expects no more than " + pr(1) + " arguments"));
      _ref0 = undefined;
    } else {
      _ref0 = undefined;
    }
    _ref0;
    (form = form[0]);
    if (isList(form)) {
      (_ref1 = compileAdd(form, buffer, scope, opts));
      buffer = _ref1[0];
      _ref2 = scope = _ref1[1];
    } else if (isAtom(form)) {
      _ref2 = buffer.push(form);
    } else {
      throw Error(("spread requires atom, got: " + pr(form)));
      _ref2 = undefined;
    }
    _ref2;
    return Array(buffer, scope);
  }));
  (specials.return = (function(form, scope, opts) {
    var buffer, formName, _ref, _ref0, _i, _ref1;
    (!(typeof opts !== 'undefined' && opts !== null)) ? (opts = ({})) : undefined;
    (buffer = []);
    (form = form.slice());
    (formName = form.shift());
    if ((form.length > 1)) {
      throw Error((pr(formName) + " expects no more than " + pr(1) + " arguments"));
      _ref = undefined;
    } else {
      _ref = undefined;
    }
    _ref;
    if (((form.length !== 0))) {
      (_ref0 = compileGetLast(form[0], buffer, scope, opts));
      form = _ref0[0];
      buffer = _ref0[1];
      scope = _ref0[2];
      (!/^return\s/.test(form)) ? (form = ("return " + pr(form))) : undefined;
      _ref1 = buffer.push(form);
    } else {
      _ref1 = undefined;
    }
    _ref1;
    return Array(buffer, scope);
  }));
  (macros = ({}));

  function importMacros() {
    var store, key, val, _i, _i0, _res, _ref, _res0, _ref0;
    stores = 1 <= arguments.length ? [].slice.call(arguments, 0, _i = arguments.length - 0) : (_i = 0, []);
    _res = [];
    _ref = stores;
    for (_i0 = 0; _i0 < _ref.length; ++_i0) {
      store = _ref[_i0];
      _res0 = [];
      _ref0 = store;
      for (key in _ref0) {
        val = _ref0[key];
        _res0.push((macros[key] = val));
      }
      _res.push(_res0);
    }
    _res;
    return macros;
  }(exports.importMacros = importMacros);
  importMacros(require("./macros"));

  function parseMacros(form) {
    var key, val, i, _res, _ref, _ref0, _res0, _ref1, _ref2;
    if (util.isHash(form)) {
      _res = [];
      _ref = form;
      for (key in _ref) {
        val = _ref[key];
        _res.push((form[key] = parseMacros(val)));
      }
      _ref0 = _res;
    } else if (util.isList(form)) {
      if (((form[0] === "mac"))) {
        _ref2 = (form = makeMacro(form.slice(1)));
      } else {
        _res0 = [];
        _ref1 = form;
        for (i = 0; i < _ref1.length; ++i) {
          val = _ref1[i];
          _res0.push((form[i] = parseMacros(val)));
        }
        _ref2 = _res0;
      }
      _ref0 = _ref2;
    } else {
      _ref0 = undefined;
    }
    _ref0;
    return form;
  }
  parseMacros;

  function makeMacro(form) {
    var name, body, compiled, scope, rendered, _ref, _i, _ref0, _ref1, _ref2, _i0;
    (_ref = form);
    name = _ref[0];
    var body = 2 <= _ref.length ? [].slice.call(_ref, 1, _i = _ref.length - 0) : (_i = 1, []);
    if ((!(typeof name !== 'undefined' && name !== null))) {
      throw Error("a macro requires a name");
      _ref0 = undefined;
    } else {
      _ref0 = undefined;
    }
    _ref0;
    if ((!(typeof body !== 'undefined' && body !== null))) {
      throw Error("a macro requires a body");
      _ref1 = undefined;
    } else {
      _ref1 = undefined;
    }
    _ref1;
    body.unshift("fn");
    (_ref2 = compileForm(body, ({
      hoist: [],
      service: []
    }), ({
      macro: true
    })));
    compiled = _ref2[0];
    scope = _ref2[1];
    (rendered = render(compiled));
    (macros[name] = vm.runInThisContext(rendered));
    return [];
  }
  makeMacro;

  function expandMacros(form) {
    var key, val, i, _res, _ref, _ref0, _res0, _ref1, _ref2;
    if (util.isHash(form)) {
      _res = [];
      _ref = form;
      for (key in _ref) {
        val = _ref[key];
        _res.push((form[key] = expandMacros(val)));
      }
      _ref0 = _res;
    } else if (util.isList(form)) {
      if (((form[0] === "mac"))) {
        _ref2 = (form = parseMacros(form));
      } else if (([].indexOf.call(Object.keys(macros), form[0]) >= 0)) {
        (form = macros[form[0]].apply(macros, [].concat(form.slice(1))));
        (((typeof form) === "undefined")) ? (form = []) : undefined;
        _ref2 = (form = expandMacros(form));
      } else {
        _res0 = [];
        _ref1 = form;
        for (i = 0; i < _ref1.length; ++i) {
          val = _ref1[i];
          _res0.push((form[i] = expandMacros(val)));
        }
        _ref2 = _res0;
      }
      _ref0 = _ref2;
    } else {
      _ref0 = undefined;
    }
    _ref0;
    return form;
  }
  expandMacros;

  function macroexpand(src) {
    return expandMacros(parseMacros(src));
  }
  macroexpand;
  (exports.fileExtensions = [".jisp"]);
  (exports.register = (function() {
    return require("./register");
  }));
  (exports.tokenise = (function(src) {
    return tokenise(src);
  }));
  (exports.lex = (function(src) {
    return lex(tokenise(src));
  }));
  (exports.parse = (function(src) {
    return parse(lex(tokenise(src)));
  }));
  (exports.macroexpand = (function(src) {
    return macroexpand(parse(lex(tokenise(src))));
  }));
  (exports.macros = macros);

  function compile(src, opts) {
    var defaults, parsed, expanded, compiled, scope, _ref, _i;
    (defaults = ({
      wrap: true
    }));
    (opts = util.merge(defaults, opts));
    (parsed = parse(lex(tokenise(src))));
    parsed.unshift("do");
    opts.wrap ? (parsed = [
      ["get", ["fn", parsed], "call"], "this"
    ]) : undefined;
    (expanded = macroexpand(parsed));
    (_ref = compileForm(expanded, ({
      hoist: [],
      service: []
    }), ({
      toplevel: true
    })));
    compiled = _ref[0];
    scope = _ref[1];
    return (typeof beautify !== 'undefined' && beautify !== null) ? beautify(render(compiled), ({
      indent_size: 2
    })) : render(compiled);
  }(exports.compile = compile);

  function compileFile(filename) {
    var raw, stripped, err, _ref;
    (raw = fs.readFileSync(filename, "utf8"));
    (stripped = ((raw.charCodeAt(0) === 65279)) ? raw.substring(1) : raw);
    try {
      _ref = exports.compile(stripped);
    } catch (err) {
      throw err;
      _ref = undefined;
    }
    return _ref;
  }(exports.compileFile = compileFile);

  function run(code, options) {
    var mainModule, dir;
    (!(typeof options !== 'undefined' && options !== null)) ? (options = ({})) : undefined;
    (mainModule = require.main);
    (mainModule.filename = (process.argv[1] = options.filename ? fs.realpathSync(options.filename) : "."));
    mainModule.moduleCache ? (mainModule.moduleCache = ({})) : undefined;
    (dir = options.filename ? path.dirname(fs.realpathSync(options.filename)) : fs.realpathSync("."));
    (mainModule.paths = require("module")._nodeModulePaths(dir));
    ((!util.isJisp(mainModule.filename)) || require.extensions) ? (code = exports.compile(code)) : undefined;
    return mainModule._compile(code, mainModule.filename);
  }
  return (exports.run = run);
}).call(this);
      return module.exports;
    })();require['./browser'] = (function() {
      var exports = {}, module = {exports: exports};
      (function() {
  var jisp, compile, _ref;
  (jisp = require("./jisp"));
  (jisp.require = require);
  (compile = jisp.compile);
  (jisp.eval = (function(code, options) {
    (!(typeof options !== 'undefined' && options !== null)) ? (options = ({})) : undefined;
    (options.wrap = false);
    return eval(compile(code, options));
  }));
  (jisp.run = (function(code, options) {
    var compiled;
    (!(typeof options !== 'undefined' && options !== null)) ? (options = ({})) : undefined;
    (options.wrap = false);
    (compiled = compile(code, options));
    return Function(compile(code, options))();
  }));
  if ((!(typeof window !== 'undefined' && window !== null))) {} else {
    _ref = undefined;
  }
  _ref;
  (jisp.load = (function(url, callback, options, hold) {
    var xhr;
    (!(typeof options !== 'undefined' && options !== null)) ? (options = ({})) : undefined;
    (!(typeof hold !== 'undefined' && hold !== null)) ? (hold = false) : undefined;
    (options.sourceFiles = [url]);
    (xhr = window.ActiveXObject ? new window.ActiveXObject("Microsoft.XMLHTTP") : new window.XMLHttpRequest());
    xhr.open("GET", url, true);
    ("overrideMimeType" in xhr) ? xhr.overrideMimeType("text/plain") : undefined;
    (xhr.onreadystatechange = (function() {
      var param, _ref0, _ref1;
      if (((xhr.readyState === 4))) {
        if (((xhr.status === 0) || (xhr.status === 200))) {
          (param = [xhr.responseText, options]);
          _ref0 = (!hold) ? jisp.run.apply(jisp, [].concat(param)) : undefined;
        } else {
          throw new Error(("Could not load " + url));
          _ref0 = undefined;
        }
        _ref1 = _ref0;
      } else {
        _ref1 = undefined;
      }
      _ref1;
      return callback ? callback(param) : undefined;
    }));
    return xhr.send(null);
  }));

  function runScripts() {
    var scripts, jisps, index, s, i, script, _i, _res, _ref0, _res0, _ref1;
    (scripts = window.document.getElementsByTagName("script"));
    (jisps = []);
    (index = 0);
    _res = [];
    _ref0 = scripts;
    for (_i = 0; _i < _ref0.length; ++_i) {
      s = _ref0[_i];
      _res.push(((s.type === "text/jisp")) ? jisps.push(s) : undefined);
    }
    _res;

    function execute() {
      var param, _ref1;
      (param = jisps[index]);
      if ((param instanceof Array)) {
        jisp.run.apply(jisp, [].concat(param));
        ++index;
        _ref1 = execute();
      } else {
        _ref1 = undefined;
      }
      return _ref1;
    }
    execute;
    _res0 = [];
    _ref1 = jisps;
    for (i = 0; i < _ref1.length; ++i) {
      script = _ref1[i];
      _res0.push((function(script, i) {
        var options, _ref2;
        (options = ({}));
        if (script.src) {
          _ref2 = jisp.load(script.src, (function(param) {
            (jisps[i] = param);
            return execute();
          }), options, true);
        } else {
          (options.sourceFiles = ["embedded"]);
          _ref2 = (jisps[i] = [script.innerHTML, options]);
        }
        return _ref2;
      })(script, i));
    }
    _res0;
    return execute();
  }
  runScripts;
  return window.addEventListener ? window.addEventListener("DOMContentLoaded", runScripts, false) : window.attachEvent("onload", runScripts);
}).call(this);
      return module.exports;
    })();
      return require['./jisp'];
    }();
  }());