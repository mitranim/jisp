(function() {
  function concat(lists) {
    var res, lst, _i, _i0, _res, _ref;
    lists = 1 <= arguments.length ? [].slice.call(arguments, 0, _i = arguments.length - 0) : (_i = _i, []);
    (res = []);
    _res = [];
    _ref = lists;
    for (_i0 = 0; _i0 < _ref.length; ++_i0) {
      lst = _ref[_i0];
      _res.push((res = res.concat(lst)));
    }
    _res;
    return res;
  }
  var repeat, OptionParser, long_flag, short_flag, multi_flag, optional;
  (repeat = require("./util").repeat);
  (exports.OptionParser = (OptionParser = (function() {
    function OptionParser(rules, banner) {
      (this.banner = banner);
      (this.rules = buildRules(rules));
      return this;
    }
    OptionParser;
    (OptionParser.prototype.parse = (function(args) {
      var options, skippingArgument, originalArgs, i, arg, pos, isOption, seenNonOptionArg, matchedRule, rule, value, _res, _ref, _ref0, _ref1, _ref2, _i, _res0, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8;
      (options = {
        arguments: []
      });
      (skippingArgument = false);
      (originalArgs = args);
      (args = normaliseArguments(args));
      _res = [];
      _ref = args;
      for (i = 0; i < _ref.length; ++i) {
        arg = _ref[i];
        if (skippingArgument) {
          (skippingArgument = false);
          _ref0 = undefined;
          continue;
        } else {
          _ref0 = undefined;
        }
        _ref0;
        if (((arg === "--"))) {
          (pos = originalArgs.indexOf("--"));
          (options.arguments = options.arguments.concat(originalArgs.slice((pos + 1))));
          _ref1 = undefined;
          break;
        } else {
          _ref1 = undefined;
        }
        _ref1;
        (isOption = !!(arg.match(long_flag) || arg.match(short_flag)));
        (seenNonOptionArg = (options.arguments.length > 0));
        if ((!seenNonOptionArg)) {
          (matchedRule = false);
          _res0 = [];
          _ref3 = this.rules;
          for (_i = 0; _i < _ref3.length; ++_i) {
            rule = _ref3[_i];
            if (((arg === rule.shortFlag) || (arg === rule.longFlag))) {
              (value = true);
              if (rule.hasArgument) {
                (skippingArgument = true);
                _ref5 = (value = args[(i + 1)]);
              } else {
                _ref5 = undefined;
              }
              _ref5;
              if (rule.isList) {
                _ref6 = (options[rule.name] || []).concat(value);
              } else {
                _ref6 = value;
              }(options[rule.name] = _ref6);
              (matchedRule = true);
              _ref4 = undefined;
              break;
            } else {
              _ref4 = undefined;
            }
            _res0.push(_ref4);
          }
          _res0;
          if ((isOption && (!matchedRule))) {
            throw new Error(("unrecognised option: " + arg));
            _ref7 = undefined;
          } else {
            _ref7 = undefined;
          }
          _ref2 = _ref7;
        } else {
          _ref2 = undefined;
        }
        _ref2;
        if ((seenNonOptionArg || (!isOption))) {
          _ref8 = options.arguments.push(arg);
        } else {
          _ref8 = undefined;
        }
        _res.push(_ref8);
      }
      _res;
      return options;
    }));
    (OptionParser.prototype.help = (function() {
      var lines, rule, spaces, letPart, _ref, _i, _res, _ref0, _ref1, _ref2;
      (lines = []);
      if (this.banner) {
        _ref = lines.unshift((this.banner + "\n"));
      } else {
        _ref = undefined;
      }
      _ref;
      _res = [];
      _ref0 = this.rules;
      for (_i = 0; _i < _ref0.length; ++_i) {
        rule = _ref0[_i];
        (spaces = (15 - rule.longFlag.length));
        if ((spaces > 0)) {
          _ref1 = repeat(" ", spaces);
        } else {
          _ref1 = "";
        }(spaces = _ref1); if (rule.shortFlag) {
          _ref2 = (rule.shortFlag + ", ");
        } else {
          _ref2 = "    ";
        }(letPart = _ref2);
        _res.push(lines.push(("  " + letPart + rule.longFlag + spaces + rule.description)));
      }
      _res;
      return ("\n" + lines.join("\n") + "\n");
    }));
    return OptionParser;
  })()));
  (long_flag = /^(--\w[\w\-]*)/);
  (short_flag = /^(-\w)$/);
  (multi_flag = /^-(\w{2,})/);
  (optional = /\[(\w+(\*?))\]/);

  function buildRules(rules) {
    var tuple, _i, _res, _ref, _ref0;
    _res = [];
    _ref = rules;
    for (_i = 0; _i < _ref.length; ++_i) {
      tuple = _ref[_i];
      if ((tuple.length < 3)) {
        _ref0 = tuple.unshift(null);
      } else {
        _ref0 = undefined;
      }
      _ref0;
      _res.push(buildRule.apply(buildRule, [].concat(tuple)));
    }
    return _res;
  }
  buildRules;

  function buildRule(shortFlag, longFlag, description, options) {
    var match, _ref;
    if ((!(typeof options !== 'undefined' && options !== null))) {
      _ref = (options = {});
    } else {
      _ref = undefined;
    }
    _ref;
    (match = longFlag.match(optional));
    (longFlag = longFlag.match(long_flag)[1]);
    return {
      name: longFlag.substr(2),
      shortFlag: shortFlag,
      longFlag: longFlag,
      description: description,
      hasArgument: !!(match && match[1]),
      isList: !!(match && match[2])
    }
  }
  buildRule;

  function normaliseArguments(args) {
    var result, arg, match, l, _i, _res, _ref, _ref0, _i0, _res0, _ref1;
    (args = args.slice(0));
    (result = []);
    _res = [];
    _ref = args;
    for (_i = 0; _i < _ref.length; ++_i) {
      arg = _ref[_i];
      if ((match = arg.match(multi_flag))) {
        _res0 = [];
        _ref1 = match[1].split("");
        for (_i0 = 0; _i0 < _ref1.length; ++_i0) {
          l = _ref1[_i0];
          _res0.push(result.push(("-" + l)));
        }
        _ref0 = _res0;
      } else {
        _ref0 = result.push(arg);
      }
      _res.push(_ref0);
    }
    _res;
    return result;
  }
  return normaliseArguments;
}).call(this);