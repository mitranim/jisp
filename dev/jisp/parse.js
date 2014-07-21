(function() {
  var utils;
  utils = require("./utils");

  function parse(form) {
    var i, val, key, _ref, _ref0, _ref1;
    if (utils.isList(form)) {
      _ref = form;
      for (i = 0; i < _ref.length; ++i) {
        val = _ref[i];
        form[i] = parse(val);
      }
      _ref0 = form;
    } else if (utils.isHash(form)) {
      _ref1 = form;
      for (key in _ref1) {
        val = _ref1[key];
        form[key] = parse(val);
      }
      _ref0 = form;
    } else {
      form = utils.typify(form);
      _ref0 = (/^#(\d+)/.test(form) ? form.replace(/^#(\d+)/, "arguments[$1]") : form);
    }
    return _ref0;
  }
  return module.exports = parse;
}).call(this);