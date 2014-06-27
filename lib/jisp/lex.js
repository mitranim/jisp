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