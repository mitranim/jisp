(function() {
  var key, val, _ref;
  _ref = require("./jisp");
  return
    for (key in _ref) {
      val = _ref[key];
      (exports[key] = val);
    }
}).call(this);