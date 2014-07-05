(function() {
  var child_process, path, util, jisp, ext, _i, _res, _ref;
  child_process = require("child_process");
  path = require("path");
  util = require("./util");
  jisp = require("./jisp");

  function loadFile(module, filename) {
    return module._compile(jisp.compileFile(filename), filename);
  }
  loadFile;
  return
    if (require.extensions) {
      _res = [];
      _ref = jisp.fileExtensions;
      for (_i = 0; _i < _ref.length; ++_i) {
        ext = _ref[_i];
        _res.push((require.extensions[ext] = loadFile));
      }
      _res;
    } else {}
}).call(this);