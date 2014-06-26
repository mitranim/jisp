(function() {
  var glob;
  (glob = (global || window));

  function car(iterable) {
    return iterable[0];
  }(exports.car = (glob.car = car));

  function head(iterable) {
    return iterable[0];
  }(exports.head = (glob.head = head));

  function cdr(iterable) {
    return iterable.slice(1);
  }(exports.cdr = (glob.cdr = cdr));

  function tail(iterable) {
    return iterable.slice(1);
  }(exports.tail = (glob.tail = tail));

  function init(iterable) {
    return iterable.slice(0, -1);
  }(exports.init = (glob.init = init));

  function last(iterable) {
    return iterable.slice(-1)[0];
  }(exports.last = (glob.last = last));

  function concat() {
    var res, lst, _i, _i0, _res, _ref;
    lists = 1 <= arguments.length ? [].slice.call(arguments, 0, _i = arguments.length - 0) : (_i = 0, []);
    (res = []);
    _res = [];
    _ref = lists;
    for (_i0 = 0; _i0 < _ref.length; ++_i0) {
      lst = _ref[_i0];
      _res.push((res = res.concat(lst)));
    }
    _res;
    return res;
  }(exports.concat = (glob.concat = concat));

  function list() {
    var _i;
    args = 1 <= arguments.length ? [].slice.call(arguments, 0, _i = arguments.length - 0) : (_i = 0, []);
    return [].concat(args);
  }(exports.list = (glob.list = list));

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
  return (exports.range = (glob.range = range));
}).call(this);