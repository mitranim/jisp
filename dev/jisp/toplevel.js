(function() {
  function concat() {
    var _res, lst, _i, _i0, _res0, _ref;
    lists = 1 <= arguments.length ? [].slice.call(arguments, 0, _i = arguments.length - 0) : (_i = 0, []);
    (_res = []);
    _res0 = [];
    _ref = lists;
    for (_i0 = 0; _i0 < _ref.length; ++_i0) {
      lst = _ref[_i0];
      _res0.push((_res = _res.concat(lst)));
    }
    _res0;
    return _res;
  }(exports.concat = concat);

  function list() {
    var _i;
    args = 1 <= arguments.length ? [].slice.call(arguments, 0, _i = arguments.length - 0) : (_i = 0, []);
    return [].concat(args);
  }(exports.list = list);

  function range(start, end) {
    var a, _ref, _res, _ref0;
    if ((!(typeof end !== 'undefined' && end !== null))) {
      (end = start);
      _ref = (start = 0);
    } else {
      _ref = undefined;
    }
    _ref;
    _res = [];
    while (true) {
      if ((start <= end)) {
        (a = start);
        ++start;
        _ref0 = a;
      } else {
        break;
        _ref0 = undefined;
      }
      _res.push(_ref0);
    }
    return _res;
  }
  return (exports.range = range);
}).call(this);