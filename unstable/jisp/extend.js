(function() {
  (Object.prototype.toString = (function(args) {
    var res, key, val, _i, _res, _ref;
    args = 1 <= arguments.length ? [].slice.call(arguments, 0, _i = arguments.length - 0) : (_i = _i, []);
    (res = "");
    _res = [];
    _ref = this;
    for (key in _ref) {
      val = _ref[key];
      _res.push((res += (key + ": " + val + ", ")))
    }
    _res;
    return ("{ " + res.slice(0, (res.length - 2)) + " }");
  }));
  (Array.prototype.toString = (function() {
    var res, val, _i, _res, _ref;
    (res = "");
    _res = [];
    _ref = this;
    for (_i = 0; _i < _ref.length; ++_i) {
      val = _ref[_i];
      _res.push((res += (val + ", ")))
    }
    _res;
    return ("[ " + res.slice(0, (res.length - 2)) + " ]");
  }));
  return (Array.prototype.spread = (function() {
    var res;
    (res = this.toString());
    (res = res.slice(2));
    return (res = res.slice(0, (res.length - 2)));
  }));
}).call(this)