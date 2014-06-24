(function() {
  var symbolWhitelist, keywords;
  (exports.symbolWhitelist = (symbolWhitelist = ["+", "-", "*", "/", "%", "++", "--", "?", "==", "===", "!=", "!==", "&&", "||", "!", ">", "<", ">=", "<=", "&", "|", "^", "<<", ">>", ">>>", "~", "=", "+=", "-=", "*=", "/=", "%=", "<<=", ">>=", ">>>=", "&=", "^=", "|="]));
  (exports.keywords = (keywords = ["return", "break", "continue"]));

  function kwtest(str) {
    return (/^return/.test(str) || /^break/.test(str) || /^continue/.test(str))
  }(exports.kwtest = kwtest);

  function isAtom(form) {
    return (((form === undefined) || (form === null)) || /^\/[^\s\/]+\/[\w]*$/.test(form) || (((typeof form) === "number") || ((typeof form) === "string") || ((typeof form) === "boolean")))
  }(exports.isAtom = isAtom);

  function isAtomString(form) {
    return (isNum(form) || isRegex(form) || isIdentifier(form) || isString(form) || ([].indexOf.call(symbolWhitelist, form) >= 0) || /^#[\d]+$/.test(form) || /^#$/.test(form))
  }(exports.isAtomString = isAtomString);

  function isList(form) {
    return Array.isArray(form)
  }(exports.isList = isList);

  function isHash(form) {
    return ((!isAtom(form)) && (!isList(form)))
  }(exports.isHash = isHash);

  function isBlankObject(form) {
    var _ref, _err;
    try {
      _ref = ((Object.keys(form).length === 0))
    } catch (_err) {
      _ref = false
    }
    return _ref;
  }(exports.isBlankObject = isBlankObject);

  function isKey(form) {
    return (isAtom(form) && (isString(form) || isIdentifier(form)))
  }(exports.isKey = isKey);

  function isVarName(form) {
    return (isAtom(form) && /^[$_A-Za-z]{1}$|^[$_A-Za-z]+[$_\w]*(?:[$_\w](?!\.))+$/.test(form))
  }(exports.isVarName = isVarName);

  function isIdentifier(form) {
    return (isAtom(form) && /^[$_A-Za-z]{1}[$_\w]*((\.[$_A-Za-z]{1}[$_\w]*)|(\[[$_.\w\[\]]+\])|(\['.*'\])|(\[".*"\]))*$/.test(form))
  }(exports.isIdentifier = isIdentifier);

  function isString(form) {
    return (isAtom(form) && /^".*"$|^'.*'$/.test(form))
  }(exports.isString = isString);

  function isRegex(form) {
    return (isAtom(form) && /^\/[^\s]+\/[\w]*[^\s)]*/.test(form))
  }(exports.isRegex = isRegex);

  function isNum(form) {
    return (isAtom(form) && (((typeof typify(form)) === "number")))
  }(exports.isNum = isNum);

  function isPrimitive(form) {
    return (isRegex(form) || isNum(form) || ((form === undefined) || (form === null) || (form === true) || (form === false)))
  }(exports.isPrimitive = isPrimitive);

  function isArgHash(form) {
    return (isAtom(form) && /^#[\d]+$/.test(form))
  }(exports.isArgHash = isArgHash);

  function isArgsHash(form) {
    return (isAtom(form) && /^#$/.test(form))
  }(exports.isArgsHash = isArgsHash);

  function isArgHashNotation(form) {
    return (isArgHash(form) || isArgsHash(form))
  }(exports.isArgHashNotation = isArgHashNotation);

  function isDotName(form) {
    return (isAtom(form) && /^\.[$_A-Za-z]{1}$|^\.[$_A-Za-z]+[$_.\w]*(?:[$_\w](?!\.))+$/.test(form))
  }(exports.isDotName = isDotName);

  function isBracketName(form) {
    return (isAtom(form) && /^\[[$_A-Za-z]{1}\]$|^\[[$_A-Za-z]+[$_.\w]*(?:[$_\w](?!\.))+\]$/.test(form))
  }(exports.isBracketName = isBracketName);

  function isBracketString(form) {
    return (isAtom(form) && /^\[".*"\]$|^\['.*'\]$/.test(form))
  }(exports.isBracketString = isBracketString);

  function isPropSyntax(form) {
    return (isAtom(form) && (isDotName(form) || isBracketName(form) || isBracketString(form)))
  }(exports.isPropSyntax = isPropSyntax);

  function typify(form) {
    var _ref;
    if ((!isAtom(form))) {
      throw Error(("expecting atom, got " + form));
      _ref = undefined;
    } else if (isBlankObject(form)) {
      _ref = form
    } else if ((((typeof form) === "undefined"))) {
      _ref = undefined
    } else if (((form === "null"))) {
      _ref = null
    } else if (((form === "true") || (form === "yes"))) {
      _ref = true
    } else if (((form === "false") || (form === "no"))) {
      _ref = false
    } else if ((!isNaN(Number(form)))) {
      _ref = Number(form)
    } else if (isRegex(form)) {
      _ref = form
    } else if ((((typeof form) === "string"))) {
      _ref = form
    } else {
      throw Error(("syntax error: unrecognised type of " + form));
      _ref = undefined;
    }
    return _ref;
  }(exports.typify = typify);

  function assertForm(form, min, max, first) {
    var _ref, _ref0, _ref1;
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
    if ((!isList(form))) {
      throw Error(("expecting list, got " + form));
      _ref1 = undefined;
    } else if ((!((form.length >= min) && (form.length <= max)))) {
      throw Error(("expecting between " + min + " and " + max + " arguments, got " + form.length));
      _ref1 = undefined;
    } else if (((typeof first !== 'undefined' && first !== null) && ((form[0] !== first)))) {
      throw Error(("expecting " + first + " as first element, got " + form[0]));
      _ref1 = undefined;
    } else {
      _ref1 = form
    }
    return _ref1;
  }(exports.assertForm = assertForm);
  (exports.merge = (function(options, overrides) {
    return extend(extend({}, options), overrides)
  }));

  function extend(object, properties) {
    var key, val, _res, _ref;
    _res = [];
    _ref = properties;
    for (key in _ref) {
      val = _ref[key];
      _res.push((object[key] = val))
    }
    _res;
    return object;
  }(exports.extend = extend);

  function baseFileName(file, stripExt, useWinPathSep) {
    var pathSep, parts, _ref, _ref0, _ref1, _ref2, _ref3;
    if ((!(typeof stripExt !== 'undefined' && stripExt !== null))) {
      _ref = (stripExt = false)
    } else {
      _ref = undefined
    }
    _ref;
    if ((!(typeof useWinPathSep !== 'undefined' && useWinPathSep !== null))) {
      _ref0 = (useWinPathSep = false)
    } else {
      _ref0 = undefined
    }
    _ref0;
    if (useWinPathSep) {
      _ref1 = /\\|\//
    } else {
      _ref1 = /\//
    }(pathSep = _ref1);
    (parts = file.split(pathSep));
    (file = parts[(parts.length - 1)]); if ((!(stripExt && (file.indexOf(".") >= 0)))) {
      return _ref2 = file
    } else {
      _ref2 = undefined
    }
    _ref2;
    (parts = file.split("."));
    parts.pop();
    if ((((parts[(parts.length - 1)] === "jisp")) && (parts.length > 1))) {
      _ref3 = parts.pop()
    } else {
      _ref3 = undefined
    }
    _ref3;
    return parts.join(".");
  }(exports.baseFileName = baseFileName);

  function repeat(str, n) {
    var res, _res, _ref;
    (res = "");
    _res = [];
    while ((n > 0)) {
      if ((n & 1)) {
        _ref = (res += str)
      } else {
        _ref = undefined
      }
      _ref;
      (n >>>= 1);
      _res.push((str += str));
    }
    _res;
    return res;
  }(exports.repeat = repeat);

  function isJisp(file) {
    return /\.jisp$/.test(file)
  }
  return (exports.isJisp = isJisp);
}).call(this)