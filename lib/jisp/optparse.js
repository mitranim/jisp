(function() {
  var repeat, OptionParser, long_flag, short_flag, multi_flag, optional;
  repeat = require("./utils").repeat;
  exports.OptionParser = (OptionParser = (function() {
    function OptionParser(rules, banner) {
      this.banner = banner;
      this.rules = buildRules(rules);
      return this;
    }
    OptionParser;
    OptionParser.prototype.parse = (function(args) {
      var options, skippingArgument, originalArgs, i, arg, pos, isOption, seenNonOptionArg, matchedRule, rule, value, _ref, _i, _ref0;
      options = {
        arguments: []
      };
      skippingArgument = false;
      originalArgs = args;
      args = normaliseArguments(args);
      _ref = args;
      for (i = 0; i < _ref.length; ++i) {
        arg = _ref[i];
        if (skippingArgument) {
          skippingArgument = false;
          continue;
        }
        if ((arg === "--")) {
          pos = originalArgs.indexOf("--");
          options.arguments = options.arguments.concat(originalArgs.slice(pos + 1));
          break;
        }
        isOption = !!(arg.match(long_flag) || arg.match(short_flag));
        seenNonOptionArg = options.arguments.length > 0;
        if (!seenNonOptionArg) {
          matchedRule = false;
          _ref0 = this.rules;
          for (_i = 0; _i < _ref0.length; ++_i) {
            rule = _ref0[_i];
            if ((arg === rule.shortFlag || arg === rule.longFlag)) {
              value = true;
              if (rule.hasArgument) {
                skippingArgument = true;
                value = args[i + 1];
              }
              options[rule.name] = (rule.isList ? options[rule.name] || [].concat(value) : value);
              matchedRule = true;
              break;
            }
          }
          if ((isOption && !matchedRule)) throw new Error(("unrecognised option: " + arg));
        }
        if ((seenNonOptionArg || !isOption)) options.arguments.push(arg);
      }
      return options;
    });
    OptionParser.prototype.help = (function() {
      var lines, rule, spaces, letPart, _i, _ref;
      lines = [];
      if (this.banner) lines.unshift(this.banner + "\n");
      _ref = this.rules;
      for (_i = 0; _i < _ref.length; ++_i) {
        rule = _ref[_i];
        spaces = 15 - rule.longFlag.length;
        spaces = ((spaces > 0) ? repeat(" ", spaces) : "");
        letPart = (rule.shortFlag ? (rule.shortFlag + ", ") : "    ");
        lines.push("  " + letPart + rule.longFlag + spaces + rule.description);
      }
      return ("\n" + lines.join("\n") + "\n");
    });
    return OptionParser;
  })());
  long_flag = /^(--\w[\w\-]*)/;
  short_flag = /^(-\w)$/;
  multi_flag = /^-(\w{2,})/;
  optional = /\[(\w+(\*?))\]/;

  function buildRules(rules) {
    var tuple, _i, _res, _ref, _ref0;
    _res = [];
    _ref = rules;
    for (_i = 0; _i < _ref.length; ++_i) {
      tuple = _ref[_i];
      if ((tuple.length < 3)) tuple.unshift(null);
      if (typeof(_ref0 = buildRule.apply(buildRule, [].concat(tuple))) !== 'undefined') _res.push(_ref0);
    }
    return _res;
  }
  buildRules;

  function buildRule(shortFlag, longFlag, description, options) {
    var match;
    if ((typeof options === 'undefined')) options = {};
    match = longFlag.match(optional);
    longFlag = longFlag.match(long_flag)[1];
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
    var result, arg, match, l, _i, _ref, _i0, _ref0;
    args = args.slice(0);
    result = [];
    _ref = args;
    for (_i = 0; _i < _ref.length; ++_i) {
      arg = _ref[_i];
      if ((match = arg.match(multi_flag))) {
        _ref0 = match[1].split("");
        for (_i0 = 0; _i0 < _ref0.length; ++_i0) {
          l = _ref0[_i0];
          result.push("-" + l);
        }
      } else {
        result.push(arg);
      }
    }
    return result;
  }
  return normaliseArguments;
}).call(this);