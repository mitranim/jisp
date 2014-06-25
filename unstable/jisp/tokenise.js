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
    var mask, _ref;
    if (((mask = str.match(re)) && (mask[0].length > 0))) {
      _ref = mask[0];
    } else {
      _ref = null;
    }
    return _ref;
  }
  match;

  function tokenise(str) {
    var mask, _res, _ref, _ref0, _ref1;
    (tokens = []);
    _res = [];
    while (((str = str.trim()).length > 0)) {
      if ((mask = match(str, recode))) {
        (_ref0 = tokens).push.apply(_ref0, [].concat(grate(mask)));
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
        (_ref1 = tokens).push.apply(_ref1, [].concat(grate(str)));
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