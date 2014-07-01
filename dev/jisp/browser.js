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