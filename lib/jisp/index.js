(function() {
  var key, val, _res, _ref;
  _res = [];
  _ref = require("./jisp");
  for (key in _ref) {
    val = _ref[key];
    _res.push((exports[key] = val));
  }
  return _res;
}).call(this);