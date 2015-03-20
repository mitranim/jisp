(function() {
  function concat() {
    var _res, lst, _i, _i0, _ref;
    var lists = 1 <= arguments.length ? [].slice.call(arguments, 0, _i = arguments.length - 0) : (_i = 0, []);
    _res = [];
    _ref = lists;
    for (_i0 = 0; _i0 < _ref.length; ++_i0) {
      lst = _ref[_i0];
      _res = _res.concat(lst);
    }
    return _res;
  }
  exports.concat = concat;

  function list() {
    var _i;
    var args = 1 <= arguments.length ? [].slice.call(arguments, 0, _i = arguments.length - 0) : (_i = 0, []);
    return [].concat(args);
  }
  exports.list = list;

  function range(start, end) {
    var a, _res, _ref;
    if ((typeof end === 'undefined')) {
      end = start;
      start = 0;
    }
    _res = [];
    while (true) {
      if ((start <= end)) {
        a = start;
        ++start;
        _ref = a;
      } else {
        _ref = undefined;
        break;
      }
      if (typeof _ref !== 'undefined') _res.push(_ref);
    }
    return _res;
  }
  return exports.range = range;
})['call'](this);