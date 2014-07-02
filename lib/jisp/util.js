(function() {
  var symbolWhitelist, keywords, specialValues;
  (exports.symbolWhitelist = (symbolWhitelist = ["+", "-", "*", "/", "%", "++", "--", "?", "?!", "==", "===", "!=", "!==", "&&", "||", "!", ">", "<", ">=", "<=", "&", "|", "^", "<<", ">>", ">>>", "~", "=", "+=", "-=", "*=", "/=", "%=", "<<=", ">>=", ">>>=", "&=", "^=", "|="]));
  (exports.keywords = (keywords = ["return", "break", "continue"]));

  function kwtest(str) {
    return (/^return/.test(str) || /^break/.test(str) || /^continue/.test(str));
  }(exports.kwtest = kwtest);
  (exports.specialValues = (specialValues = ["undefined", "null", "true", "false", "yes", "no", "Infinity", "NaN"]));

  function isSpecialValue(str) {
    return ([].indexOf.call(specialValues, str) >= 0);
  }(exports.isSpecialValueStr = isSpecialValue);

  function isSpecialValue(form) {
    return ((((typeof form) === "undefined")) || ((form === null)) || ((((typeof form) === "number")) && isNaN(form)) || ((form === Infinity)) || (((typeof form) === "boolean")));
  }(exports.isSpecialValue = isSpecialValue);

  function isAtom(form) {
    return (((form === undefined) || (form === null)) || /^\/[^\s\/]+\/[\w]*$/.test(form) || (((typeof form) === "number") || ((typeof form) === "string") || ((typeof form) === "boolean")));
  }(exports.isAtom = isAtom);

  function isAtomString(form) {
    return ((!isSpecialValue(form)) && (isNum(form) || isRegex(form) || isIdentifier(form) || isString(form) || ([].indexOf.call(symbolWhitelist, form) >= 0) || /^#[\d]+$/.test(form) || /^#$/.test(form)));
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