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
      .replace(/:/g, " : ")
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
  return tokenise;
}).call(this);