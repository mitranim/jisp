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
  exports.specialValues = (specialValues = ["undefined", "null", "true", "false", "yes", "no", "Infinity", "NaN", "this"]);

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
    return (isAtom(form) && /^[$#_A-Za-z]{1}[$_\w()]*((\.[$#_A-Za-z]{1}[$_\w()]*)|(\[[$_.\w()\[\]]+\])|(\['.*'\])|(\[".*"\]))*$/.test(form));
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
    return (isAtom(form) && (/^\[[$#_A-Za-z]{1}\]$|^\[[$#_A-Za-z]+[$_.\w()]*(?:[$_\w()](?!\.))+\]$/.test(form) || /^\[[\d]+\]/.test(form)));
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

  function plusname(name) {
    return (isNaN(Number(name.slice(-1)[0])) ? (name + 0) : (name.slice(0, -1) + (1 + Number(name.slice(-1)[0]))));
  }
  exports.plusname = plusname;

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