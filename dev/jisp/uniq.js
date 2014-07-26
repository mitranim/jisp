(function() {
  var utils;
  utils = require("./utils");

  function Uniq(uniq, store) {
    var of, name, _ref;
    this.parent = uniq;
    this.store = {};
    if (store) {
      _ref = store;
      for (of in _ref) {
        name = _ref[of];
        this.store[of] = name;
      }
    }
    return this;
  }
  Uniq;
  Uniq.prototype.find = (function(func) {
    var uniq, ref, _ref;
    uniq = this;
    while (typeof uniq !== 'undefined') {
      if ((ref = func.call(uniq))) {
        _ref = undefined;
        break;
      } else {
        _ref = (uniq = uniq.parent);
      }
      _ref;
    }
    return ref;
  });
  Uniq.prototype.findOut = (function(func) {
    return (((typeof this !== 'undefined') && (typeof this.parent !== 'undefined')) ? this.parent.find(func) : undefined);
  });
  Uniq.prototype.has = (function(key) {
    return ([].indexOf.call(Object.keys(this.store), key) >= 0);
  });
  Uniq.prototype.conflict = (function(key) {
    return this.findOut((function() {
      return this.has(key);
    }));
  });
  Uniq.prototype.resolve = (function(key) {
    var oldkey;
    oldkey = key;
    while (this.conflict(key)) {
      key = utils.plusname(key);
    }
    return (this.store[key] = (this.store[oldkey] = (function(name) {
      return name.replace(RegExp("^" + oldkey), key);
    })));
  });
  Uniq.prototype.checkAndReplace = (function(name) {
    var key;
    key = utils.getServicePart(name);
    if (!this.has(key)) this.resolve(key);
    return this.store[key](name);
  });
  return module.exports = Uniq;
})['call'](this);