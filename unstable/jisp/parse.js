(function() {
  var util;
  (util = require("./util"));

  function parse(form) {
    var i, val, key, _ref, _res, _ref0, _res0, _ref1, _ref2;
    if (util.isList(form)) {
      _res = [];
      _ref0 = form;
      for (i = 0; i < _ref0.length; ++i) {
        val = _ref0[i];
        _res.push((form[i] = parse(val)));
      }
      _res;
      _ref = form;
    } else if (util.isHash(form)) {
      _res0 = [];
      _ref1 = form;
      for (key in _ref1) {
        val = _ref1[key];
        _res0.push((form[key] = parse(val)));
      }
      _res0;
      _ref = form;
    } else {
      (form = util.typify(form)); if (/^#[\d]+$/.test(form)) {
        _ref2 = ("arguments[" + form.slice(1) + "]");
      } else {
        _ref2 = form;
      }
      _ref = _ref2;
    }
    return _ref;
  }
  return (module.exports = parse);
}).call(this);