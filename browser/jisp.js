(function(root) {
    var jisp = function() {
      function require(path) { return require[path]; }
      require['./util'] = (function() {
      var exports = {}, module = {exports: exports};
      (function() {
  var symbolWhitelist, keywords, specialValues;
  exports.symbolWhitelist = (symbolWhitelist = ["+", "-", "*", "/", "%", "++", "--", "?", "?!", "==", "===", "!=", "!==", "&&", "||", "!", "!!", ">", "<", ">=", "<=", "&", "|", "^", "<<", ">>", ">>>", "~", "=", "+=", "-=", "*=", "/=", "%=", "<<=", ">>=", ">>>=", "&=", "^=", "|="]);
  exports.keywords = (keywords = ["return", "break", "continue", "throw", "delete"]);

  function kwtest(str) {
    var kw, re, _i, _res, _ref;
    _res = [];
    _ref = keywords;
    for (_i = 0; _i < _ref.length; ++_i) {
      kw = _ref[_i];
      _res.push(("^" + kw + " "));
    }
    re = RegExp(_res.join("|"));
    return re.test(str);
  }
  exports.kwtest = kwtest;
  exports.specialValues = (specialValues = ["undefined", "null", "true", "false", "yes", "no", "Infinity", "NaN"]);

  function isSpecialValue(str) {
    return [].indexOf.call(specialValues, str, specialValues) >= 0;
  }
  exports.isSpecialValueStr = isSpecialValue;

  function isSpecialValue(form) {
    return (typeof form === "undefined") || (form === null) || ((typeof form === "number") && isNaN(form)) || (form === Infinity) || (typeof form === "boolean");
  }
  exports.isSpecialValue = isSpecialValue;

  function isAtom(form) {
    return (form === undefined || form === null) || /^\/[^\s\/]+\/[\w]*$/.test(form) || (typeof form === "number" || typeof form === "string" || typeof form === "boolean");
  }
  exports.isAtom = isAtom;

  function isAtomString(form) {
    return !isSpecialValue(form) && (isNum(form) || isRegex(form) || isIdentifier(form) || isString(form) || ([].indexOf.call(symbolWhitelist, form, symbolWhitelist) >= 0) || /^#[\d]+$/.test(form) || /^#$/.test(form));
  }
  exports.isAtomString = isAtomString;

  function isList(form) {
    return Array.isArray(form);
  }
  exports.isList = isList;

  function isHash(form) {
    return !isAtom(form) && !isList(form) && !(typeof form === "function");
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
    return isAtom(form) && (isString(form) || isIdentifier(form) || isNum(form));
  }
  exports.isKey = isKey;

  function isVarName(form) {
    return isAtom(form) && /^[$_A-Za-z]{1}$|^[$_A-Za-z]+[$_\w]*(?:[$_\w](?!\.))+$/.test(form);
  }
  exports.isVarName = isVarName;

  function isIdentifier(form) {
    return isAtom(form) && /^[$_A-Za-z]{1}[$_\w]*((\.[$_A-Za-z]{1}[$_\w]*)|(\[[$_.\w\[\]]+\])|(\['.*'\])|(\[".*"\]))*$/.test(form);
  }
  exports.isIdentifier = isIdentifier;

  function isString(form) {
    return isAtom(form) && /^".*"$|^'.*'$/.test(form);
  }
  exports.isString = isString;

  function isRegex(form) {
    return isAtom(form) && /^\/[^\s]+\/[\w]*[^\s)]*/.test(form);
  }
  exports.isRegex = isRegex;

  function isNum(form) {
    return isAtom(form) && (typeof typify(form) === "number");
  }
  exports.isNum = isNum;

  function isPrimitive(form) {
    return isRegex(form) || isNum(form) || (form === undefined || form === null || form === true || form === false);
  }
  exports.isPrimitive = isPrimitive;

  function isArgHash(form) {
    return isAtom(form) && /^#[\d]+$/.test(form);
  }
  exports.isArgHash = isArgHash;

  function isArgsHash(form) {
    return isAtom(form) && /^#$/.test(form);
  }
  exports.isArgsHash = isArgsHash;

  function isArgHashNotation(form) {
    return isArgHash(form) || isArgsHash(form);
  }
  exports.isArgHashNotation = isArgHashNotation;

  function isDotName(form) {
    return isAtom(form) && /^\.[$_A-Za-z]{1}$|^\.[$_A-Za-z]+[$_.\w]*(?:[$_\w](?!\.))+$/.test(form);
  }
  exports.isDotName = isDotName;

  function isBracketName(form) {
    return isAtom(form) && /^\[[$_A-Za-z]{1}\]$|^\[[$_A-Za-z]+[$_.\w]*(?:[$_\w](?!\.))+\]$/.test(form);
  }
  exports.isBracketName = isBracketName;

  function isBracketString(form) {
    return isAtom(form) && /^\[".*"\]$|^\['.*'\]$/.test(form);
  }
  exports.isBracketString = isBracketString;

  function isPropSyntax(form) {
    return isAtom(form) && (isDotName(form) || isBracketName(form) || isBracketString(form));
  }
  exports.isPropSyntax = isPropSyntax;

  function typify(form) {
    var _ref;
    if (!isAtom(form)) {
      _ref = undefined;
      throw Error("expecting atom, got " + pr(form));
    } else if (isBlankObject(form)) {
      _ref = form;
    } else if ((typeof form === "undefined")) {
      _ref = undefined;
    } else if ((form === "null")) {
      _ref = null;
    } else if ((form === "true" || form === "yes")) {
      _ref = true;
    } else if ((form === "false" || form === "no")) {
      _ref = false;
    } else if (!isNaN(Number(form))) {
      _ref = Number(form);
    } else if (isRegex(form)) {
      _ref = form;
    } else if ((typeof form === "string")) {
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
    !(typeof min !== 'undefined' && min !== null) ? min = 0 : undefined;
    !(typeof max !== 'undefined' && max !== null) ? max = Infinity : undefined;
    if (!isList(form)) {
      _ref = undefined;
      throw Error("expecting list, got " + form);
    } else if (!(form.length >= min) && (form.length <= max)) {
      _ref = undefined;
      throw Error("expecting between " + min + " and " + max + " arguments, got " + form.length + ": " + pr(form));
    } else if ((typeof first !== 'undefined' && first !== null && form[0] !== first)) {
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
    !(typeof expect !== 'undefined' && expect !== null) ? expect = "valid expression" : undefined;
    if (test(exp)) {
      _ref = true;
    } else {
      _ref = undefined;
      throw Error("expecting " + pr(expect) + ", got " + pr(exp));
    }
    return _ref;
  }
  exports.assertExp = assertExp;

  function pr(item) {
    var res, key, val, _ref, _ref0, _i, _ref10;
    if (isAtom(item)) {
      _ref = ("" + item).replace(/;$/, "");
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
      _ref10 = item;
      for (_i = 0; _i < _ref10.length; ++_i) {
        val = _ref10[_i];
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
      if ((isList(exp) && (exp.length === 0)) || (typeof exp === "undefined") || (exp === "")) {
        buffer[i] = undefined;
      } else {
        res = typeof exp === "string" ? exp.trim() : pr(exp);
        isHash(exp) || /^function\s*\(/.test(res) ? res = "(" + res + ")" : undefined;
        !/:$|\}$|;$/.test(res.slice(-1)) ? res += ";" : undefined;
        buffer[i] = res;
      }
    }
    return buffer.join(" ").trim();
  }
  exports.render = render;

  function deParenthesise(str) {
    var _ref;
    if (typeof str === "string") {
      while (str.match(/^\({1}/) && str.match(/\){1}$/)) {
        (str = str.replace(/^\({1}/, "").replace(/\){1}$/, ""));
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
    if (typeof str === "string") {
      while (str.match(/^\({2}/) && str.match(/\){2}$/)) {
        (str = str.replace(/^\({2}/, "(").replace(/\){2}$/, ")"));
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
    !(typeof stripExt !== 'undefined' && stripExt !== null) ? stripExt = false : undefined;
    !(typeof useWinPathSep !== 'undefined' && useWinPathSep !== null) ? useWinPathSep = false : undefined;
    pathSep = useWinPathSep ? /\\|\// : /\//;
    parts = file.split(pathSep);
    file = parts.slice(-1)[0];
    if (!(stripExt && (file.indexOf(".") >= 0))) {
      return file;
    }
    parts = file.split(".");
    parts.pop();
    (parts.slice(-1)[0] === "jisp") && (parts.length > 1) ? parts.pop() : undefined;
    return parts.join(".");
  }
  exports.baseFileName = baseFileName;

  function repeat(str, n) {
    var res;
    res = "";
    while (n > 0) {
      n & 1 ? res += str : undefined;
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
    })();require['./toplevel'] = (function() {
      var exports = {}, module = {exports: exports};
      (function() {
  function concat() {
    var _res, lst, _i, _i0, _ref;
    lists = 1 <= arguments.length ? [].slice.call(arguments, 0, _i = arguments.length - 0) : (_i = 0, []);
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
    args = 1 <= arguments.length ? [].slice.call(arguments, 0, _i = arguments.length - 0) : (_i = 0, []);
    return [].concat(args);
  }
  exports.list = list;

  function range(start, end) {
    var a, _res, _ref;
    if (!(typeof end !== 'undefined' && end !== null)) {
      end = start;
      start = 0;
    }
    _res = [];
    while (true) {
      if (start <= end) {
        a = start;
        ++start;
        _ref = a;
      } else {
        _ref = undefined;
        break;
      }
      _res.push(_ref);
    }
    return _res;
  }
  return exports.range = range;
}).call(this);
      return module.exports;
    })();require['./util'] = (function() {
      var exports = {}, module = {exports: exports};
      (function() {
  var symbolWhitelist, keywords, specialValues;
  exports.symbolWhitelist = (symbolWhitelist = ["+", "-", "*", "/", "%", "++", "--", "?", "?!", "==", "===", "!=", "!==", "&&", "||", "!", "!!", ">", "<", ">=", "<=", "&", "|", "^", "<<", ">>", ">>>", "~", "=", "+=", "-=", "*=", "/=", "%=", "<<=", ">>=", ">>>=", "&=", "^=", "|="]);
  exports.keywords = (keywords = ["return", "break", "continue", "throw", "delete"]);

  function kwtest(str) {
    var kw, re, _i, _res, _ref;
    _res = [];
    _ref = keywords;
    for (_i = 0; _i < _ref.length; ++_i) {
      kw = _ref[_i];
      _res.push(("^" + kw + " "));
    }
    re = RegExp(_res.join("|"));
    return re.test(str);
  }
  exports.kwtest = kwtest;
  exports.specialValues = (specialValues = ["undefined", "null", "true", "false", "yes", "no", "Infinity", "NaN"]);

  function isSpecialValue(str) {
    return [].indexOf.call(specialValues, str, specialValues) >= 0;
  }
  exports.isSpecialValueStr = isSpecialValue;

  function isSpecialValue(form) {
    return (typeof form === "undefined") || (form === null) || ((typeof form === "number") && isNaN(form)) || (form === Infinity) || (typeof form === "boolean");
  }
  exports.isSpecialValue = isSpecialValue;

  function isAtom(form) {
    return (form === undefined || form === null) || /^\/[^\s\/]+\/[\w]*$/.test(form) || (typeof form === "number" || typeof form === "string" || typeof form === "boolean");
  }
  exports.isAtom = isAtom;

  function isAtomString(form) {
    return !isSpecialValue(form) && (isNum(form) || isRegex(form) || isIdentifier(form) || isString(form) || ([].indexOf.call(symbolWhitelist, form, symbolWhitelist) >= 0) || /^#[\d]+$/.test(form) || /^#$/.test(form));
  }
  exports.isAtomString = isAtomString;

  function isList(form) {
    return Array.isArray(form);
  }
  exports.isList = isList;

  function isHash(form) {
    return !isAtom(form) && !isList(form) && !(typeof form === "function");
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
    return isAtom(form) && (isString(form) || isIdentifier(form) || isNum(form));
  }
  exports.isKey = isKey;

  function isVarName(form) {
    return isAtom(form) && /^[$_A-Za-z]{1}$|^[$_A-Za-z]+[$_\w]*(?:[$_\w](?!\.))+$/.test(form);
  }
  exports.isVarName = isVarName;

  function isIdentifier(form) {
    return isAtom(form) && /^[$_A-Za-z]{1}[$_\w]*((\.[$_A-Za-z]{1}[$_\w]*)|(\[[$_.\w\[\]]+\])|(\['.*'\])|(\[".*"\]))*$/.test(form);
  }
  exports.isIdentifier = isIdentifier;

  function isString(form) {
    return isAtom(form) && /^".*"$|^'.*'$/.test(form);
  }
  exports.isString = isString;

  function isRegex(form) {
    return isAtom(form) && /^\/[^\s]+\/[\w]*[^\s)]*/.test(form);
  }
  exports.isRegex = isRegex;

  function isNum(form) {
    return isAtom(form) && (typeof typify(form) === "number");
  }
  exports.isNum = isNum;

  function isPrimitive(form) {
    return isRegex(form) || isNum(form) || (form === undefined || form === null || form === true || form === false);
  }
  exports.isPrimitive = isPrimitive;

  function isArgHash(form) {
    return isAtom(form) && /^#[\d]+$/.test(form);
  }
  exports.isArgHash = isArgHash;

  function isArgsHash(form) {
    return isAtom(form) && /^#$/.test(form);
  }
  exports.isArgsHash = isArgsHash;

  function isArgHashNotation(form) {
    return isArgHash(form) || isArgsHash(form);
  }
  exports.isArgHashNotation = isArgHashNotation;

  function isDotName(form) {
    return isAtom(form) && /^\.[$_A-Za-z]{1}$|^\.[$_A-Za-z]+[$_.\w]*(?:[$_\w](?!\.))+$/.test(form);
  }
  exports.isDotName = isDotName;

  function isBracketName(form) {
    return isAtom(form) && /^\[[$_A-Za-z]{1}\]$|^\[[$_A-Za-z]+[$_.\w]*(?:[$_\w](?!\.))+\]$/.test(form);
  }
  exports.isBracketName = isBracketName;

  function isBracketString(form) {
    return isAtom(form) && /^\[".*"\]$|^\['.*'\]$/.test(form);
  }
  exports.isBracketString = isBracketString;

  function isPropSyntax(form) {
    return isAtom(form) && (isDotName(form) || isBracketName(form) || isBracketString(form));
  }
  exports.isPropSyntax = isPropSyntax;

  function typify(form) {
    var _ref;
    if (!isAtom(form)) {
      _ref = undefined;
      throw Error("expecting atom, got " + pr(form));
    } else if (isBlankObject(form)) {
      _ref = form;
    } else if ((typeof form === "undefined")) {
      _ref = undefined;
    } else if ((form === "null")) {
      _ref = null;
    } else if ((form === "true" || form === "yes")) {
      _ref = true;
    } else if ((form === "false" || form === "no")) {
      _ref = false;
    } else if (!isNaN(Number(form))) {
      _ref = Number(form);
    } else if (isRegex(form)) {
      _ref = form;
    } else if ((typeof form === "string")) {
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
    !(typeof min !== 'undefined' && min !== null) ? min = 0 : undefined;
    !(typeof max !== 'undefined' && max !== null) ? max = Infinity : undefined;
    if (!isList(form)) {
      _ref = undefined;
      throw Error("expecting list, got " + form);
    } else if (!(form.length >= min) && (form.length <= max)) {
      _ref = undefined;
      throw Error("expecting between " + min + " and " + max + " arguments, got " + form.length + ": " + pr(form));
    } else if ((typeof first !== 'undefined' && first !== null && form[0] !== first)) {
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
    !(typeof expect !== 'undefined' && expect !== null) ? expect = "valid expression" : undefined;
    if (test(exp)) {
      _ref = true;
    } else {
      _ref = undefined;
      throw Error("expecting " + pr(expect) + ", got " + pr(exp));
    }
    return _ref;
  }
  exports.assertExp = assertExp;

  function pr(item) {
    var res, key, val, _ref, _ref0, _i, _ref10;
    if (isAtom(item)) {
      _ref = ("" + item).replace(/;$/, "");
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
      _ref10 = item;
      for (_i = 0; _i < _ref10.length; ++_i) {
        val = _ref10[_i];
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
      if ((isList(exp) && (exp.length === 0)) || (typeof exp === "undefined") || (exp === "")) {
        buffer[i] = undefined;
      } else {
        res = typeof exp === "string" ? exp.trim() : pr(exp);
        isHash(exp) || /^function\s*\(/.test(res) ? res = "(" + res + ")" : undefined;
        !/:$|\}$|;$/.test(res.slice(-1)) ? res += ";" : undefined;
        buffer[i] = res;
      }
    }
    return buffer.join(" ").trim();
  }
  exports.render = render;

  function deParenthesise(str) {
    var _ref;
    if (typeof str === "string") {
      while (str.match(/^\({1}/) && str.match(/\){1}$/)) {
        (str = str.replace(/^\({1}/, "").replace(/\){1}$/, ""));
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
    if (typeof str === "string") {
      while (str.match(/^\({2}/) && str.match(/\){2}$/)) {
        (str = str.replace(/^\({2}/, "(").replace(/\){2}$/, ")"));
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
    !(typeof stripExt !== 'undefined' && stripExt !== null) ? stripExt = false : undefined;
    !(typeof useWinPathSep !== 'undefined' && useWinPathSep !== null) ? useWinPathSep = false : undefined;
    pathSep = useWinPathSep ? /\\|\// : /\//;
    parts = file.split(pathSep);
    file = parts.slice(-1)[0];
    if (!(stripExt && (file.indexOf(".") >= 0))) {
      return file;
    }
    parts = file.split(".");
    parts.pop();
    (parts.slice(-1)[0] === "jisp") && (parts.length > 1) ? parts.pop() : undefined;
    return parts.join(".");
  }
  exports.baseFileName = baseFileName;

  function repeat(str, n) {
    var res;
    res = "";
    while (n > 0) {
      n & 1 ? res += str : undefined;
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
    })();require['./operators'] = (function() {
      var exports = {}, module = {exports: exports};
      (function() {
  var util, pr, spr, render, isIdentifier, assertForm, operators, singops, op, ops, stateops, opFuncs, _i, _ref, _i0, _ref0, _i10, _ref10;
  util = require("./util");
  pr = util.pr;
  spr = util.spr;
  render = util.render;
  isIdentifier = util.isIdentifier;
  assertForm = util.assertForm;

  function makeop(op, zv, min, max, drop) {
    !(typeof min !== 'undefined' && min !== null) ? min = 0 : undefined;
    !(typeof max !== 'undefined' && max !== null) ? max = Infinity : undefined;
    !(typeof drop !== 'undefined' && drop !== null) ? drop = false : undefined;
    return (function(args, isOuter) {
      var i, arg, res, _ref, _ref0, _ref10;
      if (assertForm(args, min, max)) {
        if (args.length === 0) {
          _ref0 = pr(zv);
        } else if ((args.length === 1 && typeof zv !== 'undefined' && zv !== null)) {
          res = zv + op + spr(args);
          !isOuter ? res = "(" + res + ")" : undefined;
          _ref0 = res;
        } else if ((args.length === 1 && drop)) {
          _ref0 = spr(args);
        } else if ((args.length === 1)) {
          _ref0 = (op + spr(args));
        } else {
          _ref = args;
          for (i = 0; i < _ref.length; ++i) {
            arg = _ref[i];
            args[i] = pr(arg);
          }
          res = args.join(" " + op + " ");
          !isOuter ? res = "(" + res + ")" : undefined;
          _ref0 = res;
        }
        _ref10 = _ref0;
      } else {
        _ref10 = undefined;
      }
      return _ref10;
    });
  }
  makeop;

  function makesing(op) {
    return (function(args, isOuter) {
      return assertForm(args, 1, 1) ? (op + " " + spr(args)) : undefined;
    });
  }
  makesing;

  function reserved(word) {
    throw Error("keyword " + word + " is reserved");
  }
  reserved;

  function makestate(op, min, max) {
    !(typeof min !== 'undefined' && min !== null) ? min = 0 : undefined;
    !(typeof max !== 'undefined' && max !== null) ? max = Infinity : undefined;
    return (function(args, isOuter) {
      return assertForm(args, min, max) ? (op + " " + spr(args)) : "undefined";
    });
  }
  makestate;
  operators = {
    "++": (function(args, isOuter) {
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
    "--": (function(args, isOuter) {
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
    "is": (function(args, isOuter) {
      var subj, arg, res, _i, _res, _ref, _ref0;
      if (args.length === 0) {
        _ref0 = true;
      } else if ((args.length === 1)) {
        _ref0 = ("!!" + spr(args));
      } else {
        subj = args.shift();
        _res = [];
        _ref = args;
        for (_i = 0; _i < _ref.length; ++_i) {
          arg = _ref[_i];
          _res.push((pr(subj) + " === " + pr(arg)));
        }
        res = _res.join(" || ");
        !isOuter ? res = "(" + res + ")" : undefined;
        _ref0 = res;
      }
      return _ref0;
    }),
    "isnt": (function(args, isOuter) {
      var subj, arg, res, _i, _res, _ref, _ref0;
      if (args.length === 0) {
        _ref0 = false;
      } else if ((args.length === 1)) {
        _ref0 = ("!" + spr(args));
      } else {
        subj = args.shift();
        _res = [];
        _ref = args;
        for (_i = 0; _i < _ref.length; ++_i) {
          arg = _ref[_i];
          _res.push((pr(subj) + " !== " + pr(arg)));
        }
        res = _res.join(" && ");
        !isOuter ? res = "(" + res + ")" : undefined;
        _ref0 = res;
      }
      return _ref0;
    }),
    "or": makeop("||", false),
    "and": makeop("&&", true),
    "exists": (function(args, isOuter) {
      var res, _ref;
      if (assertForm(args, 1, 1)) {
        res = "typeof " + spr(args) + " !== 'undefined' && " + spr(args) + " !== null";
        !isOuter ? res = "(" + res + ")" : undefined;
        _ref = res;
      } else {
        _ref = undefined;
      }
      return _ref;
    }),
    "in": (function(args, isOuter) {
      var res, _ref;
      if (assertForm(args, 2, 2)) {
        res = "[].indexOf.call(" + pr(args[1]) + ", " + spr(args) + ") >= 0";
        !isOuter ? res = "(" + res + ")" : undefined;
        _ref = res;
      } else {
        _ref = undefined;
      }
      return _ref;
    }),
    "of": makeop("in", undefined, 2, 2),
    "new": (function(args, isOuter) {
      return assertForm(args, 1) ? ("new " + pr(args.shift()) + "(" + spr(args) + ")") : undefined;
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
  ];
  _ref0 = ops;
  for (_i0 = 0; _i0 < _ref0.length; ++_i0) {
    op = _ref0[_i0];
    typeof op[1] === "string" ? operators[op[0]] = operators[op[1]] : operators[op[0]] = makeop.apply(makeop, [].concat(op));
  }
  stateops = [
    ["return", 0, 1],
    ["break", 0, 1],
    ["continue", 0, 0],
    ["throw", 1, 1]
  ];
  _ref10 = stateops;
  for (_i10 = 0; _i10 < _ref10.length; ++_i10) {
    op = _ref10[_i10];
    operators[op[0]] = makestate(op[0]);
  }
  exports.operators = operators;
  opFuncs = {};

  function add() {
    var _i110;
    args = 1 <= arguments.length ? [].slice.call(arguments, 0, _i110 = arguments.length - 0) : (_i110 = 0, []);
    args.unshift(0);
    return args.length === 0 ? 0 : args.reduce((function() {
      return arguments[0] + arguments[1];
    }));
  }
  add;

  function sub() {
    var _i110;
    args = 1 <= arguments.length ? [].slice.call(arguments, 0, _i110 = arguments.length - 0) : (_i110 = 0, []);
    args.unshift(0);
    return args.length === 0 ? 0 : args.reduce((function() {
      return arguments[0] - arguments[1];
    }));
  }
  sub;

  function mul() {
    var _i110;
    args = 1 <= arguments.length ? [].slice.call(arguments, 0, _i110 = arguments.length - 0) : (_i110 = 0, []);
    args.unshift(1);
    return args.length === 0 ? 1 : args.reduce((function() {
      return arguments[0] * arguments[1];
    }));
  }
  mul;

  function div() {
    var _i110;
    args = 1 <= arguments.length ? [].slice.call(arguments, 0, _i110 = arguments.length - 0) : (_i110 = 0, []);
    args.unshift(1);
    return args.length === 0 ? 1 : args.reduce((function() {
      return arguments[0] / arguments[1];
    }));
  }
  div;
  return exports.opFuncs = opFuncs;
}).call(this);
      return module.exports;
    })();require['./tokenise'] = (function() {
      var exports = {}, module = {exports: exports};
      (function() {
  var tokens, recode, recomment, redstring, resstring, rereg;
  module.exports = tokenise;
  tokens = [];
  recode = /^[^]*?(?=;.*[\n\r]?|""|"[^]*?(?:[^\\]")|''|'[^]*?(?:[^\\]')|\/[^\s]+\/[\w]*)/;
  recomment = /^;.*[\n\r]?/;
  redstring = /^""|^"[^]*?(?:[^\\]")[^\s):\]\}]*/;
  resstring = /^''|^'[^]*?(?:[^\\]')[^\s):\]\}]*/;
  rereg = /^\/[^\s]+\/[\w]*[^\s)]*/;

  function grate(str) {
    return str.replace(/;.*$/gm, "").replace(/\{/g, "(fn (").replace(/\}/g, "))").replace(/\(/g, " ( ").replace(/\)/g, " ) ").replace(/\[$/g, " [ ").replace(/\['/g, " [ '").replace(/\["/g, ' [ "').replace(/'\]/g, "' ] ").replace(/"\]/g, '" ] ').replace(/\[[\s]*\(/g, " [ ( ").replace(/\)[\s]*\]/g, " ) ] ").replace(/:/g, " : ").replace(/`/g, " ` ").replace(/,/g, " , ").replace(/\.\.\./g, " ... ").replace(/…/g, " … ").trim().split(/\s+/);
  }
  grate;

  function concatNewLines(str) {
    return str.replace(/\n|\n\r/g, "\\n");
  }
  concatNewLines;

  function match(str, re) {
    var mask;
    return (mask = str.match(re)) && (mask[0].length > 0) ? mask[0] : null;
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
      return (typeof x !== 'undefined' && x !== null) && (x !== "" && x !== undefined && x !== null);
    }));
  }
  return tokenise;
}).call(this);
      return module.exports;
    })();require['./lex'] = (function() {
      var exports = {}, module = {exports: exports};
      (function() {
  var util, pr, isList, isAtom, isAtomString, isNum, isRegex, isIdentifier, isString, isKey, isDotName, isBracketName, isBracketString, isPropSyntax;
  util = require("./util");
  pr = util.pr;
  isList = util.isList;
  isAtom = util.isAtom;
  isAtomString = util.isAtomString;
  isNum = util.isNum;
  isRegex = util.isRegex;
  isIdentifier = util.isIdentifier;
  isString = util.isString;
  isKey = util.isKey;
  isDotName = util.isDotName;
  isBracketName = util.isBracketName;
  isBracketString = util.isBracketString;
  isPropSyntax = util.isPropSyntax;
  module.exports = lex;

  function maketest(condition) {
    var _ref;
    if (typeof condition === "function") {
      _ref = (function(tokens) {
        return condition(tokens[0]);
      });
    } else if (isRegex(condition)) {
      _ref = (function(tokens) {
        return condition.test(tokens[0]);
      });
    } else if (isAtom(condition)) {
      _ref = (function(tokens) {
        return tokens[0] === condition;
      });
    } else if (isList(condition)) {
      _ref = (function(tokens) {
        var i, cond, _res, _ref0, _ref10;
        _res = [];
        _ref0 = condition;
        for (i = 0; i < _ref0.length; ++i) {
          cond = _ref0[i];
          if (!maketest(cond)(tokens.slice(i))) {
            return _ref10 = false;
          } else {
            _ref10 = undefined;
          }
          _res.push(_ref10);
        }
        return _res ? true : undefined;
      });
    } else {
      _ref = undefined;
      throw Error("can't test against " + pr(condition));
    }
    return _ref;
  }
  maketest;

  function demand(tokens) {
    var conditions, modes, condition, mode, test, _i;
    args = 2 <= arguments.length ? [].slice.call(arguments, 1, _i = arguments.length - 0) : (_i = 1, []);
    conditions = [];
    modes = [];
    while (args.length > 0) {
      condition = args.shift();
      mode = args.shift();
      conditions.push(condition);
      modes.push(mode);
      test = maketest(condition);
      if (test(tokens)) {
        return lex(tokens, mode);
      }
    }
    throw Error("unexpected " + pr(tokens[0]) + " in possible modes: " + modes.join(" | ") + "\nTested against: " + conditions.join("   ") + "\nTokens: " + pr(tokens.slice(0, 10)) + " ...");
  }
  demand;

  function expect(tokens) {
    var condition, mode, test, _i, _ref;
    args = 2 <= arguments.length ? [].slice.call(arguments, 1, _i = arguments.length - 0) : (_i = 1, []);
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
    args = 2 <= arguments.length ? [].slice.call(arguments, 1, _i = arguments.length - 0) : (_i = 1, []);
    _res = [];
    _ref = args;
    for (_i0 = 0; _i0 < _ref.length; ++_i0) {
      condition = _ref[_i0];
      if (maketest(condition)(tokens)) {
        _ref0 = undefined;
        throw Error("unexpected " + pr(tokens[0]));
      } else {
        _ref0 = undefined;
      }
      _res.push(_ref0);
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
    var lexed, prop, key, _ref, _res, _ref0;
    !(typeof mode !== 'undefined' && mode !== null) ? mode = "default" : undefined;
    switch (mode) {
      case "default":
        _res = [];
        while (tokens.length > 0) {
          _res.push(demand(tokens, ["(", ":", ")"], "emptyhash", ["(", isKey, ":"], "hash", "(", "list", "`", "quote", ",", "unquote", "...", "spread", "…", "spread", isAtomString, "atom", undefined, "drop"));
        }
        _ref = _res;
        break;
      case "list":
        demand(tokens, "(", "drop");
        lexed = [];
        (prop = expect(tokens, "[", "property", isPropSyntax, "property")) ? lexed.push(["get", prop]) : undefined;
        while (tokens[0] !== ")") {
          lexed.push(demand(tokens, ["(", ":", ")"], "emptyhash", ["(", isKey, ":"], "hash", "(", "list", "`", "quote", ",", "unquote", "...", "spread", "…", "spread", isAtomString, "atom"));
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
          prop = demand(tokens, ["(", ":", ")"], "emptyhash", ["(", isKey, ":"], "hash", "(", "list", "`", "quote", ",", "unquote", isAtomString, "atom");
          lexed[key] = prop;
        }
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
          prop = demand(tokens, "(", "list", ",", "quote", isIdentifier, "atom", isNum, "atom", isString, "atom");
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
        key = demand(tokens, isKey, "drop");
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
        _ref = undefined;
        throw Error("unspecified lex mode: " + mode);
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
  util = require("./util");

  function parse(form) {
    var i, val, key, _ref, _ref0, _ref10;
    if (util.isList(form)) {
      _ref = form;
      for (i = 0; i < _ref.length; ++i) {
        val = _ref[i];
        form[i] = parse(val);
      }
      _ref0 = form;
    } else if (util.isHash(form)) {
      _ref10 = form;
      for (key in _ref10) {
        val = _ref10[key];
        form[key] = parse(val);
      }
      _ref0 = form;
    } else {
      form = util.typify(form);
      _ref0 = /^#[\d]+$/.test(form) ? ("arguments[" + form.slice(1) + "]") : form;
    }
    return _ref0;
  }
  return module.exports = parse;
}).call(this);
      return module.exports;
    })();require['./macros'] = (function() {
      var exports = {}, module = {exports: exports};
      (function() {
  var macCar = function(x) {
    var _i;
    other = 2 <= arguments.length ? [].slice.call(arguments, 1, _i = arguments.length - 0) : (_i = 1, []);
    if (!(typeof x !== 'undefined' && x !== null) || (other.length > 0)) {
      throw Error("expecting one argument, got: " + pr(x) + ", " + spr(other));
    }
    return ["get", x, 0];
  };
  var macCdr = function(x) {
    var _i;
    other = 2 <= arguments.length ? [].slice.call(arguments, 1, _i = arguments.length - 0) : (_i = 1, []);
    if (!(typeof x !== 'undefined' && x !== null) || (other.length > 0)) {
      throw Error("expecting one argument, got: " + pr(x) + ", " + spr(other));
    }
    return [
      ["get", x, "slice"], 1
    ];
  };
  var macInit = function(x) {
    var _i;
    other = 2 <= arguments.length ? [].slice.call(arguments, 1, _i = arguments.length - 0) : (_i = 1, []);
    if (!(typeof x !== 'undefined' && x !== null) || (other.length > 0)) {
      throw Error("expecting one argument, got: " + pr(x) + ", " + spr(other));
    }
    return [
      ["get", x, "slice"], 0, -1
    ];
  };
  var macLast = function(x) {
    var _i;
    other = 2 <= arguments.length ? [].slice.call(arguments, 1, _i = arguments.length - 0) : (_i = 1, []);
    if (!(typeof x !== 'undefined' && x !== null) || (other.length > 0)) {
      throw Error("expecting one argument, got: " + pr(x) + ", " + spr(other));
    }
    return ["get", [
      ["get", x, "slice"], -1
    ], 0];
  };
  var macLet = function() {
    var body, names, callArgs, _i;
    args = 2 <= arguments.length ? [].slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []);
    body = arguments[_i++];
    util.assertExp(args, (function(x) {
      return (x.length % 2) === 0;
    }), "an even number of arguments");
    !(typeof body !== 'undefined' && body !== null) ? body = [] : undefined;
    names = [];
    callArgs = [];
    while (args.length > 0) {
      names.push(checkVar(args.shift()));
      callArgs.push(args.shift());
    }
    return [].concat([
      [].concat(["fn"]).concat(names).concat([body])
    ]).concat(callArgs);
  };
  var macNotExist = function(x) {
    var _i;
    other = 2 <= arguments.length ? [].slice.call(arguments, 1, _i = arguments.length - 0) : (_i = 1, []);
    if (!(typeof x !== 'undefined' && x !== null) || (other.length > 0)) {
      throw Error("expecting one argument, got: " + pr(x) + ", " + spr(other));
    }
    return ["not", ["?", x]];
  };
  var macIsA = function(obj) {
    var _i;
    types = 2 <= arguments.length ? [].slice.call(arguments, 1, _i = arguments.length - 0) : (_i = 1, []);
    return [].concat(["is", ["typeof", obj]]).concat(types);
  };
  var macAny = function() {
    var value, _i, _i0, _res, _ref;
    values = 1 <= arguments.length ? [].slice.call(arguments, 0, _i = arguments.length - 0) : (_i = 0, []);
    _res = [];
    _ref = values;
    for (_i0 = 0; _i0 < _ref.length; ++_i0) {
      value = _ref[_i0];
      _res.push(["and", ["?", value], value]);
    }
    return [].concat(["or"]).concat(_res);
  };
  var util, pr, spr;
  util = require("./util");
  pr = util.pr;
  spr = util.spr;

  function checkVar(exp) {
    return util.assertExp(exp, util.isVarName, "valid identifier") ? exp : undefined;
  }
  checkVar;
  exports.car = macCar;
  exports.head = macCar;
  exports.cdr = macCdr;
  exports.tail = macCdr;
  exports.init = macInit;
  exports.last = macLast;
  exports.let = macLet;
  exports["?!"] = macNotExist;
  exports.isa = macIsA;
  return exports.any = macAny;
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
    var a, _res, _ref;
    if (!(typeof end !== 'undefined' && end !== null)) {
      end = start;
      start = 0;
    }
    _res = [];
    while (true) {
      if (start <= end) {
        a = start;
        ++start;
        _ref = a;
      } else {
        _ref = undefined;
        break;
      }
      _res.push(_ref);
    }
    return _res;
  }
  var vm, fs, path, beautify, toplevel, util, ops, operators, opFuncs, tokenise, lex, parse, pr, spr, render, isAtom, isHash, isList, isVarName, isIdentifier, assertExp, toplevelRedeclare, toplevelRedefine, specials, macros;
  exports.version = "0.2.3";
  vm = require("vm");
  fs = require("fs");
  path = require("path");
  beautify = require("js-beautify");
  toplevel = require("./toplevel");
  util = require("./util");
  ops = require("./operators");
  operators = ops.operators;
  opFuncs = ops.opFuncs;
  tokenise = require("./tokenise");
  lex = require("./lex");
  parse = require("./parse");
  pr = util.pr;
  spr = util.spr;
  render = util.render;
  isAtom = util.isAtom;
  isHash = util.isHash;
  isList = util.isList;
  isVarName = util.isVarName;
  isIdentifier = util.isIdentifier;
  assertExp = util.assertExp;
  toplevelRedeclare = [];
  toplevelRedefine = [];

  function plusname(name) {
    return isNaN(Number(name.slice(-1)[0])) ? (name + 0) : (name.slice(0, -1) + 1 + Number(name.slice(-1)[0]));
  }
  plusname;

  function declareVar(name, scope) {
    var _ref;
    if ([].indexOf.call(scope.hoist, name, scope.hoist) >= 0) {
      _ref = scope;
    } else {
      scope.hoist.push(name);
      _ref = scope;
    }
    return _ref;
  }
  declareVar;

  function declareService(name, scope) {
    while (([].indexOf.call(scope.hoist, name, scope.hoist) >= 0) || ([].indexOf.call(scope.service, name, scope.service) >= 0)) {
      name = plusname(name);
    }
    scope.service.push(name);
    return [name, scope];
  }
  declareService;

  function hasSpread(form) {
    return isList(form) && (form[0] === "spread");
  }
  hasSpread;

  function compileResolve(form, buffer, scope, opts, nested) {
    var compiled, i, name, newname, re, subst, str, _ref, _i, _ref0, _ref10;
    _ref = compileForm(form, scope, opts, nested);
    compiled = _ref[0];
    scope = _ref[1];
    _ref0 = scope.service;
    for (i in _ref0) {
      name = _ref0[i];
      if ([].indexOf.call(scope.hoist, name, scope.hoist) >= 0) {
        newname = name;
        while ([].indexOf.call(scope.hoist, newname, scope.hoist) >= 0) {
          newname = plusname(newname);
        }
        scope.service[i] = newname;
        re = RegExp("(?=(?:[^$_A-Za-z0-9]{1}|^)" + name + "(?:[^$_A-Za-z0-9]{1}|$))([^$A-Za-z0-9]|^)" + name, "g");
        subst = "$1" + newname;
        _ref10 = buffer;
        for (i = 0; i < _ref10.length; ++i) {
          str = _ref10[i];
          (typeof str !== 'undefined' && str !== null) && (typeof str === "string") ? buffer[i] = str.replace(re, subst) : undefined;
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

  function splitName(name) {
    var obj, method, _ref;
    if ((obj = name.match(/^[$_A-Za-z]{1}$|^[$_A-Za-z]+[$_\w]*([$_\w](?!\.))+$|^([$_.\[\]\w])+(?=\.|(\[.*(?=\[+).*\]))+|^(?:[$_.\[\]\w])+(?=\.|\[)+/))) {
      obj = obj[0];
      method = name.replace(obj, "");
      _ref = [obj, method];
    } else {
      _ref = [name, ""];
    }
    return _ref;
  }
  splitName;

  function returnify(form) {
    var _ref;
    if (isAtom(form) || isHash(form)) {
      _ref = ["return", form];
    } else if ((isList(form) && form[0] !== "return")) {
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
      if (isAtom(arg) && isVarName(arg)) {
        arr.push(arg);
      } else if (isList(arg) && isVarName(arg[0]) && !(arg[0] === "spread")) {
        arr.push(arg[0]);
      }
    }
    return arr;
  }
  getArgNames;

  function notRedefined(name) {
    return !([].indexOf.call(toplevelRedeclare, name, toplevelRedeclare) >= 0) && !([].indexOf.call(toplevelRedefine, name, toplevelRedefine) >= 0);
  }
  notRedefined;

  function isPropertyExp(form) {
    return isList(form) && ((isList(form[0]) && (form[0].length === 2) && (form[0][0] === "get")) || util.isPropSyntax(form[0]));
  }
  isPropertyExp;

  function compileForm(form, scope, opts, nested) {
    var buffer, isNested, first, isOuterOperator, i, arg, argsSpread, name, method, collector, key, val, _ref, _i, _ref0, _i0, _ref10, _ref110, _i10, _ref1110, _i110, _ref11110, _i1110, _ref111110, _i11110, _ref1111110, _i111110, _ref11111110, _i1111110, _ref111111110, _ref1111111110, _ref11111111110, _i11111110;
    !(typeof opts !== 'undefined' && opts !== null) ? opts = {} : undefined;
    if (isList(form) && util.isBlankObject(form)) {
      _ref111111110 = [
        [""], scope
      ];
    } else if (isAtom(form)) {
      if ((([].indexOf.call(Object.keys(toplevel), form, Object.keys(toplevel)) >= 0) && notRedefined(form)) || ([].indexOf.call(Object.keys(macros), form, Object.keys(macros)) >= 0)) {
        assertExp(form, isVarName, "valid identifier");
        scope = declareVar(form, scope);
      } else if ([].indexOf.call(Object.keys(opFuncs), form, Object.keys(opFuncs)) >= 0) {
        assertExp(form, isVarName, "valid identifier");
        scope = declareVar(form, scope);
        form = opFuncs[form].name;
      }
      _ref111111110 = [
        [form], scope
      ];
    } else if (isHash(form)) {
      buffer = [];
      nested = undefined;
      _ref1111111110 = form;
      for (key in _ref1111111110) {
        val = _ref1111111110[key];
        _ref11111111110 = compileGetLast(val, buffer, scope, opts, nested);
        form[key] = _ref11111111110[0];
        buffer = _ref11111111110[1];
        scope = _ref11111111110[2];
      }
      buffer.push(form);
      _ref111111110 = [buffer, scope];
    } else {
      if (!isList(form)) {
        throw Error("expecting list, got: " + pr(form));
      }
      buffer = [];
      form = form.slice();
      if ([].indexOf.call(Object.keys(specials), form[0], Object.keys(specials)) >= 0) {
        _ref = specials[form[0]](form, scope, opts, nested);
        buffer = _ref[0];
        scope = _ref[1];
      } else if ([].indexOf.call(Object.keys(macros), form[0], Object.keys(macros)) >= 0) {
        _ref11111110 = compileAdd(expandMacros(form), buffer, scope, opts, nested);
        buffer = _ref11111110[0];
        scope = _ref11111110[1];
      } else {
        isNested = nested;
        nested = undefined;
        _ref0 = compileGetLast(form.shift(), buffer, scope, opts, nested);
        first = _ref0[0];
        buffer = _ref0[1];
        scope = _ref0[2];
        if (([].indexOf.call(Object.keys(toplevel), first, Object.keys(toplevel)) >= 0) && notRedefined(first)) {
          assertExp(first, isVarName, "valid identifier");
          scope = declareVar(first, scope);
        }
        if ([].indexOf.call(Object.keys(operators), first, Object.keys(operators)) >= 0) {
          if (!opts.compilingOperator && !isNested) {
            isOuterOperator = true;
            opts.compilingOperator = true;
          } else {
            isOuterOperator = false;
          }
        } else {
          opts = JSON.parse(JSON.stringify(opts));
          delete opts.compilingOperator;
        }
        _ref10 = form;
        for (i = 0; i < _ref10.length; ++i) {
          arg = _ref10[i];
          if (hasSpread(arg)) {
            argsSpread = true;
            _ref110 = compileGetLast(arg, buffer, scope, opts, nested);
            arg = _ref110[0];
            buffer = _ref110[1];
            scope = _ref110[2];
            form[i] = ["spread", arg];
          } else {
            _ref1110 = compileGetLast(arg, buffer, scope, opts, nested);
            arg = _ref1110[0];
            buffer = _ref1110[1];
            scope = _ref1110[2];
            form[i] = arg;
          }
        }
        if (!(typeof argsSpread !== 'undefined' && argsSpread !== null)) {
          [].indexOf.call(Object.keys(operators), first, Object.keys(operators)) >= 0 ? buffer.push(operators[first](form, isOuterOperator)) : buffer.push(pr(first) + "(" + spr(form) + ")");
        } else {
          form = ["quote", form];
          _ref11110 = compileGetLast(form, buffer, scope, opts, nested);
          form = _ref11110[0];
          buffer = _ref11110[1];
          scope = _ref11110[2];
          if ([].indexOf.call(Object.keys(operators), first, Object.keys(operators)) >= 0) {
            if (([].indexOf.call(Object.keys(opFuncs), first, Object.keys(opFuncs)) >= 0) && spr(opFuncs[first])) {
              assertExp(first, isVarName, "valid identifier");
              scope = declareVar(first, scope);
              first = opFuncs[first].name;
            } else {
              throw Error(pr(first) + " can't spread arguments (yet)");
            }
          }
          _ref111110 = splitName(first);
          name = _ref111110[0];
          method = _ref111110[1];
          if (isIdentifier(name)) {
            buffer.push(name + method + ".apply(" + name + ", " + pr(form) + ")");
          } else {
            _ref1111110 = declareService("_ref", scope);
            collector = _ref1111110[0];
            scope = _ref1111110[1];
            buffer.push("(" + collector + " = " + name + ")" + method + ".apply(" + collector + ", " + pr(form) + ")");
          }
        }
      } if (isOuterOperator) {
        delete opts.compilingOperator;
      }
      _ref111111110 = [buffer, scope];
    }
    return _ref111111110;
  }
  compileForm;
  specials = {};
  specials.do = (function(form, scope, opts, nested) {
    var buffer, formName, isNested, isTopLevel, outerScope, i, exp, ref, vars, funcs, dec, args, name, func, _ref, _ref0, _i, _ref10, _i0, _i10, _ref110, _i110, _ref1110, _i1110, _ref11110;
    !(typeof opts !== 'undefined' && opts !== null) ? opts = {} : undefined;
    buffer = [];
    form = form.slice();
    formName = form.shift();
    if (typeof nested !== 'undefined' && nested !== null) {
      isNested = nested;
      nested = undefined;
    } else {
      isNested = true;
    } if (opts.isTopLevel) {
      isTopLevel = true;
      delete opts.isTopLevel;
    }
    if (isTopLevel) {
      outerScope = scope;
      scope = {
        hoist: outerScope.hoist.slice(),
        service: outerScope.service.slice()
      };
    }
    _ref = form;
    for (i = 0; i < _ref.length; ++i) {
      exp = _ref[i];
      nested = (!isTopLevel && (i === (form.length - 1)) && isNested) || isPropertyExp(form[i + 1]);
      if (!(typeof exp !== 'undefined' && exp !== null)) {
        buffer.push(exp);
      } else {
        if (isPropertyExp(exp)) {
          ref = buffer.pop();
          !(typeof ref !== 'undefined' && ref !== null) ? ref = "" : undefined;
          _ref0 = compileAdd(exp, buffer, scope, opts, nested);
          buffer = _ref0[0];
          scope = _ref0[1];
          buffer.push(ref + buffer.pop());
        } else {
          _ref10 = compileAdd(exp, buffer, scope, opts, nested);
          buffer = _ref10[0];
          scope = _ref10[1];
        }
      }
    }
    if (isTopLevel) {
      vars = [];
      funcs = [];
      dec = "var ";
      !(typeof args !== 'undefined' && args !== null) ? args = [] : undefined;
      _ref110 = scope.hoist;
      for (_i10 = 0; _i10 < _ref110.length; ++_i10) {
        name = _ref110[_i10];
        if (!([].indexOf.call(outerScope.hoist, name, outerScope.hoist) >= 0) && !([].indexOf.call(args, name, args) >= 0)) {
          if ([].indexOf.call(Object.keys(toplevel), name, Object.keys(toplevel)) >= 0) {
            opts.topScope && ([].indexOf.call(toplevelRedeclare, name, toplevelRedeclare) >= 0) ? vars.push(name) : notRedefined(name) ? funcs.push(name) : undefined;
          } else if (([].indexOf.call(Object.keys(opFuncs), name, Object.keys(opFuncs)) >= 0) || ([].indexOf.call(Object.keys(macros), name, Object.keys(macros)) >= 0)) {
            funcs.push(name);
          } else {
            vars.push(name);
          }
        }
      }
      _ref1110 = scope.service;
      for (_i110 = 0; _i110 < _ref1110.length; ++_i110) {
        name = _ref1110[_i110];
        !([].indexOf.call(outerScope.service, name, outerScope.service) >= 0) ? vars.push(name) : undefined;
      }
      while (vars.length > 0) {
        name = vars.shift();
        if ([].indexOf.call(vars, name, vars) >= 0) {
          throw Error("compiler error: duplicate var in declarations:" + name);
        }
        dec += (name + ", ");
      }
      if (dec.length > 4) {
        dec = dec.slice(0, dec.length - 2);
        buffer.unshift(dec);
      }
      if ((typeof isTopLevel !== 'undefined' && isTopLevel !== null) && isTopLevel) {
        while (funcs.length > 0) {
          func = funcs.pop();
          if ([].indexOf.call(funcs, func, funcs) >= 0) {
            throw Error("compiler error: duplicate func in declarations:" + func);
          }
          if ([].indexOf.call(Object.keys(toplevel), func, Object.keys(toplevel)) >= 0) {
            notRedefined(func) ? buffer.unshift(toplevel[func].toString()) : undefined;
          } else if ([].indexOf.call(Object.keys(macros), func, Object.keys(macros)) >= 0) {
            buffer.unshift("var " + func + " = " + macros[func] + ";");
          } else if ([].indexOf.call(Object.keys(opFuncs), func, Object.keys(opFuncs)) >= 0) {
            buffer.unshift("var " + opFuncs[func].name + " = " + opFuncs[func].func + ";");
          } else {
            throw Error("unrecognised func: " + pr(func));
          }
        }
      } else {
        _ref11110 = funcs;
        for (_i1110 = 0; _i1110 < _ref11110.length; ++_i1110) {
          func = _ref11110[_i1110];
          !([].indexOf.call(outerScope.hoist, func, outerScope.hoist) >= 0) ? outerScope.hoist.push(func) : undefined;
        }
      }
      scope = outerScope;
    }
    return Array(buffer, scope);
  });
  specials.quote = (function(form, scope, opts, nested) {
    var buffer, formName, isNested, arr, res, exp, i, item, key, newform, _i, _ref, _ref0, _i0, _ref10, _i10, _ref110, _i110, _ref1110, _i1110, _ref11110, _i11110, _ref111110, _ref1111110, _i111110, _ref11111110, _i1111110, _ref111111110, _ref1111111110, _i11111110, _ref11111111110, _ref111111111110, _i111111110;
    !(typeof opts !== 'undefined' && opts !== null) ? opts = {} : undefined;
    buffer = [];
    form = form.slice();
    formName = form.shift();
    if (form.length < 1) {
      throw Error(pr(formName) + " expects no less than " + pr(1) + " arguments");
    }
    if (form.length > 1) {
      throw Error(pr(formName) + " expects no more than " + pr(1) + " arguments");
    }
    if (typeof nested !== 'undefined' && nested !== null) {
      isNested = nested;
      nested = undefined;
    } else {
      isNested = true;
    }
    form = form[0];
    if (isAtom(form) && !util.isPrimitive(form) && !util.isSpecialValue(form)) {
      buffer.push(JSON.stringify(form));
    } else if (isAtom(form)) {
      buffer.push(form);
    } else if (isHash(form)) {
      if (!opts.macro) {
        _ref111111110 = form;
        for (key in _ref111111110) {
          exp = _ref111111110[key];
          _ref1111111110 = compileGetLast(exp, buffer, scope, opts, nested);
          form[key] = _ref1111111110[0];
          buffer = _ref1111111110[1];
          scope = _ref1111111110[2];
        }
        buffer.push(form);
      } else {
        newform = {};
        _ref11111111110 = form;
        for (key in _ref11111111110) {
          exp = _ref11111111110[key];
          key = JSON.stringify(key);
          _ref111111111110 = compileGetLast(["quote", exp], buffer, scope, opts, nested);
          newform[key] = _ref111111111110[0];
          buffer = _ref111111111110[1];
          scope = _ref111111111110[2];
        }
        buffer.push(newform);
      }
    } else {
      arr = [];
      res = "[]";
      _ref = form;
      for (_i = 0; _i < _ref.length; ++_i) {
        exp = _ref[_i];
        if (isList(exp) && (exp[0] === "quote") && isList(exp[1]) && (exp[1].length === 0)) {
          arr.push([]);
        } else if (isList(exp) && (exp[0] === "unquote") && isList(exp[1]) && (exp[1][0] === "spread")) {
          _ref110 = compileGetLast(exp.slice(1)[0], buffer, scope, opts, nested);
          exp = _ref110[0];
          buffer = _ref110[1];
          scope = _ref110[2];
          if (typeof exp !== 'undefined' && exp !== null) {
            if (arr.length > 0) {
              res += (".concat(" + pr(arr) + ")");
              arr = [];
            }
            res += (".concat(" + pr(exp) + ")");
          }
        } else if (isList(exp) && (exp[0] === "quote")) {
          _ref1110 = compileGetLast(exp, buffer, scope, opts, nested);
          exp = _ref1110[0];
          buffer = _ref1110[1];
          scope = _ref1110[2];
          typeof exp !== 'undefined' && exp !== null ? arr.push(exp) : undefined;
        } else if (isList(exp) && (exp[0] === "unquote")) {
          _ref11110 = compileGetLast(exp, buffer, scope, opts, nested);
          exp = _ref11110[0];
          buffer = _ref11110[1];
          scope = _ref11110[2];
          if ((typeof exp !== 'undefined' && exp !== null) && opts.macro) {
            if (isList(exp)) {
              _ref111110 = exp;
              for (i = 0; i < _ref111110.length; ++i) {
                item = _ref111110[i];
                if (isAtom(item)) {
                  _ref1111110 = compileGetLast(["quote", item], buffer, scope, opts, nested);
                  exp[i] = _ref1111110[0];
                  buffer = _ref1111110[1];
                  scope = _ref1111110[2];
                }
              }
            }
          }
          typeof exp !== 'undefined' && exp !== null ? arr.push(exp) : undefined;
        } else if (isList(exp) && (exp[0] === "spread") && !opts.macro) {
          _ref11111110 = compileGetLast(exp, buffer, scope, opts, nested);
          exp = _ref11111110[0];
          buffer = _ref11111110[1];
          scope = _ref11111110[2];
          if (typeof exp !== 'undefined' && exp !== null) {
            if (arr.length > 0) {
              res += (".concat(" + pr(arr) + ")");
              arr = [];
            }
            res += (".concat(" + pr(exp) + ")");
          }
        } else {
          if (isAtom(exp) && !opts.macro) {
            _ref0 = compileGetLast(exp, buffer, scope, opts, nested);
            exp = _ref0[0];
            buffer = _ref0[1];
            scope = _ref0[2];
          } else {
            _ref10 = compileGetLast(["quote", exp], buffer, scope, opts, nested);
            exp = _ref10[0];
            buffer = _ref10[1];
            scope = _ref10[2];
          }
          typeof exp !== 'undefined' && exp !== null ? arr.push(exp) : undefined;
        }
      }
      arr.length > 0 ? res === "[]" ? res = pr(arr) : res += (".concat(" + pr(arr) + ")") : undefined;
      buffer.push(res);
    }
    return Array(buffer, scope);
  });
  specials.unquote = (function(form, scope, opts, nested) {
    var buffer, formName, isNested, _ref, _i, _ref0, _i0;
    !(typeof opts !== 'undefined' && opts !== null) ? opts = {} : undefined;
    buffer = [];
    form = form.slice();
    formName = form.shift();
    if (form.length < 1) {
      throw Error(pr(formName) + " expects no less than " + pr(1) + " arguments");
    }
    if (form.length > 1) {
      throw Error(pr(formName) + " expects no more than " + pr(1) + " arguments");
    }
    if (typeof nested !== 'undefined' && nested !== null) {
      isNested = nested;
      nested = undefined;
    } else {
      isNested = true;
    }
    form = form[0];
    if (isList(form) && (form[0] === "quote")) {
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
    var buffer, formName, isNested, left, right, lastAssign, res, ref, ind, spreads, i, name, spreadname, spreadind, _ref, _i, _ref0, _i0, _ref10, _i10, _ref110, _i110, _ref1110, _i1110, _ref11110, _ref111110, _i11110;
    !(typeof opts !== 'undefined' && opts !== null) ? opts = {} : undefined;
    buffer = [];
    form = form.slice();
    formName = form.shift();
    if (form.length < 1) {
      throw Error(pr(formName) + " expects no less than " + pr(1) + " arguments");
    }
    if (typeof nested !== 'undefined' && nested !== null) {
      isNested = nested;
      nested = undefined;
    } else {
      isNested = true;
    } if (form.length === 1) {
      assertExp(form[0], isVarName, "valid identifier");
      opts.topScope && ([].indexOf.call(Object.keys(toplevel), form[0], Object.keys(toplevel)) >= 0) && !([].indexOf.call(scope.hoist, form[0], scope.hoist) >= 0) && notRedefined(form[0]) ? toplevelRedeclare.push(form[0]) : undefined;
      scope = declareVar(form[0], scope);
      _ref = compileAdd(form[0], buffer, scope, opts, nested);
      buffer = _ref[0];
      scope = _ref[1];
    } else {
      assertExp(form, (function() {
        return (arguments[0].length % 2) === 0;
      }), "an even number of arguments");
      while (form.length > 0) {
        left = form.shift();
        right = form.shift();
        lastAssign = form.length === 0 ? true : undefined;
        _ref0 = compileGetLast(right, buffer, scope, opts, nested);
        right = _ref0[0];
        buffer = _ref0[1];
        scope = _ref0[2];
        if (isList(left) && (left[0] === "get")) {
          _ref10 = compileGetLast(left, buffer, scope, opts, nested);
          left = _ref10[0];
          buffer = _ref10[1];
          scope = _ref10[2];
          res = pr(left) + " = " + pr(right);
          lastAssign && isNested ? res = "(" + res + ")" : undefined;
          buffer.push(res);
        } else if (isList(left)) {
          _ref110 = declareService("_ref", scope, opts.function ? args : undefined);
          ref = _ref110[0];
          scope = _ref110[1];
          _ref1110 = declareService("_i", scope, opts.function ? args : undefined);
          ind = _ref1110[0];
          scope = _ref1110[1];
          buffer.push(ref + " = " + pr(right));
          spreads = 0;
          _ref11110 = left;
          for (i = 0; i < _ref11110.length; ++i) {
            name = _ref11110[i];
            if (name[0] === "spread") {
              if (++spreads > 1) {
                throw Error("an assignment can only have one spread");
              }
              _ref111110 = compileGetLast(name, buffer, scope, opts, nested);
              name = _ref111110[0];
              buffer = _ref111110[1];
              scope = _ref111110[2];
              assertExp(name, isVarName, "valid identifier");
              opts.topScope && ([].indexOf.call(Object.keys(toplevel), name, Object.keys(toplevel)) >= 0) && !([].indexOf.call(scope.hoist, name, scope.hoist) >= 0) && notRedefined(name) ? toplevelRedeclare.push(name) : undefined;
              scope = declareVar(name, scope);
              spreadname = name;
              spreadind = i;
              buffer.push("var " + spreadname + " = " + left.length + " <= " + ref + ".length ? [].slice.call(" + ref + ", " + spreadind + ", " + ind + " = " + ref + ".length - " + (left.length - spreadind - 1) + ") : (" + ind + " = " + spreadind + ", [])");
            } else if (!(typeof spreadname !== 'undefined' && spreadname !== null)) {
              if (isVarName(name)) {
                assertExp(name, isVarName, "valid identifier");
                opts.topScope && ([].indexOf.call(Object.keys(toplevel), name, Object.keys(toplevel)) >= 0) && !([].indexOf.call(scope.hoist, name, scope.hoist) >= 0) && notRedefined(name) ? toplevelRedeclare.push(name) : undefined;
                scope = declareVar(name, scope);
              }
              buffer.push(pr(name) + " = " + ref + "[" + i + "]");
            } else {
              if (isVarName(name)) {
                assertExp(name, isVarName, "valid identifier");
                opts.topScope && ([].indexOf.call(Object.keys(toplevel), name, Object.keys(toplevel)) >= 0) && !([].indexOf.call(scope.hoist, name, scope.hoist) >= 0) && notRedefined(name) ? toplevelRedeclare.push(name) : undefined;
                scope = declareVar(name, scope);
              }
              buffer.push(pr(name) + " = " + ref + "[" + ind + "++]");
            }
          }
        } else {
          if (isVarName(left)) {
            assertExp(left, isVarName, "valid identifier");
            opts.topScope && ([].indexOf.call(Object.keys(toplevel), left, Object.keys(toplevel)) >= 0) && !([].indexOf.call(scope.hoist, left, scope.hoist) >= 0) && notRedefined(left) ? toplevelRedeclare.push(left) : undefined;
            scope = declareVar(left, scope);
          }
          assertExp(left, isIdentifier);
          res = pr(left) + " = " + pr(right);
          isHash(right) && !isNested ? res += ";" : undefined;
          lastAssign && isNested ? res = "(" + res + ")" : undefined;
          buffer.push(res);
        }
      }
    }
    return Array(buffer, scope);
  });
  specials.fn = (function(form, scope, opts, nested) {
    var buffer, formName, isNested, outerScope, args, body, optionals, spreads, i, arg, ind, name, restname, restind, rest, vars, funcs, dec, func, _ref, _i, _ref0, _ref10, _i0, _ref110, _i10, _ref1110, _i110, _i1110, _ref11110, _i11110, _ref111110, _i111110, _ref1111110;
    !(typeof opts !== 'undefined' && opts !== null) ? opts = {} : undefined;
    buffer = [];
    form = form.slice();
    formName = form.shift();
    if (typeof nested !== 'undefined' && nested !== null) {
      isNested = nested;
      nested = undefined;
    } else {
      isNested = true;
    }
    outerScope = scope;
    scope = {
      hoist: outerScope.hoist.slice(),
      service: outerScope.service.slice()
    };
    _ref = form;
    var args = 2 <= _ref.length ? [].slice.call(_ref, 0, _i = _ref.length - 1) : (_i = 0, []);
    body = _ref[_i++];
    scope.hoist.push.apply(scope.hoist, [].concat(getArgNames(args)));
    !(typeof body !== 'undefined' && body !== null) ? body = [] : undefined;
    optionals = [];
    spreads = 0;
    _ref0 = args;
    for (i = 0; i < _ref0.length; ++i) {
      arg = _ref0[i];
      if (isList(arg)) {
        assertExp(arg, (function() {
          return arguments[0].length === 2;
        }), "optional or rest parameter");
        if (arg[0] === "spread") {
          if (++spreads > 1) {
            throw Error("cannot define more than one rest parameter");
          }
          _ref10 = declareService("_i", scope, opts.function ? args : undefined);
          ind = _ref10[0];
          scope = _ref10[1];
          _ref110 = compileGetLast(arg, buffer, scope, opts, nested);
          name = _ref110[0];
          buffer = _ref110[1];
          scope = _ref110[2];
          assertExp(name, isVarName, "valid identifier");
          restname = name;
          restind = i;
          args[i] = restname;
          rest = list(name + " = " + args.length + " <= arguments.length ? [].slice.call(arguments, " + i + ", " + ind + " = arguments.length - " + (args.length - i - 1) + ") : (" + ind + " = " + restind + ", [])");
        } else {
          assertExp((name = arg[0]), isVarName, "valid parameter name");
          args[i] = name;
          optionals.push(["if", ["not", ["?", name]],
            ["=", name, arg[1]]
          ]);
        }
      } else if (restname) {
        rest.push(pr(arg) + " = arguments[" + ind + "++]");
      }
    }
    typeof restind !== 'undefined' && restind !== null ? args = args.slice(0, restind) : undefined;
    optionals.length > 0 ? body = [].concat(["do"]).concat(optionals).concat([body]) : undefined;
    body = returnify(body);
    _ref1110 = compileResolve(body, buffer, scope, opts, nested);
    body = _ref1110[0];
    buffer = _ref1110[1];
    scope = _ref1110[2];
    rest ? body.unshift.apply(body, [].concat(rest)) : undefined;
    vars = [];
    funcs = [];
    dec = "var ";
    !(typeof args !== 'undefined' && args !== null) ? args = [] : undefined;
    _ref11110 = scope.hoist;
    for (_i1110 = 0; _i1110 < _ref11110.length; ++_i1110) {
      name = _ref11110[_i1110];
      if (!([].indexOf.call(outerScope.hoist, name, outerScope.hoist) >= 0) && !([].indexOf.call(args, name, args) >= 0)) {
        if ([].indexOf.call(Object.keys(toplevel), name, Object.keys(toplevel)) >= 0) {
          opts.topScope && ([].indexOf.call(toplevelRedeclare, name, toplevelRedeclare) >= 0) ? vars.push(name) : notRedefined(name) ? funcs.push(name) : undefined;
        } else if (([].indexOf.call(Object.keys(opFuncs), name, Object.keys(opFuncs)) >= 0) || ([].indexOf.call(Object.keys(macros), name, Object.keys(macros)) >= 0)) {
          funcs.push(name);
        } else {
          vars.push(name);
        }
      }
    }
    _ref111110 = scope.service;
    for (_i11110 = 0; _i11110 < _ref111110.length; ++_i11110) {
      name = _ref111110[_i11110];
      !([].indexOf.call(outerScope.service, name, outerScope.service) >= 0) ? vars.push(name) : undefined;
    }
    while (vars.length > 0) {
      name = vars.shift();
      if ([].indexOf.call(vars, name, vars) >= 0) {
        throw Error("compiler error: duplicate var in declarations:" + name);
      }
      dec += (name + ", ");
    }
    if (dec.length > 4) {
      dec = dec.slice(0, dec.length - 2);
      body.unshift(dec);
    }
    if ((typeof isTopLevel !== 'undefined' && isTopLevel !== null) && isTopLevel) {
      while (funcs.length > 0) {
        func = funcs.pop();
        if ([].indexOf.call(funcs, func, funcs) >= 0) {
          throw Error("compiler error: duplicate func in declarations:" + func);
        }
        if ([].indexOf.call(Object.keys(toplevel), func, Object.keys(toplevel)) >= 0) {
          notRedefined(func) ? body.unshift(toplevel[func].toString()) : undefined;
        } else if ([].indexOf.call(Object.keys(macros), func, Object.keys(macros)) >= 0) {
          body.unshift("var " + func + " = " + macros[func] + ";");
        } else if ([].indexOf.call(Object.keys(opFuncs), func, Object.keys(opFuncs)) >= 0) {
          body.unshift("var " + opFuncs[func].name + " = " + opFuncs[func].func + ";");
        } else {
          throw Error("unrecognised func: " + pr(func));
        }
      }
    } else {
      _ref1111110 = funcs;
      for (_i111110 = 0; _i111110 < _ref1111110.length; ++_i111110) {
        func = _ref1111110[_i111110];
        !([].indexOf.call(outerScope.hoist, func, outerScope.hoist) >= 0) ? outerScope.hoist.push(func) : undefined;
      }
    }
    scope = outerScope;
    buffer.push("(function(" + spr(args) + ") {" + render(body) + " })");
    return Array(buffer, scope);
  });
  specials.def = (function(form, scope, opts, nested) {
    var buffer, formName, isNested, outerScope, fname, args, body, optionals, spreads, i, arg, ind, name, restname, restind, rest, vars, funcs, dec, func, _ref, _i, _ref0, _ref10, _i0, _ref110, _i10, _ref1110, _i110, _i1110, _ref11110, _i11110, _ref111110, _i111110, _ref1111110;
    !(typeof opts !== 'undefined' && opts !== null) ? opts = {} : undefined;
    buffer = [];
    form = form.slice();
    formName = form.shift();
    if (typeof nested !== 'undefined' && nested !== null) {
      isNested = nested;
      nested = undefined;
    } else {
      isNested = true;
    }
    outerScope = scope;
    scope = {
      hoist: outerScope.hoist.slice(),
      service: outerScope.service.slice()
    };
    _ref = form;
    fname = _ref[0];
    var args = 3 <= _ref.length ? [].slice.call(_ref, 1, _i = _ref.length - 1) : (_i = 1, []);
    body = _ref[_i++];
    assertExp(fname, isVarName, "valid identifier");
    opts.topScope && ([].indexOf.call(Object.keys(toplevel), fname, Object.keys(toplevel)) >= 0) && !([].indexOf.call(scope.hoist, fname, scope.hoist) >= 0) && notRedefined(fname) ? toplevelRedefine.push(fname) : undefined;
    scope.hoist.push.apply(scope.hoist, [].concat(getArgNames(args)));
    !(typeof body !== 'undefined' && body !== null) ? body = [] : undefined;
    optionals = [];
    spreads = 0;
    _ref0 = args;
    for (i = 0; i < _ref0.length; ++i) {
      arg = _ref0[i];
      if (isList(arg)) {
        assertExp(arg, (function() {
          return arguments[0].length === 2;
        }), "optional or rest parameter");
        if (arg[0] === "spread") {
          if (++spreads > 1) {
            throw Error("cannot define more than one rest parameter");
          }
          _ref10 = declareService("_i", scope, opts.function ? args : undefined);
          ind = _ref10[0];
          scope = _ref10[1];
          _ref110 = compileGetLast(arg, buffer, scope, opts, nested);
          name = _ref110[0];
          buffer = _ref110[1];
          scope = _ref110[2];
          assertExp(name, isVarName, "valid identifier");
          restname = name;
          restind = i;
          args[i] = restname;
          rest = list(name + " = " + args.length + " <= arguments.length ? [].slice.call(arguments, " + i + ", " + ind + " = arguments.length - " + (args.length - i - 1) + ") : (" + ind + " = " + restind + ", [])");
        } else {
          assertExp((name = arg[0]), isVarName, "valid parameter name");
          args[i] = name;
          optionals.push(["if", ["not", ["?", name]],
            ["=", name, arg[1]]
          ]);
        }
      } else if (restname) {
        rest.push(pr(arg) + " = arguments[" + ind + "++]");
      }
    }
    typeof restind !== 'undefined' && restind !== null ? args = args.slice(0, restind) : undefined;
    optionals.length > 0 ? body = [].concat(["do"]).concat(optionals).concat([body]) : undefined;
    body = returnify(body);
    _ref1110 = compileResolve(body, buffer, scope, opts, nested);
    body = _ref1110[0];
    buffer = _ref1110[1];
    scope = _ref1110[2];
    rest ? body.unshift.apply(body, [].concat(rest)) : undefined;
    vars = [];
    funcs = [];
    dec = "var ";
    !(typeof args !== 'undefined' && args !== null) ? args = [] : undefined;
    _ref11110 = scope.hoist;
    for (_i1110 = 0; _i1110 < _ref11110.length; ++_i1110) {
      name = _ref11110[_i1110];
      if (!([].indexOf.call(outerScope.hoist, name, outerScope.hoist) >= 0) && !([].indexOf.call(args, name, args) >= 0)) {
        if ([].indexOf.call(Object.keys(toplevel), name, Object.keys(toplevel)) >= 0) {
          opts.topScope && ([].indexOf.call(toplevelRedeclare, name, toplevelRedeclare) >= 0) ? vars.push(name) : notRedefined(name) ? funcs.push(name) : undefined;
        } else if (([].indexOf.call(Object.keys(opFuncs), name, Object.keys(opFuncs)) >= 0) || ([].indexOf.call(Object.keys(macros), name, Object.keys(macros)) >= 0)) {
          funcs.push(name);
        } else {
          vars.push(name);
        }
      }
    }
    _ref111110 = scope.service;
    for (_i11110 = 0; _i11110 < _ref111110.length; ++_i11110) {
      name = _ref111110[_i11110];
      !([].indexOf.call(outerScope.service, name, outerScope.service) >= 0) ? vars.push(name) : undefined;
    }
    while (vars.length > 0) {
      name = vars.shift();
      if ([].indexOf.call(vars, name, vars) >= 0) {
        throw Error("compiler error: duplicate var in declarations:" + name);
      }
      dec += (name + ", ");
    }
    if (dec.length > 4) {
      dec = dec.slice(0, dec.length - 2);
      body.unshift(dec);
    }
    if ((typeof isTopLevel !== 'undefined' && isTopLevel !== null) && isTopLevel) {
      while (funcs.length > 0) {
        func = funcs.pop();
        if ([].indexOf.call(funcs, func, funcs) >= 0) {
          throw Error("compiler error: duplicate func in declarations:" + func);
        }
        if ([].indexOf.call(Object.keys(toplevel), func, Object.keys(toplevel)) >= 0) {
          notRedefined(func) ? body.unshift(toplevel[func].toString()) : undefined;
        } else if ([].indexOf.call(Object.keys(macros), func, Object.keys(macros)) >= 0) {
          body.unshift("var " + func + " = " + macros[func] + ";");
        } else if ([].indexOf.call(Object.keys(opFuncs), func, Object.keys(opFuncs)) >= 0) {
          body.unshift("var " + opFuncs[func].name + " = " + opFuncs[func].func + ";");
        } else {
          throw Error("unrecognised func: " + pr(func));
        }
      }
    } else {
      _ref1111110 = funcs;
      for (_i111110 = 0; _i111110 < _ref1111110.length; ++_i111110) {
        func = _ref1111110[_i111110];
        !([].indexOf.call(outerScope.hoist, func, outerScope.hoist) >= 0) ? outerScope.hoist.push(func) : undefined;
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

  function collect(compiled, collector, isCase, isNested) {
    var plug, lastItem;
    !(typeof isCase !== 'undefined' && isCase !== null) ? isCase = false : undefined;
    !(typeof isNested !== 'undefined' && isNested !== null) ? isNested = true : undefined;
    if (isList(compiled) && (compiled.length > 0)) {
      /\{$/.test(compiled.slice(-1)[0]) ? plug = compiled.pop() : undefined;
      lastItem = compiled.pop();
      if (isNested) {
        if (/^return\s/.test(lastItem)) {
          lastItem = lastItem.replace(/^return\s/, "return " + collector + " = ");
        } else if (util.kwtest(lastItem)) {
          lastItem = collector + " = undefined; " + lastItem;
        } else {
          lastItem = collector + " = " + pr(lastItem);
        }
      }
      compiled.push(lastItem);
      isCase ? compiled.push("break") : undefined;
      typeof plug !== 'undefined' && plug !== null ? compiled.push(plug) : undefined;
    }
    return compiled;
  }
  collect;
  specials.if = (function(form, scope, opts, nested) {
    var buffer, formName, isNested, predicate, prebranch, midcases, postbranch, collector, i, mid, midtest, midbranch, comp, _ref, _i, _ref0, _i0, _ref10, _i10, _ref110, _i110, _ref1110, _i1110, _ref11110, _ref111110, _i11110, _ref1111110, _i111110, _ref11111110, _i1111110, _i11111110, _ref111111110;
    !(typeof opts !== 'undefined' && opts !== null) ? opts = {} : undefined;
    buffer = [];
    form = form.slice();
    formName = form.shift();
    if (typeof nested !== 'undefined' && nested !== null) {
      isNested = nested;
      nested = undefined;
    } else {
      isNested = true;
    }
    _ref = form;
    predicate = _ref[0];
    prebranch = _ref[1];
    var midcases = 4 <= _ref.length ? [].slice.call(_ref, 2, _i = _ref.length - 1) : (_i = 2, []);
    postbranch = _ref[_i++];
    if ((typeof postbranch !== 'undefined' && postbranch !== null) && (postbranch[0] === "elif")) {
      midcases.push(postbranch);
      postbranch = undefined;
    }
    _ref0 = compileGetLast(predicate, buffer, scope, opts, nested);
    predicate = _ref0[0];
    buffer = _ref0[1];
    scope = _ref0[2];
    !(typeof predicate !== 'undefined' && predicate !== null) ? predicate = "false" : undefined;
    nested = isNested;
    _ref10 = compileResolve(prebranch, buffer, scope, opts, nested);
    prebranch = _ref10[0];
    buffer = _ref10[1];
    scope = _ref10[2];
    _ref110 = compileResolve(postbranch, buffer, scope, opts, nested);
    postbranch = _ref110[0];
    buffer = _ref110[1];
    scope = _ref110[2];
    if ((prebranch.length === 1) && !util.kwtest(prebranch[0]) && (midcases.length === 0) && (postbranch.length === 1) && !util.kwtest(postbranch[0])) {
      buffer.push(pr(predicate) + " ? " + pr(prebranch[0]) + " : " + pr(postbranch[0]));
    } else {
      if (isNested) {
        _ref1110 = declareService("_ref", scope, opts.function ? args : undefined);
        collector = _ref1110[0];
        scope = _ref1110[1];
      }
      prebranch = collect(prebranch, collector, false, isNested);
      postbranch = collect(postbranch, collector, false, isNested);
      _ref11110 = midcases;
      for (i = 0; i < _ref11110.length; ++i) {
        mid = _ref11110[i];
        assertExp(mid, (function(x) {
          return x.shift() === "elif";
        }), "elif");
        _ref111110 = mid;
        midtest = _ref111110[0];
        midbranch = _ref111110[1];
        _ref1111110 = compileResolve(midtest, buffer, scope, opts, nested);
        midtest = _ref1111110[0];
        buffer = _ref1111110[1];
        scope = _ref1111110[2];
        !(typeof midtest !== 'undefined' && midtest !== null) ? midtest = "false" : undefined;
        if (midtest.length > 1) {
          throw Error(pr("elif") + " must compile to single expression (todo fix later); got:" + pr(midtest));
        }
        _ref11111110 = compileResolve(midbranch, buffer, scope, opts, nested);
        midbranch = _ref11111110[0];
        buffer = _ref11111110[1];
        scope = _ref11111110[2];
        midcases[i] = {
          test: midtest,
          branch: collect(midbranch, collector, false, isNested)
        };
      }
      comp = "if (" + pr(predicate) + ") { " + render(prebranch) + " } ";
      _ref111111110 = midcases;
      for (_i11111110 = 0; _i11111110 < _ref111111110.length; ++_i11111110) {
        mid = _ref111111110[_i11111110];
        comp += (" else if (" + spr(mid.test) + ") { " + render(mid.branch) + " }");
      }(typeof postbranch !== 'undefined' && postbranch !== null) && ((postbranch.length > 1) || (typeof postbranch[0] !== 'undefined' && postbranch[0] !== null)) ? comp += (" else { " + render(postbranch) + " }") : undefined;
      buffer.push(comp);
      isNested ? buffer.push(collector) : buffer.push("");
    }
    return Array(buffer, scope);
  });
  specials.switch = (function(form, scope, opts, nested) {
    var buffer, formName, isNested, predicate, midcases, postbranch, collector, i, mid, midtest, midbranch, comp, _ref, _i, _ref0, _i0, _ref10, _i10, _ref110, _ref1110, _i110, _ref11110, _i1110, _ref111110, _i11110, _ref1111110, _i111110, _i1111110, _ref11111110;
    !(typeof opts !== 'undefined' && opts !== null) ? opts = {} : undefined;
    buffer = [];
    form = form.slice();
    formName = form.shift();
    if (typeof nested !== 'undefined' && nested !== null) {
      isNested = nested;
      nested = undefined;
    } else {
      isNested = true;
    }
    _ref = form;
    predicate = _ref[0];
    var midcases = 3 <= _ref.length ? [].slice.call(_ref, 1, _i = _ref.length - 1) : (_i = 1, []);
    postbranch = _ref[_i++];
    if ((typeof postbranch !== 'undefined' && postbranch !== null) && (postbranch[0] === "case")) {
      midcases.push(postbranch);
      postbranch = undefined;
    }
    if (isNested) {
      _ref0 = declareService("_ref", scope, opts.function ? args : undefined);
      collector = _ref0[0];
      scope = _ref0[1];
    }
    _ref10 = compileGetLast(predicate, buffer, scope, opts, nested);
    predicate = _ref10[0];
    buffer = _ref10[1];
    scope = _ref10[2];
    !(typeof predicate !== 'undefined' && predicate !== null) ? predicate = "false" : undefined;
    nested = isNested;
    _ref110 = midcases;
    for (i = 0; i < _ref110.length; ++i) {
      mid = _ref110[i];
      assertExp(mid, (function(x) {
        return x.shift() === "case";
      }), "case");
      _ref1110 = mid;
      midtest = _ref1110[0];
      midbranch = _ref1110[1];
      _ref11110 = compileResolve(midtest, buffer, scope, opts, nested);
      midtest = _ref11110[0];
      buffer = _ref11110[1];
      scope = _ref11110[2];
      !(typeof midtest !== 'undefined' && midtest !== null) ? midtest = "false" : undefined;
      if (midtest.length > 1) {
        throw Error(pr("case") + " must compile to single expression (todo fix later); got:" + pr(midtest));
      }
      _ref111110 = compileResolve(midbranch, buffer, scope, opts, nested);
      midbranch = _ref111110[0];
      buffer = _ref111110[1];
      scope = _ref111110[2];
      midcases[i] = {
        test: midtest,
        branch: collect(midbranch, collector, true, isNested)
      };
    }
    _ref1111110 = compileResolve(postbranch, buffer, scope, opts, nested);
    postbranch = _ref1111110[0];
    buffer = _ref1111110[1];
    scope = _ref1111110[2];
    postbranch = collect(postbranch, collector, false, isNested);
    comp = "switch (" + pr(predicate) + ") { ";
    _ref11111110 = midcases;
    for (_i1111110 = 0; _i1111110 < _ref11111110.length; ++_i1111110) {
      mid = _ref11111110[_i1111110];
      comp += (" case " + spr(mid.test) + ": " + render(mid.branch));
    }
    comp += (" default: " + render(postbranch) + " }");
    buffer.push(comp);
    isNested ? buffer.push(collector) : buffer.push("");
    return Array(buffer, scope);
  });
  specials.for = (function(form, scope, opts, nested) {
    var buffer, formName, isNested, value, key, iterable, body, collector, ref, _ref, _i, _ref0, _i0, _ref10, _i10, _ref110, _i110, _ref1110, _i1110, _ref11110, _i11110, _ref111110, _i111110, _ref1111110, _i1111110;
    !(typeof opts !== 'undefined' && opts !== null) ? opts = {} : undefined;
    buffer = [];
    form = form.slice();
    formName = form.shift();
    if (form.length < 2) {
      throw Error(pr(formName) + " expects no less than " + pr(2) + " arguments");
    }
    if (form.length > 4) {
      throw Error(pr(formName) + " expects no more than " + pr(4) + " arguments");
    }
    if (typeof nested !== 'undefined' && nested !== null) {
      isNested = nested;
      nested = undefined;
    } else {
      isNested = true;
    }
    _ref = form;
    value = _ref[0];
    key = _ref[1];
    iterable = _ref[2];
    body = _ref[3];
    if (!(typeof body !== 'undefined' && body !== null)) {
      if (!(typeof iterable !== 'undefined' && iterable !== null)) {
        if (isNaN(Number(value)) || !(parseInt(value) > 0)) {
          throw Error("expecting integer, got " + pr(value));
        }
        body = key;
        iterable = ["quote", [range, 1, [parseInt, value]]];
        _ref0 = declareService("_i", scope, opts.function ? args : undefined);
        key = _ref0[0];
        scope = _ref0[1];
        _ref10 = declareService("_val", scope, opts.function ? args : undefined);
        value = _ref10[0];
        scope = _ref10[1];
      } else {
        body = iterable;
        iterable = key;
        _ref110 = declareService("_i", scope, opts.function ? args : undefined);
        key = _ref110[0];
        scope = _ref110[1];
        assertExp(value, isVarName, "valid identifier");
        opts.topScope && ([].indexOf.call(Object.keys(toplevel), value, Object.keys(toplevel)) >= 0) && !([].indexOf.call(scope.hoist, value, scope.hoist) >= 0) && notRedefined(value) ? toplevelRedeclare.push(value) : undefined;
        scope = declareVar(value, scope);
      }
    } else {
      assertExp(key, isVarName, "valid identifier");
      opts.topScope && ([].indexOf.call(Object.keys(toplevel), key, Object.keys(toplevel)) >= 0) && !([].indexOf.call(scope.hoist, key, scope.hoist) >= 0) && notRedefined(key) ? toplevelRedeclare.push(key) : undefined;
      scope = declareVar(key, scope);
      assertExp(value, isVarName, "valid identifier");
      opts.topScope && ([].indexOf.call(Object.keys(toplevel), value, Object.keys(toplevel)) >= 0) && !([].indexOf.call(scope.hoist, value, scope.hoist) >= 0) && notRedefined(value) ? toplevelRedeclare.push(value) : undefined;
      scope = declareVar(value, scope);
    }
    assertExp(key, isVarName, "valid identifier");
    assertExp(value, isVarName, "valid identifier");
    if (isNested) {
      _ref1110 = declareService("_res", scope, opts.function ? args : undefined);
      collector = _ref1110[0];
      scope = _ref1110[1];
      buffer.push(collector + " = []");
    }
    _ref11110 = declareService("_ref", scope, opts.function ? args : undefined);
    ref = _ref11110[0];
    scope = _ref11110[1];
    _ref111110 = compileGetLast(iterable, buffer, scope, opts, nested);
    iterable = _ref111110[0];
    buffer = _ref111110[1];
    scope = _ref111110[2];
    buffer.push(ref + " = " + pr(iterable));
    nested = isNested;
    _ref1111110 = compileResolve(body, buffer, scope, opts, nested);
    body = _ref1111110[0];
    buffer = _ref1111110[1];
    scope = _ref1111110[2];
    isNested && !util.kwtest(pr(body.slice(-1)[0])) ? body.push(collector + ".push(" + pr(body.pop()) + ")") : undefined;
    buffer.push("for (" + key + " = 0; " + key + " < " + ref + ".length; ++" + key + ") { " + value + " = " + ref + "[" + key + "]; " + render(body) + " }");
    isNested ? buffer.push(collector) : buffer.push("");
    return Array(buffer, scope);
  });
  specials.over = (function(form, scope, opts, nested) {
    var buffer, formName, isNested, value, key, iterable, body, collector, ref, _ref, _i, _ref0, _i0, _ref10, _i10, _ref110, _i110, _ref1110, _i1110, _ref11110, _i11110, _ref111110, _i111110, _ref1111110, _i1111110;
    !(typeof opts !== 'undefined' && opts !== null) ? opts = {} : undefined;
    buffer = [];
    form = form.slice();
    formName = form.shift();
    if (form.length < 2) {
      throw Error(pr(formName) + " expects no less than " + pr(2) + " arguments");
    }
    if (form.length > 4) {
      throw Error(pr(formName) + " expects no more than " + pr(4) + " arguments");
    }
    if (typeof nested !== 'undefined' && nested !== null) {
      isNested = nested;
      nested = undefined;
    } else {
      isNested = true;
    }
    _ref = form;
    value = _ref[0];
    key = _ref[1];
    iterable = _ref[2];
    body = _ref[3];
    if (!(typeof body !== 'undefined' && body !== null)) {
      body = iterable;
      iterable = key;
      _ref0 = declareService("_key", scope, opts.function ? args : undefined);
      key = _ref0[0];
      scope = _ref0[1];
      assertExp(value, isVarName, "valid identifier");
      opts.topScope && ([].indexOf.call(Object.keys(toplevel), value, Object.keys(toplevel)) >= 0) && !([].indexOf.call(scope.hoist, value, scope.hoist) >= 0) && notRedefined(value) ? toplevelRedeclare.push(value) : undefined;
      scope = declareVar(value, scope);
    } else if (!(typeof iterable !== 'undefined' && iterable !== null)) {
      body = key;
      iterable = value;
      _ref10 = declareService("_key", scope, opts.function ? args : undefined);
      key = _ref10[0];
      scope = _ref10[1];
      _ref110 = declareService("_val", scope, opts.function ? args : undefined);
      value = _ref110[0];
      scope = _ref110[1];
    } else {
      assertExp(key, isVarName, "valid identifier");
      opts.topScope && ([].indexOf.call(Object.keys(toplevel), key, Object.keys(toplevel)) >= 0) && !([].indexOf.call(scope.hoist, key, scope.hoist) >= 0) && notRedefined(key) ? toplevelRedeclare.push(key) : undefined;
      scope = declareVar(key, scope);
      assertExp(value, isVarName, "valid identifier");
      opts.topScope && ([].indexOf.call(Object.keys(toplevel), value, Object.keys(toplevel)) >= 0) && !([].indexOf.call(scope.hoist, value, scope.hoist) >= 0) && notRedefined(value) ? toplevelRedeclare.push(value) : undefined;
      scope = declareVar(value, scope);
    }
    assertExp(key, isVarName, "valid identifier");
    assertExp(value, isVarName, "valid identifier");
    if (isNested) {
      _ref1110 = declareService("_res", scope, opts.function ? args : undefined);
      collector = _ref1110[0];
      scope = _ref1110[1];
      buffer.push(collector + " = []");
    }
    _ref11110 = declareService("_ref", scope, opts.function ? args : undefined);
    ref = _ref11110[0];
    scope = _ref11110[1];
    _ref111110 = compileGetLast(iterable, buffer, scope, opts, nested);
    iterable = _ref111110[0];
    buffer = _ref111110[1];
    scope = _ref111110[2];
    buffer.push(ref + " = " + pr(iterable));
    nested = isNested;
    _ref1111110 = compileResolve(body, buffer, scope, opts, nested);
    body = _ref1111110[0];
    buffer = _ref1111110[1];
    scope = _ref1111110[2];
    isNested && !util.kwtest(pr(body.slice(-1)[0])) ? body.push(collector + ".push(" + pr(body.pop()) + ")") : undefined;
    buffer.push("for (" + key + " in " + ref + ") { " + value + " = " + ref + "[" + key + "]; " + render(body) + " }");
    isNested ? buffer.push(collector) : buffer.push("");
    return Array(buffer, scope);
  });
  specials.while = (function(form, scope, opts, nested) {
    var buffer, formName, isNested, test, body, rvalue, collector, comp, _ref, _i, _ref0, _i0, _ref10, _i10, _ref110, _i110, _ref1110, _i1110;
    !(typeof opts !== 'undefined' && opts !== null) ? opts = {} : undefined;
    buffer = [];
    form = form.slice();
    formName = form.shift();
    if (form.length < 2) {
      throw Error(pr(formName) + " expects no less than " + pr(2) + " arguments");
    }
    if (form.length > 3) {
      throw Error(pr(formName) + " expects no more than " + pr(3) + " arguments");
    }
    if (typeof nested !== 'undefined' && nested !== null) {
      isNested = nested;
      nested = undefined;
    } else {
      isNested = true;
    }
    _ref = form;
    test = _ref[0];
    body = _ref[1];
    rvalue = _ref[2];
    if (form.length === 2) {
      if (isNested) {
        _ref0 = declareService("_res", scope, opts.function ? args : undefined);
        collector = _ref0[0];
        scope = _ref0[1];
        buffer.push(collector + " = []");
      }
    } else {
      comp = "";
    }
    _ref10 = compileGetLast(test, buffer, scope, opts, nested);
    test = _ref10[0];
    buffer = _ref10[1];
    scope = _ref10[2];
    nested = isNested;
    _ref110 = compileResolve(body, buffer, scope, opts, nested);
    body = _ref110[0];
    buffer = _ref110[1];
    scope = _ref110[2];
    isNested && (form.length === 2) && !util.kwtest(pr(body.slice(-1)[0])) ? body.push(collector + ".push(" + pr(body.pop()) + ")") : undefined;
    buffer.push("while (" + pr(test) + ") { " + render(body) + " }");
    if (form.length === 2) {
      isNested ? buffer.push(collector) : buffer.push("");
    } else {
      _ref1110 = compileResolve(rvalue, buffer, scope, opts, nested);
      rvalue = _ref1110[0];
      buffer = _ref1110[1];
      scope = _ref1110[2];
      buffer.push(render(rvalue));
    }
    return Array(buffer, scope);
  });
  specials.try = (function(form, scope, opts, nested) {
    var buffer, formName, isNested, tryForm, catchForm, finalForm, collector, err, res, _ref, _i, _ref0, _i0, _ref10, _i10, _ref110, _i110, _ref1110, _i1110, _ref11110, _i11110, _ref111110, _i111110;
    !(typeof opts !== 'undefined' && opts !== null) ? opts = {} : undefined;
    buffer = [];
    form = form.slice();
    formName = form.shift();
    if (form.length < 1) {
      throw Error(pr(formName) + " expects no less than " + pr(1) + " arguments");
    }
    if (form.length > 3) {
      throw Error(pr(formName) + " expects no more than " + pr(3) + " arguments");
    }
    if (typeof nested !== 'undefined' && nested !== null) {
      isNested = nested;
      nested = undefined;
    } else {
      isNested = true;
    }
    _ref = form;
    tryForm = _ref[0];
    catchForm = _ref[1];
    finalForm = _ref[2];
    _ref0 = compileResolve(tryForm, buffer, scope, opts, nested);
    tryForm = _ref0[0];
    buffer = _ref0[1];
    scope = _ref0[2];
    if (isNested) {
      _ref10 = declareService("_ref", scope, opts.function ? args : undefined);
      collector = _ref10[0];
      scope = _ref10[1];
      tryForm.push(collector + " = " + pr(tryForm.pop()));
    }
    if (isList(catchForm) && (catchForm[0] === "catch")) {
      assertExp(catchForm, (function() {
        return arguments[0].length === 2 || arguments[0].length === 3;
      }), "valid catch form");
      _ref110 = catchForm;
      catchForm = _ref110[0];
      err = _ref110[1];
      catchForm = _ref110[2];
      assertExp(err, isVarName, "valid identifier");
    } else {
      _ref1110 = declareService("_err", scope, opts.function ? args : undefined);
      err = _ref1110[0];
      scope = _ref1110[1];
    }!(typeof catchForm !== 'undefined' && catchForm !== null) ? catchForm = undefined : undefined;
    nested = isNested;
    _ref11110 = compileResolve(catchForm, buffer, scope, opts, nested);
    catchForm = _ref11110[0];
    buffer = _ref11110[1];
    scope = _ref11110[2];
    isNested && !util.kwtest(pr(catchForm.slice(-1)[0])) ? catchForm.push(collector + " = " + pr(catchForm.pop())) : undefined;
    if (typeof finalForm !== 'undefined' && finalForm !== null) {
      if (isList(finalForm) && (finalForm[0] === "finally")) {
        assertExp(finalForm, (function() {
          return arguments[0].length === 2;
        }));
        finalForm = finalForm.slice(-1)[0];
      }
      _ref111110 = compileResolve(finalForm, buffer, scope, opts, nested);
      finalForm = _ref111110[0];
      buffer = _ref111110[1];
      scope = _ref111110[2];
      isNested && !util.kwtest(pr(finalForm.slice(-1)[0])) ? finalForm.push(collector + " = " + pr(finalForm.pop())) : undefined;
    }
    res = "try { " + render(tryForm) + " } catch (" + pr(err) + ") { " + render(catchForm) + " }";
    typeof finalForm !== 'undefined' && finalForm !== null ? res += (" finally { " + render(finalForm) + " }") : undefined;
    buffer.push(res);
    isNested ? buffer.push(collector) : buffer.push("");
    return Array(buffer, scope);
  });
  specials.get = (function(form, scope, opts, nested) {
    var buffer, formName, isNested, object, property, _ref, _i, _ref0, _i0, _ref10, _i10;
    !(typeof opts !== 'undefined' && opts !== null) ? opts = {} : undefined;
    buffer = [];
    form = form.slice();
    formName = form.shift();
    if (form.length < 1) {
      throw Error(pr(formName) + " expects no less than " + pr(1) + " arguments");
    }
    if (form.length > 2) {
      throw Error(pr(formName) + " expects no more than " + pr(2) + " arguments");
    }
    if (typeof nested !== 'undefined' && nested !== null) {
      isNested = nested;
      nested = undefined;
    } else {
      isNested = true;
    }
    _ref = form;
    object = _ref[0];
    property = _ref[1];
    if (!(typeof property !== 'undefined' && property !== null)) {
      property = object;
      object = "";
    }
    _ref0 = compileGetLast(object, buffer, scope, opts, nested);
    object = _ref0[0];
    buffer = _ref0[1];
    scope = _ref0[2];
    _ref10 = compileGetLast(property, buffer, scope, opts, nested);
    property = _ref10[0];
    buffer = _ref10[1];
    scope = _ref10[2];
    assertExp(object, (function() {
      return typeof arguments[0] !== 'undefined' && arguments[0] !== null;
    }), "valid object");
    isVarName(property) ? buffer.push(pr(object) + "." + property) : buffer.push(pr(object) + "[" + pr(property) + "]");
    return Array(buffer, scope);
  });
  specials.spread = (function(form, scope, opts, nested) {
    var buffer, formName, isNested, _ref, _i;
    !(typeof opts !== 'undefined' && opts !== null) ? opts = {} : undefined;
    buffer = [];
    form = form.slice();
    formName = form.shift();
    if (form.length < 1) {
      throw Error(pr(formName) + " expects no less than " + pr(1) + " arguments");
    }
    if (form.length > 1) {
      throw Error(pr(formName) + " expects no more than " + pr(1) + " arguments");
    }
    if (typeof nested !== 'undefined' && nested !== null) {
      isNested = nested;
      nested = undefined;
    } else {
      isNested = true;
    }
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
    var buffer, formName, isNested, _ref, _i;
    !(typeof opts !== 'undefined' && opts !== null) ? opts = {} : undefined;
    buffer = [];
    form = form.slice();
    formName = form.shift();
    if (form.length > 1) {
      throw Error(pr(formName) + " expects no more than " + pr(1) + " arguments");
    }
    if (typeof nested !== 'undefined' && nested !== null) {
      isNested = nested;
      nested = undefined;
    } else {
      isNested = true;
    } if (form.length !== 0) {
      _ref = compileGetLast(form[0], buffer, scope, opts, nested);
      form = _ref[0];
      buffer = _ref[1];
      scope = _ref[2];
      !util.kwtest(form) ? form = "return " + pr(form) : undefined;
      buffer.push(form);
    }
    return Array(buffer, scope);
  });
  macros = {};

  function importMacros() {
    var store, key, val, _i, _i0, _ref, _ref0;
    stores = 1 <= arguments.length ? [].slice.call(arguments, 0, _i = arguments.length - 0) : (_i = 0, []);
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
    if (util.isHash(form)) {
      _ref = form;
      for (key in _ref) {
        val = _ref[key];
        form[key] = parseMacros(val);
      }
    } else if (util.isList(form)) {
      if (form[0] === "mac") {
        form = makeMacro(form.slice(1));
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

  function makeMacro(form) {
    var name, body, compiled, scope, rendered, _ref, _i, _ref0, _i0;
    _ref = form;
    name = _ref[0];
    var body = 2 <= _ref.length ? [].slice.call(_ref, 1, _i = _ref.length - 0) : (_i = 1, []);
    if (!(typeof name !== 'undefined' && name !== null)) {
      throw Error("a macro requires a name");
    }
    if (!(typeof body !== 'undefined' && body !== null)) {
      throw Error("a macro requires a body");
    }
    body.unshift("fn");
    _ref0 = compileForm(body, {
      hoist: [],
      service: []
    }, {
      macro: true
    });
    compiled = _ref0[0];
    scope = _ref0[1];
    rendered = render(compiled);
    macros[name] = jispEval(rendered);
    return [];
  }
  makeMacro;

  function expandMacros(form) {
    var key, val, i, _ref, _ref0;
    if (util.isHash(form)) {
      _ref = form;
      for (key in _ref) {
        val = _ref[key];
        form[key] = expandMacros(val);
      }
    } else if (util.isList(form)) {
      if (form[0] === "mac") {
        form = parseMacros(form);
      } else if ([].indexOf.call(Object.keys(macros), form[0], Object.keys(macros)) >= 0) {
        form = macros[form[0]].apply(macros, [].concat(form.slice(1)));
        typeof form === "undefined" ? form = [] : undefined;
        form = expandMacros(form);
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

  function macroexpand(src) {
    return expandMacros(parseMacros(src));
  }
  macroexpand;
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
  exports.macroexpand = (function(src) {
    return macroexpand(parse(lex(tokenise(src))));
  });
  exports.macros = macros;

  function compile(src, opts) {
    var defaults, parsed, expanded, compiled, scope, _ref, _i;
    defaults = {
      wrap: true,
      topScope: true,
      isTopLevel: true
    };
    opts = util.merge(defaults, opts);
    parsed = parse(lex(tokenise(src)));
    parsed.unshift("do");
    opts.wrap ? parsed = [
      ["get", ["fn", parsed], "call"], "this"
    ] : undefined;
    if (!opts.repl) {
      toplevelRedeclare = [];
      toplevelRedefine = [];
    }
    expanded = macroexpand(parsed);
    _ref = compileForm(expanded, {
      hoist: [],
      service: []
    }, opts);
    compiled = _ref[0];
    scope = _ref[1];
    return typeof beautify !== 'undefined' && beautify !== null ? beautify(render(compiled), {
      indent_size: 2
    }) : render(compiled);
  }
  exports.compile = compile;

  function jispEval(src) {
    return (typeof vm !== 'undefined' && vm !== null) && (typeof vm.runInThisContext !== 'undefined' && vm.runInThisContext !== null) ? vm.runInThisContext(src) : eval(src);
  }
  exports.eval = jispEval;

  function compileFile(filename) {
    var raw, stripped, _ref;
    raw = fs.readFileSync(filename, "utf8");
    stripped = raw.charCodeAt(0) === 65279 ? raw.substring(1) : raw;
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
    !(typeof options !== 'undefined' && options !== null) ? options = {} : undefined;
    mainModule = require.main;
    mainModule.filename = (process.argv[1] = options.filename ? fs.realpathSync(options.filename) : ".");
    mainModule.moduleCache ? mainModule.moduleCache = {} : undefined;
    dir = options.filename ? path.dirname(fs.realpathSync(options.filename)) : fs.realpathSync(".");
    mainModule.paths = require("module")._nodeModulePaths(dir);
    !util.isJisp(mainModule.filename) || require.extensions ? code = exports.compile(code) : undefined;
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
    !(typeof options !== 'undefined' && options !== null) ? options = {} : undefined;
    options.wrap = false;
    return eval(compile(code, options));
  });
  jisp.run = (function(code, options) {
    var compiled;
    !(typeof options !== 'undefined' && options !== null) ? options = {} : undefined;
    options.wrap = false;
    compiled = compile(code, options);
    return Function(compile(code, options))();
  });
  if (!(typeof window !== 'undefined' && window !== null)) {}
  jisp.load = (function(url, callback, options, hold) {
    var xhr;
    !(typeof options !== 'undefined' && options !== null) ? options = {} : undefined;
    !(typeof hold !== 'undefined' && hold !== null) ? hold = false : undefined;
    options.sourceFiles = [url];
    xhr = window.ActiveXObject ? new window.ActiveXObject("Microsoft.XMLHTTP") : new window.XMLHttpRequest();
    xhr.open("GET", url, true);
    "overrideMimeType" in xhr ? xhr.overrideMimeType("text/plain") : undefined;
    xhr.onreadystatechange = (function() {
      var param;
      if (xhr.readyState === 4) {
        if (xhr.status === 0 || xhr.status === 200) {
          param = [xhr.responseText, options];
          !hold ? jisp.run.apply(jisp, [].concat(param)) : undefined;
        } else {
          throw new Error(("Could not load " + url));
        }
      }
      return callback ? callback(param) : undefined;
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
      s.type === "text/jisp" ? jisps.push(s) : undefined;
    }

    function execute() {
      var param, _ref0;
      param = jisps[index];
      if (param instanceof Array) {
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
        var options, _ref10;
        options = {};
        if (script.src) {
          _ref10 = jisp.load(script.src, (function(param) {
            jisps[i] = param;
            return execute();
          }), options, true);
        } else {
          options.sourceFiles = ["embedded"];
          _ref10 = (jisps[i] = [script.innerHTML, options]);
        }
        return _ref10;
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