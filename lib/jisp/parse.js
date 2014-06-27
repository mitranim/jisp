(function() {
  var util;
  (util = require("./util"));

  function parse(form) {
    var i, val, key, _res, _ref, _ref0, _res0, _ref1;
    if (util.isList(form)) {
      _res = [];
      _ref = form;
      for (i = 0; i < _ref.length; ++i) {
        val = _ref[i];
        _res.push((form[i] = parse(val)));
      }
      _res;
      _ref0 = form;
    } else if (util.isHash(form)) {
      _res0 = [];
      _ref1 = form;
      for (key in _ref1) {
        val = _ref1[key];
        _res0.push((form[key] = parse(val)));
      }
      _res0;
      _ref0 = form;
    } else {
      (form = util.typify(form));
      _ref0 = /^#[\d]+$/.test(form) ? ("arguments[" + form.slice(1) + "]") : form;
    }
    return _ref0;
  }
  return (module.exports = parse);
}).call(this);