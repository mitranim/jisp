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
  var child_process, path, util, jisp, ext, fork, binary, _ref, _i, _res, _ref0, _ref1;
  (child_process = require("child_process"));
  (path = require("path"));
  (util = require("./util"));
  (jisp = require("./jisp"));

  function loadFile(module, filename) {
    return module._compile(jisp.compileFile(filename), filename);
  }
  loadFile;
  if (require.extensions) {
    _res = [];
    _ref0 = jisp.fileExtensions;
    for (_i = 0; _i < _ref0.length; ++_i) {
      ext = _ref0[_i];
      _res.push((require.extensions[ext] = loadFile));
    }
    _ref = _res;
  } else {
    _ref = undefined;
  }
  _ref;
  if (child_process) {
    (fork = child_process.fork);
    (binary = require.resolve("../../bin/jisp"));
    _ref1 = (child_process.fork = (function(path, args, options) {
      var _ref2, _ref3;
      if (util.isJisp(path)) {
        if ((!Array.isArray(args))) {
          (options = (args || {}));
          _ref3 = (args = []);
        } else {
          _ref3 = undefined;
        }
        _ref3;
        (args = [path].concat(args));
        _ref2 = (path = binary);
      } else {
        _ref2 = undefined;
      }
      _ref2;
      return fork(path, args, options);
    }));
  } else {
    _ref1 = undefined;
  }
  return _ref1;
}).call(this);