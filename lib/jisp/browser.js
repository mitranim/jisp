(function() {
  var jisp, compile;
  jisp = require("./jisp");
  jisp.require = require;
  compile = jisp.compile;
  jisp.eval = (function(code, options) {
    !(typeof options !== 'undefined') ? options = {} : undefined;
    options.wrap = false;
    return eval(compile(code, options));
  });
  jisp.run = (function(code, options) {
    var compiled;
    !(typeof options !== 'undefined') ? options = {} : undefined;
    options.wrap = false;
    compiled = compile(code, options);
    return Function(compile(code, options))();
  });
  if (typeof window === 'undefined') {}
  jisp.load = (function(url, callback, options, hold) {
    var xhr;
    !(typeof options !== 'undefined') ? options = {} : undefined;
    !(typeof hold !== 'undefined') ? hold = false : undefined;
    options.sourceFiles = [url];
    xhr = (window.ActiveXObject ? new window.ActiveXObject("Microsoft.XMLHTTP") : new window.XMLHttpRequest());
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
      return (callback ? callback(param) : undefined);
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