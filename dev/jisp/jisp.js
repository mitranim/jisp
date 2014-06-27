(function() {
  function last(iterable) {
    return iterable.slice(-1)[0];
  }

  function init(iterable) {
    return iterable.slice(0, -1);
  }

  function car(iterable) {
    return iterable[0];
  }

  function cdr(iterable) {
    return iterable.slice(1);
  }

  function list() {
    var _i;
    args = 1 <= arguments.length ? [].slice.call(arguments, 0, _i = arguments.length - 0) : (_i = 0, []);
    return [].concat(args);
  }

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
  var vm, fs, path, beautify, toplevel, util, ops, operators, opFuncs, tokenise, lex, parse, pr, spr, render, isAtom, isHash, isList, isVarName, isIdentifier, assertExp, specials, macros;
  (exports.version = "0.0.14");
  (vm = require("vm"));
  (fs = require("fs"));
  (path = require("path"));
  (beautify = require("js-beautify"));
  (toplevel = require("./toplevel"));
  (util = require("./util"));
  (ops = require("./operators"));
  (operators = ops.operators);
  (opFuncs = ops.opFuncs);
  (tokenise = require("./tokenise"));
  (lex = require("./lex"));
  (parse = require("./parse"));
  (pr = util.pr);
  (spr = util.spr);
  (render = util.render);
  (isAtom = util.isAtom);
  (isHash = util.isHash);
  (isList = util.isList);
  (isVarName = util.isVarName);
  (isIdentifier = util.isIdentifier);
  (assertExp = util.assertExp);

  function plusname(name) {
    return isNaN(Number(last(name))) ? (name + 0) : (init(name) + (1 + Number(last(name))));
  }
  plusname;

  function declareVar(name, scope) {
    var _ref;
    if (([].indexOf.call(scope.hoist, name) >= 0)) {
      _ref = scope;
    } else {
      scope.hoist.push(name);
      _ref = scope;
    }
    return _ref;
  }
  declareVar;

  function declareService(name, scope) {
    var _res;
    _res = [];
    while ((([].indexOf.call(scope.hoist, name) >= 0) || ([].indexOf.call(scope.service, name) >= 0))) {
      _res.push((name = plusname(name)));
    }
    _res;
    scope.service.push(name);
    return [name, scope];
  }
  declareService;

  function hasSpread(form) {
    return (isList(form) && ((car(form) === "spread")));
  }
  hasSpread;

  function compileResolve(form, buffer, scope, opts) {
    var compiled, i, name, newname, re, subst, str, _ref, _i, _res, _ref0, _res0, _res1, _ref1, _ref2;
    (_ref = compileForm(form, scope, opts));
    compiled = _ref[0];
    scope = _ref[1];
    _res = [];
    _ref0 = scope.service;
    for (i in _ref0) {
      name = _ref0[i];
      if (([].indexOf.call(scope.hoist, name) >= 0)) {
        (newname = name);
        _res0 = [];
        while (([].indexOf.call(scope.hoist, newname) >= 0)) {
          _res0.push((newname = plusname(newname)));
        }
        _res0;
        (scope.service[i] = newname);
        (re = RegExp(("(?=(?:[^$_A-Za-z0-9]{1}|^)" + name + "(?:[^$_A-Za-z0-9]{1}|$))([^$A-Za-z0-9]|^)" + name), "g"));
        (subst = ("$1" + newname));
        _res1 = [];
        _ref1 = buffer;
        for (i = 0; i < _ref1.length; ++i) {
          str = _ref1[i];
          _res1.push(((typeof str !== 'undefined' && str !== null) && (((typeof str) === "string"))) ? (buffer[i] = str.replace(re, subst)) : undefined);
        }
        _ref2 = _res1;
      } else {
        _ref2 = undefined;
      }
      _res.push(_ref2);
    }
    _res;
    return [compiled, buffer, scope];
  }
  compileResolve;

  function compileAdd(form, buffer, scope, opts) {
    var compiled, _ref, _i;
    (_ref = compileResolve(form, buffer, scope, opts));
    compiled = _ref[0];
    buffer = _ref[1];
    scope = _ref[2];
    buffer.push.apply(buffer, [].concat(compiled));
    return [buffer, scope];
  }
  compileAdd;

  function compileGetLast(form, buffer, scope, opts) {
    var lastItem, _ref, _i;
    (_ref = compileAdd(form, buffer, scope, opts));
    buffer = _ref[0];
    scope = _ref[1];
    (lastItem = buffer.pop());
    return [lastItem, buffer, scope];
  }
  compileGetLast;

  function splitName(name) {
    var obj, method, _ref;
    if ((obj = name.match(/^[$_A-Za-z]{1}$|^[$_A-Za-z]+[$_\w]*(?:[$_\w](?!\.))+$|^(?:[$_.\[\]\w])+(?=\.|\[)+/))) {
      (obj = obj[0]);
      (method = name.replace(obj, ""));
      _ref = [obj, method];
    } else {
      _ref = [name, ""];
    }
    return _ref;
  }
  splitName;

  function returnify(form) {
    var _ref;
    if ((isAtom(form) || isHash(form))) {
      _ref = ["return", form];
    } else if ((isList(form) && ((car(form) !== "return")))) {
      _ref = ["return", form];
    } else {
      _ref = form;
    }
    return _ref;
  }
  returnify;

  function getArgNames(args) {
    var arr, arg, _i, _res, _ref, _ref0;
    (arr = []);
    _res = [];
    _ref = args;
    for (_i = 0; _i < _ref.length; ++_i) {
      arg = _ref[_i];
      if ((isAtom(arg) && isVarName(arg))) {
        _ref0 = arr.push(arg);
      } else if ((isList(arg) && isVarName(car(arg)) && (!((car(arg) === "spread"))))) {
        _ref0 = arr.push(car(arg));
      } else {
        _ref0 = undefined;
      }
      _res.push(_ref0);
    }
    _res;
    return arr;
  }
  getArgNames;

  function compileForm(form, scope, opts) {
    var buffer, first, i, arg, argsSpread, name, method, collector, key, val, _ref, _ref0, _i, _ref1, _i0, _ref2, _res, _ref3, _ref4, _i1, _ref5, _i2, _ref6, _ref7, _i3, _ref8, _ref9, _ref10, _i4, _ref11, _i5, _ref12, _ref13, _ref14, _ref15, _ref16, _res0, _ref17, _ref18, _i6;
    (!(typeof opts !== 'undefined' && opts !== null)) ? (opts = ({})) : undefined;
    if ((isList(form) && util.isBlankObject(form))) {
      _ref15 = [
        [""], scope
      ];
    } else if (isAtom(form)) {
      if ((([].indexOf.call(Object.keys(toplevel), form) >= 0) || ([].indexOf.call(Object.keys(macros), form) >= 0))) {
        assertExp(form, isVarName, "valid identifier");
        _ref16 = (scope = declareVar(form, scope));
      } else if (([].indexOf.call(Object.keys(opFuncs), form) >= 0)) {
        assertExp(form, isVarName, "valid identifier");
        (scope = declareVar(form, scope));
        _ref16 = (form = opFuncs[form].name);
      } else {
        _ref16 = undefined;
      }
      _ref16;
      _ref15 = [
        [form], scope
      ];
    } else if (isHash(form)) {
      (buffer = []);
      _res0 = [];
      _ref17 = form;
      for (key in _ref17) {
        val = _ref17[key];
        (_ref18 = compileGetLast(val, buffer, scope, opts));
        form[key] = _ref18[0];
        buffer = _ref18[1];
        _res0.push(scope = _ref18[2]);
      }
      _res0;
      buffer.push(form);
      _ref15 = [buffer, scope];
    } else {
      if ((!isList(form))) {
        throw Error(("expecting list, got: " + pr(form)));
        _ref = undefined;
      } else {
        _ref = undefined;
      }
      _ref;
      (buffer = []);
      (form = form.slice());
      if (([].indexOf.call(Object.keys(specials), car(form)) >= 0)) {
        (_ref0 = specials[car(form)](form, scope, opts));
        buffer = _ref0[0];
        _ref14 = scope = _ref0[1];
      } else if (([].indexOf.call(Object.keys(macros), car(form)) >= 0)) {
        _ref14 = (form = expandMacros(form));
      } else {
        (_ref1 = compileGetLast(form.shift(), buffer, scope, opts));
        first = _ref1[0];
        buffer = _ref1[1];
        scope = _ref1[2];
        if (([].indexOf.call(Object.keys(toplevel), first) >= 0)) {
          assertExp(first, isVarName, "valid identifier");
          _ref2 = (scope = declareVar(first, scope));
        } else {
          _ref2 = undefined;
        }
        _ref2;
        _res = [];
        _ref3 = form;
        for (i = 0; i < _ref3.length; ++i) {
          arg = _ref3[i];
          if (hasSpread(arg)) {
            (argsSpread = true);
            (_ref4 = compileGetLast(arg, buffer, scope, opts));
            arg = _ref4[0];
            buffer = _ref4[1];
            scope = _ref4[2];
            _ref6 = (form[i] = ["spread", arg]);
          } else {
            (_ref5 = compileGetLast(arg, buffer, scope, opts));
            arg = _ref5[0];
            buffer = _ref5[1];
            scope = _ref5[2];
            _ref6 = (form[i] = arg);
          }
          _res.push(_ref6);
        }
        _res;
        if ((!(typeof argsSpread !== 'undefined' && argsSpread !== null))) {
          _ref13 = ([].indexOf.call(Object.keys(operators), first) >= 0) ? buffer.push.apply(buffer, [].concat(operators[first](form))) : buffer.push((pr(first) + "(" + spr(form) + ")"));
        } else {
          (form = ["quote", form]);
          (_ref7 = compileGetLast(form, buffer, scope, opts));
          form = _ref7[0];
          buffer = _ref7[1];
          scope = _ref7[2];
          if (([].indexOf.call(Object.keys(operators), first) >= 0)) {
            if ((([].indexOf.call(Object.keys(opFuncs), first) >= 0) && spr(opFuncs[first]))) {
              assertExp(first, isVarName, "valid identifier");
              (scope = declareVar(first, scope));
              _ref8 = (first = opFuncs[first].name);
            } else {
              throw Error((pr(first) + " can't spread arguments (yet)"));
              _ref8 = undefined;
            }
            _ref9 = _ref8;
          } else {
            _ref9 = undefined;
          }
          _ref9;
          (_ref10 = splitName(first));
          name = _ref10[0];
          method = _ref10[1];
          if (isIdentifier(name)) {
            _ref12 = buffer.push((name + method + ".apply(" + name + ", " + pr(form) + ")"));
          } else {
            (_ref11 = declareService("_ref", scope));
            collector = _ref11[0];
            scope = _ref11[1];
            _ref12 = buffer.push(("(" + collector + " = " + name + ")" + method + ".apply(" + collector + ", " + pr(form) + ")"));
          }
          _ref13 = _ref12;
        }
        _ref14 = _ref13;
      }
      _ref14;
      _ref15 = [buffer, scope];
    }
    return _ref15;
  }
  compileForm;
  (specials = ({}));
  (specials.do = (function(form, scope, opts) {
    var buffer, formName, isTopLevel, outerScope, exp, ref, vars, funcs, dec, args, name, func, _ref, _ref0, _i, _res, _ref1, _ref2, _i0, _ref3, _i1, _ref4, _ref5, _i2, _res0, _ref6, _i3, _res1, _ref7, _res2, _ref8, _ref9, _res3, _ref10, _ref11, _i4, _res4, _ref12, _ref13, _ref14;
    (!(typeof opts !== 'undefined' && opts !== null)) ? (opts = ({})) : undefined;
    (buffer = []);
    (form = form.slice());
    (formName = form.shift());
    if (opts.toplevel) {
      (isTopLevel = true);
      _ref = (delete opts.toplevel);
    } else {
      _ref = undefined;
    }
    _ref;
    if (isTopLevel) {
      (outerScope = scope);
      _ref0 = (scope = ({
        hoist: outerScope.hoist.slice(),
        service: outerScope.service.slice()
      }));
    } else {
      _ref0 = undefined;
    }
    _ref0;
    _res = [];
    _ref1 = form;
    for (_i = 0; _i < _ref1.length; ++_i) {
      exp = _ref1[_i];
      if ((!(typeof exp !== 'undefined' && exp !== null))) {
        _ref5 = buffer.push(exp);
      } else {
        if (((isList(car(exp)) && ((car(exp).length === 2)) && ((car(car(exp)) === "get"))) || util.isPropSyntax(car(exp)))) {
          (ref = buffer.pop());
          (!(typeof ref !== 'undefined' && ref !== null)) ? (ref = "") : undefined;
          (_ref2 = compileAdd(exp, buffer, scope, opts));
          buffer = _ref2[0];
          scope = _ref2[1];
          _ref4 = buffer.push((ref + buffer.pop()));
        } else {
          (_ref3 = compileAdd(exp, buffer, scope, opts));
          buffer = _ref3[0];
          _ref4 = scope = _ref3[1];
        }
        _ref5 = _ref4;
      }
      _res.push(_ref5);
    }
    _res;
    if (isTopLevel) {
      (vars = []);
      (funcs = []);
      (dec = "var ");
      (!(typeof args !== 'undefined' && args !== null)) ? (args = []) : undefined;
      _res0 = [];
      _ref6 = scope.hoist;
      for (_i2 = 0; _i2 < _ref6.length; ++_i2) {
        name = _ref6[_i2];
        _res0.push(((!([].indexOf.call(outerScope.hoist, name) >= 0)) && (!([].indexOf.call(args, name) >= 0))) ? (([].indexOf.call(Object.keys(toplevel), name) >= 0) || ([].indexOf.call(Object.keys(opFuncs), name) >= 0) || ([].indexOf.call(Object.keys(macros), name) >= 0)) ? funcs.push(name) : vars.push(name) : undefined);
      }
      _res0;
      _res1 = [];
      _ref7 = scope.service;
      for (_i3 = 0; _i3 < _ref7.length; ++_i3) {
        name = _ref7[_i3];
        _res1.push((!([].indexOf.call(outerScope.service, name) >= 0)) ? vars.push(name) : undefined);
      }
      _res1;
      _res2 = [];
      while ((vars.length > 0)) {
        (name = vars.shift());
        if (([].indexOf.call(vars, name) >= 0)) {
          throw Error(("compiler error: duplicate var in declarations:" + name));
          _ref8 = undefined;
        } else {
          _ref8 = undefined;
        }
        _ref8;
        _res2.push((dec += (name + ", ")));
      }
      _res2;
      if ((dec.length > 4)) {
        (dec = dec.slice(0, (dec.length - 2)));
        _ref9 = buffer.unshift(dec);
      } else {
        _ref9 = undefined;
      }
      _ref9;
      if (((typeof isTopLevel !== 'undefined' && isTopLevel !== null) && isTopLevel)) {
        _res3 = [];
        while ((funcs.length > 0)) {
          (func = funcs.pop());
          if (([].indexOf.call(funcs, func) >= 0)) {
            throw Error(("compiler error: duplicate func in declarations:" + func));
            _ref10 = undefined;
          } else {
            _ref10 = undefined;
          }
          _ref10;
          if (([].indexOf.call(Object.keys(toplevel), func) >= 0)) {
            _ref11 = buffer.unshift(toplevel[func].toString());
          } else if (([].indexOf.call(Object.keys(macros), func) >= 0)) {
            _ref11 = buffer.unshift(("var " + func + " = " + macros[func] + ";"));
          } else if (([].indexOf.call(Object.keys(opFuncs), func) >= 0)) {
            _ref11 = buffer.unshift(("var " + opFuncs[func].name + " = " + opFuncs[func].func + ";"));
          } else {
            throw Error(("unrecognised func: " + pr(func)));
            _ref11 = undefined;
          }
          _res3.push(_ref11);
        }
        _ref13 = _res3;
      } else {
        _res4 = [];
        _ref12 = funcs;
        for (_i4 = 0; _i4 < _ref12.length; ++_i4) {
          func = _ref12[_i4];
          _res4.push((!([].indexOf.call(outerScope.hoist, func) >= 0)) ? outerScope.hoist.push(func) : undefined);
        }
        _ref13 = _res4;
      }
      _ref13;
      _ref14 = (scope = outerScope);
    } else {
      _ref14 = undefined;
    }
    _ref14;
    return Array(buffer, scope);
  }));
  (specials.quote = (function(form, scope, opts) {
    var buffer, formName, arr, res, exp, key, _ref, _ref0, _i, _res, _ref1, _ref2, _i0, _ref3, _i1, _ref4, _ref5, _ref6, _i2, _ref7, _ref8, _ref9, _i3, _ref10, _i4, _ref11, _ref12, _ref13, _res0, _ref14, _ref15, _i5, _ref16, _i6, _ref17;
    (!(typeof opts !== 'undefined' && opts !== null)) ? (opts = ({})) : undefined;
    (buffer = []);
    (form = form.slice());
    (formName = form.shift());
    if ((form.length < 1)) {
      throw Error((pr(formName) + " expects no less than " + pr(1) + " arguments"));
      _ref = undefined;
    } else {
      _ref = undefined;
    }
    _ref;
    if ((form.length > 1)) {
      throw Error((pr(formName) + " expects no more than " + pr(1) + " arguments"));
      _ref0 = undefined;
    } else {
      _ref0 = undefined;
    }
    _ref0;
    (form = car(form));
    if ((isAtom(form) && (!util.isPrimitive(form)))) {
      _ref13 = buffer.push(JSON.stringify(form));
    } else if (isAtom(form)) {
      _ref13 = buffer.push(form);
    } else if (isHash(form)) {
      _res0 = [];
      _ref14 = form;
      for (key in _ref14) {
        exp = _ref14[key];
        if ((isAtom(exp) && (!opts.macro))) {
          (_ref15 = compileGetLast(exp, buffer, scope, opts));
          form[key] = _ref15[0];
          buffer = _ref15[1];
          _ref17 = scope = _ref15[2];
        } else {
          (_ref16 = compileGetLast(["quote", exp], buffer, scope, opts));
          form[key] = _ref16[0];
          buffer = _ref16[1];
          _ref17 = scope = _ref16[2];
        }
        _res0.push(_ref17);
      }
      _res0;
      _ref13 = buffer.push(form);
    } else {
      (arr = []);
      (res = "[]");
      _res = [];
      _ref1 = form;
      for (_i = 0; _i < _ref1.length; ++_i) {
        exp = _ref1[_i];
        if ((isList(exp) && ((car(exp) === "quote")) && isList(exp[1]) && ((exp[1].length === 0)))) {
          _ref5 = arr.push([]);
        } else if ((isList(exp) && ((car(exp) === "unquote")) && isList(exp[1]) && ((exp[1][0] === "spread")))) {
          (_ref6 = compileGetLast(car(cdr(exp)), buffer, scope, opts));
          exp = _ref6[0];
          buffer = _ref6[1];
          scope = _ref6[2];
          if ((typeof exp !== 'undefined' && exp !== null)) {
            if ((arr.length > 0)) {
              (res += (".concat(" + pr(arr) + ")"));
              _ref7 = (arr = []);
            } else {
              _ref7 = undefined;
            }
            _ref7;
            _ref8 = (res += (".concat(" + pr(exp) + ")"));
          } else {
            _ref8 = undefined;
          }
          _ref5 = _ref8;
        } else if ((isList(exp) && ((car(exp) === "quote") || (car(exp) === "unquote")))) {
          (_ref9 = compileGetLast(exp, buffer, scope, opts));
          exp = _ref9[0];
          buffer = _ref9[1];
          scope = _ref9[2];
          _ref5 = (typeof exp !== 'undefined' && exp !== null) ? arr.push(exp) : undefined;
        } else if ((isList(exp) && ((car(exp) === "spread")) && (!opts.macro))) {
          (_ref10 = compileGetLast(exp, buffer, scope, opts));
          exp = _ref10[0];
          buffer = _ref10[1];
          scope = _ref10[2];
          if ((typeof exp !== 'undefined' && exp !== null)) {
            if ((arr.length > 0)) {
              (res += (".concat(" + pr(arr) + ")"));
              _ref11 = (arr = []);
            } else {
              _ref11 = undefined;
            }
            _ref11;
            _ref12 = (res += (".concat(" + pr(exp) + ")"));
          } else {
            _ref12 = undefined;
          }
          _ref5 = _ref12;
        } else {
          if ((isAtom(exp) && (!opts.macro))) {
            (_ref2 = compileGetLast(exp, buffer, scope, opts));
            exp = _ref2[0];
            buffer = _ref2[1];
            _ref4 = scope = _ref2[2];
          } else {
            (_ref3 = compileGetLast(["quote", exp], buffer, scope, opts));
            exp = _ref3[0];
            buffer = _ref3[1];
            _ref4 = scope = _ref3[2];
          }
          _ref4;
          _ref5 = (typeof exp !== 'undefined' && exp !== null) ? arr.push(exp) : undefined;
        }
        _res.push(_ref5);
      }
      _res;
      (arr.length > 0) ? ((res === "[]")) ? (res = pr(arr)) : (res += (".concat(" + pr(arr) + ")")) : undefined;
      _ref13 = buffer.push(res);
    }
    _ref13;
    return Array(buffer, scope);
  }));
  (specials.unquote = (function(form, scope, opts) {
    var buffer, formName, _ref, _ref0, _ref1, _i, _ref2, _ref3, _i0;
    (!(typeof opts !== 'undefined' && opts !== null)) ? (opts = ({})) : undefined;
    (buffer = []);
    (form = form.slice());
    (formName = form.shift());
    if ((form.length < 1)) {
      throw Error((pr(formName) + " expects no less than " + pr(1) + " arguments"));
      _ref = undefined;
    } else {
      _ref = undefined;
    }
    _ref;
    if ((form.length > 1)) {
      throw Error((pr(formName) + " expects no more than " + pr(1) + " arguments"));
      _ref0 = undefined;
    } else {
      _ref0 = undefined;
    }
    _ref0;
    (form = car(form));
    if ((isList(form) && ((car(form) === "quote")))) {
      (_ref1 = compileGetLast(form, buffer, scope, opts));
      form = _ref1[0];
      buffer = _ref1[1];
      _ref2 = scope = _ref1[2];
    } else {
      _ref2 = undefined;
    }
    _ref2;
    (_ref3 = compileAdd(form, buffer, scope, opts));
    buffer = _ref3[0];
    scope = _ref3[1];
    return Array(buffer, scope);
  }));
  (specials["="] = (function(form, scope, opts) {
    var buffer, formName, left, right, ref, ind, spreads, i, name, spreadname, spreadind, _ref, _ref0, _i, _res, _ref1, _i0, _ref2, _i1, _ref3, _ref4, _ref5, _i2, _ref6, _i3, _res0, _ref7, _ref8, _ref9, _i4, _ref10, _ref11, _ref12, _ref13;
    (!(typeof opts !== 'undefined' && opts !== null)) ? (opts = ({})) : undefined;
    (buffer = []);
    (form = form.slice());
    (formName = form.shift());
    if ((form.length < 1)) {
      throw Error((pr(formName) + " expects no less than " + pr(1) + " arguments"));
      _ref = undefined;
    } else {
      _ref = undefined;
    }
    _ref;
    if (((form.length === 1))) {
      assertExp(car(form), isVarName, "valid identifier");
      (scope = declareVar(car(form), scope));
      (_ref0 = compileAdd(car(form), buffer, scope, opts));
      buffer = _ref0[0];
      _ref13 = scope = _ref0[1];
    } else {
      assertExp(form, (function() {
        return (((arguments[0].length % 2) === 0));
      }), "an even number of arguments");
      _res = [];
      while ((form.length > 0)) {
        (left = form.shift());
        (right = form.shift());
        (_ref1 = compileGetLast(right, buffer, scope, opts));
        right = _ref1[0];
        buffer = _ref1[1];
        scope = _ref1[2];
        if ((isList(left) && ((car(left) === "get")))) {
          (_ref2 = compileGetLast(left, buffer, scope, opts));
          left = _ref2[0];
          buffer = _ref2[1];
          scope = _ref2[2];
          _ref4 = buffer.push(("(" + pr(left) + " = " + pr(right) + ")"));
        } else if (isList(left)) {
          (_ref5 = declareService("_ref", scope, opts.function ? args : undefined));
          ref = _ref5[0];
          scope = _ref5[1];
          (_ref6 = declareService("_i", scope, opts.function ? args : undefined));
          ind = _ref6[0];
          scope = _ref6[1];
          buffer.push(("(" + ref + " = " + pr(right) + ")"));
          (spreads = 0);
          _res0 = [];
          _ref7 = left;
          for (i = 0; i < _ref7.length; ++i) {
            name = _ref7[i];
            if (((car(name) === "spread"))) {
              if ((++spreads > 1)) {
                throw Error("an assignment can only have one spread");
                _ref8 = undefined;
              } else {
                _ref8 = undefined;
              }
              _ref8;
              (_ref9 = compileGetLast(name, buffer, scope, opts));
              name = _ref9[0];
              buffer = _ref9[1];
              scope = _ref9[2];
              assertExp(name, isVarName, "valid identifier");
              (scope = declareVar(name, scope));
              (spreadname = name);
              (spreadind = i);
              _ref11 = buffer.push(("var " + spreadname + " = " + left.length + " <= " + ref + ".length ? [].slice.call(" + ref + ", " + spreadind + ", " + ind + " = " + ref + ".length - " + (left.length - spreadind - 1) + ") : (" + ind + " = " + spreadind + ", [])"));
            } else if ((!(typeof spreadname !== 'undefined' && spreadname !== null))) {
              if (isVarName(name)) {
                assertExp(name, isVarName, "valid identifier");
                _ref12 = (scope = declareVar(name, scope));
              } else {
                _ref12 = undefined;
              }
              _ref12;
              _ref11 = buffer.push((pr(name) + " = " + ref + "[" + i + "]"));
            } else {
              if (isVarName(name)) {
                assertExp(name, isVarName, "valid identifier");
                _ref10 = (scope = declareVar(name, scope));
              } else {
                _ref10 = undefined;
              }
              _ref10;
              _ref11 = buffer.push((pr(name) + " = " + ref + "[" + ind + "++]"));
            }
            _res0.push(_ref11);
          }
          _ref4 = _res0;
        } else {
          if (isVarName(left)) {
            assertExp(left, isVarName, "valid identifier");
            _ref3 = (scope = declareVar(left, scope));
          } else {
            _ref3 = undefined;
          }
          _ref3;
          assertExp(left, isIdentifier);
          _ref4 = buffer.push(("(" + pr(left) + " = " + pr(right) + ")"));
        }
        _res.push(_ref4);
      }
      _ref13 = _res;
    }
    _ref13;
    return Array(buffer, scope);
  }));
  (specials.fn = (function(form, scope, opts) {
    var buffer, formName, outerScope, args, body, optionals, spreads, i, arg, ind, name, restname, restind, rest, vars, funcs, dec, func, _ref, _i, _res, _ref0, _ref1, _ref2, _i0, _ref3, _i1, _ref4, _ref5, _ref6, _i2, _i3, _res0, _ref7, _i4, _res1, _ref8, _res2, _ref9, _ref10, _res3, _ref11, _ref12, _i5, _res4, _ref13, _ref14;
    (!(typeof opts !== 'undefined' && opts !== null)) ? (opts = ({})) : undefined;
    (buffer = []);
    (form = form.slice());
    (formName = form.shift());
    (outerScope = scope);
    (scope = ({
      hoist: outerScope.hoist.slice(),
      service: outerScope.service.slice()
    }));
    (_ref = form);
    var args = 2 <= _ref.length ? [].slice.call(_ref, 0, _i = _ref.length - 1) : (_i = 0, []);
    body = _ref[_i++];
    scope.hoist.push.apply(scope.hoist, [].concat(getArgNames(args)));
    (!(typeof body !== 'undefined' && body !== null)) ? (body = []) : undefined;
    (optionals = []);
    (spreads = 0);
    _res = [];
    _ref0 = args;
    for (i = 0; i < _ref0.length; ++i) {
      arg = _ref0[i];
      if (isList(arg)) {
        assertExp(arg, (function() {
          return ((arguments[0].length === 2));
        }), "optional or rest parameter");
        if (((car(arg) === "spread"))) {
          if ((++spreads > 1)) {
            throw Error("cannot define more than one rest parameter");
            _ref1 = undefined;
          } else {
            _ref1 = undefined;
          }
          _ref1;
          (_ref2 = declareService("_i", scope, opts.function ? args : undefined));
          ind = _ref2[0];
          scope = _ref2[1];
          (_ref3 = compileGetLast(arg, buffer, scope, opts));
          name = _ref3[0];
          buffer = _ref3[1];
          scope = _ref3[2];
          assertExp(name, isVarName, "valid identifier");
          (restname = name);
          (restind = i);
          (args[i] = restname);
          _ref4 = (rest = list((name + " = " + args.length + " <= arguments.length ? [].slice.call(arguments, " + i + ", " + ind + " = arguments.length - " + (args.length - i - 1) + ") : (" + ind + " = " + restind + ", [])")));
        } else {
          assertExp((name = car(arg)), isVarName, "valid parameter name");
          (args[i] = name);
          _ref4 = optionals.push(["if", ["not", ["?", name]],
            ["=", name, arg[1]]
          ]);
        }
        _ref5 = _ref4;
      } else if (restname) {
        _ref5 = rest.push((pr(arg) + " = arguments[" + ind + "++]"));
      } else {
        _ref5 = undefined;
      }
      _res.push(_ref5);
    }
    _res;
    (typeof restind !== 'undefined' && restind !== null) ? (args = args.slice(0, restind)) : undefined;
    (optionals.length > 0) ? (body = [].concat(["do"]).concat(optionals).concat([body])) : undefined;
    (body = returnify(body));
    (_ref6 = compileResolve(body, buffer, scope, opts));
    body = _ref6[0];
    buffer = _ref6[1];
    scope = _ref6[2];
    rest ? body.unshift.apply(body, [].concat(rest)) : undefined;
    (vars = []);
    (funcs = []);
    (dec = "var ");
    (!(typeof args !== 'undefined' && args !== null)) ? (args = []) : undefined;
    _res0 = [];
    _ref7 = scope.hoist;
    for (_i3 = 0; _i3 < _ref7.length; ++_i3) {
      name = _ref7[_i3];
      _res0.push(((!([].indexOf.call(outerScope.hoist, name) >= 0)) && (!([].indexOf.call(args, name) >= 0))) ? (([].indexOf.call(Object.keys(toplevel), name) >= 0) || ([].indexOf.call(Object.keys(opFuncs), name) >= 0) || ([].indexOf.call(Object.keys(macros), name) >= 0)) ? funcs.push(name) : vars.push(name) : undefined);
    }
    _res0;
    _res1 = [];
    _ref8 = scope.service;
    for (_i4 = 0; _i4 < _ref8.length; ++_i4) {
      name = _ref8[_i4];
      _res1.push((!([].indexOf.call(outerScope.service, name) >= 0)) ? vars.push(name) : undefined);
    }
    _res1;
    _res2 = [];
    while ((vars.length > 0)) {
      (name = vars.shift());
      if (([].indexOf.call(vars, name) >= 0)) {
        throw Error(("compiler error: duplicate var in declarations:" + name));
        _ref9 = undefined;
      } else {
        _ref9 = undefined;
      }
      _ref9;
      _res2.push((dec += (name + ", ")));
    }
    _res2;
    if ((dec.length > 4)) {
      (dec = dec.slice(0, (dec.length - 2)));
      _ref10 = body.unshift(dec);
    } else {
      _ref10 = undefined;
    }
    _ref10;
    if (((typeof isTopLevel !== 'undefined' && isTopLevel !== null) && isTopLevel)) {
      _res3 = [];
      while ((funcs.length > 0)) {
        (func = funcs.pop());
        if (([].indexOf.call(funcs, func) >= 0)) {
          throw Error(("compiler error: duplicate func in declarations:" + func));
          _ref11 = undefined;
        } else {
          _ref11 = undefined;
        }
        _ref11;
        if (([].indexOf.call(Object.keys(toplevel), func) >= 0)) {
          _ref12 = body.unshift(toplevel[func].toString());
        } else if (([].indexOf.call(Object.keys(macros), func) >= 0)) {
          _ref12 = body.unshift(("var " + func + " = " + macros[func] + ";"));
        } else if (([].indexOf.call(Object.keys(opFuncs), func) >= 0)) {
          _ref12 = body.unshift(("var " + opFuncs[func].name + " = " + opFuncs[func].func + ";"));
        } else {
          throw Error(("unrecognised func: " + pr(func)));
          _ref12 = undefined;
        }
        _res3.push(_ref12);
      }
      _ref14 = _res3;
    } else {
      _res4 = [];
      _ref13 = funcs;
      for (_i5 = 0; _i5 < _ref13.length; ++_i5) {
        func = _ref13[_i5];
        _res4.push((!([].indexOf.call(outerScope.hoist, func) >= 0)) ? outerScope.hoist.push(func) : undefined);
      }
      _ref14 = _res4;
    }
    _ref14;
    (scope = outerScope);
    buffer.push(("(function(" + spr(args) + ") {" + render(body) + " })"));
    return Array(buffer, scope);
  }));
  (specials.def = (function(form, scope, opts) {
    var buffer, formName, outerScope, fname, args, body, optionals, spreads, i, arg, ind, name, restname, restind, rest, vars, funcs, dec, func, _ref, _i, _res, _ref0, _ref1, _ref2, _i0, _ref3, _i1, _ref4, _ref5, _ref6, _i2, _i3, _res0, _ref7, _i4, _res1, _ref8, _res2, _ref9, _ref10, _res3, _ref11, _ref12, _i5, _res4, _ref13, _ref14;
    (!(typeof opts !== 'undefined' && opts !== null)) ? (opts = ({})) : undefined;
    (buffer = []);
    (form = form.slice());
    (formName = form.shift());
    (outerScope = scope);
    (scope = ({
      hoist: outerScope.hoist.slice(),
      service: outerScope.service.slice()
    }));
    (_ref = form);
    fname = _ref[0];
    var args = 3 <= _ref.length ? [].slice.call(_ref, 1, _i = _ref.length - 1) : (_i = 1, []);
    body = _ref[_i++];
    assertExp(fname, isVarName, "valid function name");
    scope.hoist.push.apply(scope.hoist, [].concat(getArgNames(args)));
    (!(typeof body !== 'undefined' && body !== null)) ? (body = []) : undefined;
    (optionals = []);
    (spreads = 0);
    _res = [];
    _ref0 = args;
    for (i = 0; i < _ref0.length; ++i) {
      arg = _ref0[i];
      if (isList(arg)) {
        assertExp(arg, (function() {
          return ((arguments[0].length === 2));
        }), "optional or rest parameter");
        if (((car(arg) === "spread"))) {
          if ((++spreads > 1)) {
            throw Error("cannot define more than one rest parameter");
            _ref1 = undefined;
          } else {
            _ref1 = undefined;
          }
          _ref1;
          (_ref2 = declareService("_i", scope, opts.function ? args : undefined));
          ind = _ref2[0];
          scope = _ref2[1];
          (_ref3 = compileGetLast(arg, buffer, scope, opts));
          name = _ref3[0];
          buffer = _ref3[1];
          scope = _ref3[2];
          assertExp(name, isVarName, "valid identifier");
          (restname = name);
          (restind = i);
          (args[i] = restname);
          _ref4 = (rest = list((name + " = " + args.length + " <= arguments.length ? [].slice.call(arguments, " + i + ", " + ind + " = arguments.length - " + (args.length - i - 1) + ") : (" + ind + " = " + restind + ", [])")));
        } else {
          assertExp((name = car(arg)), isVarName, "valid parameter name");
          (args[i] = name);
          _ref4 = optionals.push(["if", ["not", ["?", name]],
            ["=", name, arg[1]]
          ]);
        }
        _ref5 = _ref4;
      } else if (restname) {
        _ref5 = rest.push((pr(arg) + " = arguments[" + ind + "++]"));
      } else {
        _ref5 = undefined;
      }
      _res.push(_ref5);
    }
    _res;
    (typeof restind !== 'undefined' && restind !== null) ? (args = args.slice(0, restind)) : undefined;
    (optionals.length > 0) ? (body = [].concat(["do"]).concat(optionals).concat([body])) : undefined;
    (body = returnify(body));
    (_ref6 = compileResolve(body, buffer, scope, opts));
    body = _ref6[0];
    buffer = _ref6[1];
    scope = _ref6[2];
    rest ? body.unshift.apply(body, [].concat(rest)) : undefined;
    (vars = []);
    (funcs = []);
    (dec = "var ");
    (!(typeof args !== 'undefined' && args !== null)) ? (args = []) : undefined;
    _res0 = [];
    _ref7 = scope.hoist;
    for (_i3 = 0; _i3 < _ref7.length; ++_i3) {
      name = _ref7[_i3];
      _res0.push(((!([].indexOf.call(outerScope.hoist, name) >= 0)) && (!([].indexOf.call(args, name) >= 0))) ? (([].indexOf.call(Object.keys(toplevel), name) >= 0) || ([].indexOf.call(Object.keys(opFuncs), name) >= 0) || ([].indexOf.call(Object.keys(macros), name) >= 0)) ? funcs.push(name) : vars.push(name) : undefined);
    }
    _res0;
    _res1 = [];
    _ref8 = scope.service;
    for (_i4 = 0; _i4 < _ref8.length; ++_i4) {
      name = _ref8[_i4];
      _res1.push((!([].indexOf.call(outerScope.service, name) >= 0)) ? vars.push(name) : undefined);
    }
    _res1;
    _res2 = [];
    while ((vars.length > 0)) {
      (name = vars.shift());
      if (([].indexOf.call(vars, name) >= 0)) {
        throw Error(("compiler error: duplicate var in declarations:" + name));
        _ref9 = undefined;
      } else {
        _ref9 = undefined;
      }
      _ref9;
      _res2.push((dec += (name + ", ")));
    }
    _res2;
    if ((dec.length > 4)) {
      (dec = dec.slice(0, (dec.length - 2)));
      _ref10 = body.unshift(dec);
    } else {
      _ref10 = undefined;
    }
    _ref10;
    if (((typeof isTopLevel !== 'undefined' && isTopLevel !== null) && isTopLevel)) {
      _res3 = [];
      while ((funcs.length > 0)) {
        (func = funcs.pop());
        if (([].indexOf.call(funcs, func) >= 0)) {
          throw Error(("compiler error: duplicate func in declarations:" + func));
          _ref11 = undefined;
        } else {
          _ref11 = undefined;
        }
        _ref11;
        if (([].indexOf.call(Object.keys(toplevel), func) >= 0)) {
          _ref12 = body.unshift(toplevel[func].toString());
        } else if (([].indexOf.call(Object.keys(macros), func) >= 0)) {
          _ref12 = body.unshift(("var " + func + " = " + macros[func] + ";"));
        } else if (([].indexOf.call(Object.keys(opFuncs), func) >= 0)) {
          _ref12 = body.unshift(("var " + opFuncs[func].name + " = " + opFuncs[func].func + ";"));
        } else {
          throw Error(("unrecognised func: " + pr(func)));
          _ref12 = undefined;
        }
        _res3.push(_ref12);
      }
      _ref14 = _res3;
    } else {
      _res4 = [];
      _ref13 = funcs;
      for (_i5 = 0; _i5 < _ref13.length; ++_i5) {
        func = _ref13[_i5];
        _res4.push((!([].indexOf.call(outerScope.hoist, func) >= 0)) ? outerScope.hoist.push(func) : undefined);
      }
      _ref14 = _res4;
    }
    _ref14;
    (scope = outerScope);
    buffer.push(("function " + fname + "(" + spr(args) + ") {" + render(body) + " }"));
    buffer.push(fname);
    return Array(buffer, scope);
  }));
  (specials.mac = (function(form) {
    return makeMacro(form);
  }));

  function collect(compiled, collector, isCase) {
    var plug, lastItem, _ref, _ref0;
    (!(typeof isCase !== 'undefined' && isCase !== null)) ? (isCase = false) : undefined;
    if ((isList(compiled) && (compiled.length > 0))) {
      /\{$/.test(last(compiled)) ? (plug = compiled.pop()) : undefined;
      (lastItem = compiled.pop());
      if (/^return\s/.test(lastItem)) {
        _ref = (lastItem = lastItem.replace(/^return\s/, ("return " + collector + " = ")));
      } else if (util.kwtest(lastItem)) {
        _ref = (lastItem = (collector + " = undefined; " + lastItem));
      } else {
        _ref = (lastItem = (collector + " = " + pr(lastItem)));
      }
      _ref;
      compiled.push(lastItem);
      isCase ? compiled.push("break") : undefined;
      _ref0 = (typeof plug !== 'undefined' && plug !== null) ? compiled.push(plug) : undefined;
    } else {
      _ref0 = undefined;
    }
    _ref0;
    return compiled;
  }
  collect;
  (specials.if = (function(form, scope, opts) {
    var buffer, formName, predicate, prebranch, midcases, postbranch, collector, i, mid, midtest, midbranch, comp, _ref, _i, _ref0, _ref1, _i0, _ref2, _i1, _ref3, _i2, _ref4, _i3, _res, _ref5, _ref6, _i4, _ref7, _i5, _ref8, _ref9, _i6, _i7, _res0, _ref10, _ref11;
    (!(typeof opts !== 'undefined' && opts !== null)) ? (opts = ({})) : undefined;
    (buffer = []);
    (form = form.slice());
    (formName = form.shift());
    (_ref = form);
    predicate = _ref[0];
    prebranch = _ref[1];
    var midcases = 4 <= _ref.length ? [].slice.call(_ref, 2, _i = _ref.length - 1) : (_i = 2, []);
    postbranch = _ref[_i++];
    if (((typeof postbranch !== 'undefined' && postbranch !== null) && ((car(postbranch) === "elif")))) {
      midcases.push(postbranch);
      _ref0 = (postbranch = undefined);
    } else {
      _ref0 = undefined;
    }
    _ref0;
    (_ref1 = compileGetLast(predicate, buffer, scope, opts));
    predicate = _ref1[0];
    buffer = _ref1[1];
    scope = _ref1[2];
    (!(typeof predicate !== 'undefined' && predicate !== null)) ? (predicate = "false") : undefined;
    (_ref2 = compileResolve(prebranch, buffer, scope, opts));
    prebranch = _ref2[0];
    buffer = _ref2[1];
    scope = _ref2[2];
    (_ref3 = compileResolve(postbranch, buffer, scope, opts));
    postbranch = _ref3[0];
    buffer = _ref3[1];
    scope = _ref3[2];
    if ((((prebranch.length === 1)) && (!util.kwtest(car(prebranch))) && ((midcases.length === 0)) && ((postbranch.length === 1)) && (!util.kwtest(car(postbranch))))) {
      _ref11 = buffer.push((predicate + " ? " + car(prebranch) + " : " + car(postbranch)));
    } else {
      (_ref4 = declareService("_ref", scope, opts.function ? args : undefined));
      collector = _ref4[0];
      scope = _ref4[1];
      (prebranch = collect(prebranch, collector));
      (postbranch = collect(postbranch, collector));
      _res = [];
      _ref5 = midcases;
      for (i = 0; i < _ref5.length; ++i) {
        mid = _ref5[i];
        assertExp(mid, (function(x) {
          return ((x.shift() === "elif"));
        }), "elif");
        (_ref6 = mid);
        midtest = _ref6[0];
        midbranch = _ref6[1];
        (_ref7 = compileResolve(midtest, buffer, scope, opts));
        midtest = _ref7[0];
        buffer = _ref7[1];
        scope = _ref7[2];
        (!(typeof midtest !== 'undefined' && midtest !== null)) ? (midtest = "false") : undefined;
        if ((midtest.length > 1)) {
          throw Error((pr("elif") + " must compile to single expression (todo fix later); got:" + pr(midtest)));
          _ref8 = undefined;
        } else {
          _ref8 = undefined;
        }
        _ref8;
        (_ref9 = compileResolve(midbranch, buffer, scope, opts));
        midbranch = _ref9[0];
        buffer = _ref9[1];
        scope = _ref9[2];
        _res.push((midcases[i] = ({
          test: midtest,
          branch: collect(midbranch, collector)
        })));
      }
      _res;
      (comp = ("if (" + pr(predicate) + ") { " + render(prebranch) + " } "));
      _res0 = [];
      _ref10 = midcases;
      for (_i7 = 0; _i7 < _ref10.length; ++_i7) {
        mid = _ref10[_i7];
        _res0.push((comp += (" else if (" + spr(mid.test) + ") { " + render(mid.branch) + " }")));
      }
      _res0;
      (typeof postbranch !== 'undefined' && postbranch !== null) ? (comp += (" else { " + render(postbranch) + " }")) : undefined;
      _ref11 = buffer.push(comp, collector);
    }
    _ref11;
    return Array(buffer, scope);
  }));
  (specials.switch = (function(form, scope, opts) {
    var buffer, formName, predicate, midcases, postbranch, collector, i, mid, midtest, midbranch, comp, _ref, _i, _ref0, _ref1, _i0, _ref2, _i1, _res, _ref3, _ref4, _i2, _ref5, _i3, _ref6, _ref7, _i4, _ref8, _i5, _i6, _res0, _ref9;
    (!(typeof opts !== 'undefined' && opts !== null)) ? (opts = ({})) : undefined;
    (buffer = []);
    (form = form.slice());
    (formName = form.shift());
    (_ref = form);
    predicate = _ref[0];
    var midcases = 3 <= _ref.length ? [].slice.call(_ref, 1, _i = _ref.length - 1) : (_i = 1, []);
    postbranch = _ref[_i++];
    if (((typeof postbranch !== 'undefined' && postbranch !== null) && ((car(postbranch) === "case")))) {
      midcases.push(postbranch);
      _ref0 = (postbranch = undefined);
    } else {
      _ref0 = undefined;
    }
    _ref0;
    (_ref1 = declareService("_ref", scope, opts.function ? args : undefined));
    collector = _ref1[0];
    scope = _ref1[1];
    (_ref2 = compileGetLast(predicate, buffer, scope, opts));
    predicate = _ref2[0];
    buffer = _ref2[1];
    scope = _ref2[2];
    (!(typeof predicate !== 'undefined' && predicate !== null)) ? (predicate = "false") : undefined;
    _res = [];
    _ref3 = midcases;
    for (i = 0; i < _ref3.length; ++i) {
      mid = _ref3[i];
      assertExp(mid, (function(x) {
        return ((x.shift() === "case"));
      }), "case");
      (_ref4 = mid);
      midtest = _ref4[0];
      midbranch = _ref4[1];
      (_ref5 = compileResolve(midtest, buffer, scope, opts));
      midtest = _ref5[0];
      buffer = _ref5[1];
      scope = _ref5[2];
      (!(typeof midtest !== 'undefined' && midtest !== null)) ? (midtest = "false") : undefined;
      if ((midtest.length > 1)) {
        throw Error((pr("case") + " must compile to single expression (todo fix later); got:" + pr(midtest)));
        _ref6 = undefined;
      } else {
        _ref6 = undefined;
      }
      _ref6;
      (_ref7 = compileResolve(midbranch, buffer, scope, opts));
      midbranch = _ref7[0];
      buffer = _ref7[1];
      scope = _ref7[2];
      _res.push((midcases[i] = ({
        test: midtest,
        branch: collect(midbranch, collector, true)
      })));
    }
    _res;
    (_ref8 = compileResolve(postbranch, buffer, scope, opts));
    postbranch = _ref8[0];
    buffer = _ref8[1];
    scope = _ref8[2];
    (postbranch = collect(postbranch, collector));
    (comp = ("switch (" + pr(predicate) + ") { "));
    _res0 = [];
    _ref9 = midcases;
    for (_i6 = 0; _i6 < _ref9.length; ++_i6) {
      mid = _ref9[_i6];
      _res0.push((comp += (" case " + spr(mid.test) + ": " + render(mid.branch))));
    }
    _res0;
    (comp += (" default: " + render(postbranch) + " }"));
    buffer.push(comp, collector);
    return Array(buffer, scope);
  }));
  (specials.for = (function(form, scope, opts) {
    var buffer, formName, value, key, iterable, body, collector, ref, _ref, _ref0, _ref1, _i, _ref2, _ref3, _i0, _ref4, _i1, _ref5, _i2, _ref6, _ref7, _ref8, _i3, _ref9, _i4, _ref10, _i5, _ref11, _i6;
    (!(typeof opts !== 'undefined' && opts !== null)) ? (opts = ({})) : undefined;
    (buffer = []);
    (form = form.slice());
    (formName = form.shift());
    if ((form.length < 2)) {
      throw Error((pr(formName) + " expects no less than " + pr(2) + " arguments"));
      _ref = undefined;
    } else {
      _ref = undefined;
    }
    _ref;
    if ((form.length > 4)) {
      throw Error((pr(formName) + " expects no more than " + pr(4) + " arguments"));
      _ref0 = undefined;
    } else {
      _ref0 = undefined;
    }
    _ref0;
    (_ref1 = form);
    value = _ref1[0];
    key = _ref1[1];
    iterable = _ref1[2];
    body = _ref1[3];
    if ((!(typeof body !== 'undefined' && body !== null))) {
      if ((!(typeof iterable !== 'undefined' && iterable !== null))) {
        if ((isNaN(Number(value)) || (!(parseInt(value) > 0)))) {
          throw Error(("expecting integer, got " + pr(value)));
          _ref2 = undefined;
        } else {
          _ref2 = undefined;
        }
        _ref2;
        (body = key);
        (iterable = ["quote", [range, 1, [parseInt, value]]]);
        (_ref3 = declareService("_i", scope, opts.function ? args : undefined));
        key = _ref3[0];
        scope = _ref3[1];
        (_ref4 = declareService("_val", scope, opts.function ? args : undefined));
        value = _ref4[0];
        _ref6 = scope = _ref4[1];
      } else {
        (body = iterable);
        (iterable = key);
        (_ref5 = declareService("_i", scope, opts.function ? args : undefined));
        key = _ref5[0];
        scope = _ref5[1];
        assertExp(value, isVarName, "valid identifier");
        _ref6 = (scope = declareVar(value, scope));
      }
      _ref7 = _ref6;
    } else {
      assertExp(key, isVarName, "valid identifier");
      (scope = declareVar(key, scope));
      assertExp(value, isVarName, "valid identifier");
      _ref7 = (scope = declareVar(value, scope));
    }
    _ref7;
    assertExp(key, isVarName, "valid identifier");
    assertExp(value, isVarName, "valid identifier");
    (_ref8 = declareService("_res", scope, opts.function ? args : undefined));
    collector = _ref8[0];
    scope = _ref8[1];
    (_ref9 = declareService("_ref", scope, opts.function ? args : undefined));
    ref = _ref9[0];
    scope = _ref9[1];
    buffer.push((collector + " = []"));
    (_ref10 = compileGetLast(iterable, buffer, scope, opts));
    iterable = _ref10[0];
    buffer = _ref10[1];
    scope = _ref10[2];
    buffer.push((ref + " = " + pr(iterable)));
    (_ref11 = compileResolve(body, buffer, scope, opts));
    body = _ref11[0];
    buffer = _ref11[1];
    scope = _ref11[2];
    (!util.kwtest(pr(last(body)))) ? body.push((collector + ".push(" + pr(body.pop()) + ")")) : undefined;
    buffer.push(("for (" + key + " = 0; " + key + " < " + ref + ".length; ++" + key + ") { " + value + " = " + ref + "[" + key + "]; " + render(body) + " }"));
    buffer.push(collector);
    return Array(buffer, scope);
  }));
  (specials.over = (function(form, scope, opts) {
    var buffer, formName, value, key, iterable, body, collector, ref, _ref, _ref0, _ref1, _i, _ref2, _i0, _ref3, _ref4, _i1, _ref5, _i2, _ref6, _i3, _ref7, _i4, _ref8, _i5, _ref9, _i6;
    (!(typeof opts !== 'undefined' && opts !== null)) ? (opts = ({})) : undefined;
    (buffer = []);
    (form = form.slice());
    (formName = form.shift());
    if ((form.length < 2)) {
      throw Error((pr(formName) + " expects no less than " + pr(2) + " arguments"));
      _ref = undefined;
    } else {
      _ref = undefined;
    }
    _ref;
    if ((form.length > 4)) {
      throw Error((pr(formName) + " expects no more than " + pr(4) + " arguments"));
      _ref0 = undefined;
    } else {
      _ref0 = undefined;
    }
    _ref0;
    (_ref1 = form);
    value = _ref1[0];
    key = _ref1[1];
    iterable = _ref1[2];
    body = _ref1[3];
    if ((!(typeof body !== 'undefined' && body !== null))) {
      (body = iterable);
      (iterable = key);
      (_ref2 = declareService("_key", scope, opts.function ? args : undefined));
      key = _ref2[0];
      scope = _ref2[1];
      assertExp(value, isVarName, "valid identifier");
      _ref3 = (scope = declareVar(value, scope));
    } else if ((!(typeof iterable !== 'undefined' && iterable !== null))) {
      (body = key);
      (iterable = value);
      (_ref4 = declareService("_key", scope, opts.function ? args : undefined));
      key = _ref4[0];
      scope = _ref4[1];
      (_ref5 = declareService("_val", scope, opts.function ? args : undefined));
      value = _ref5[0];
      _ref3 = scope = _ref5[1];
    } else {
      assertExp(key, isVarName, "valid identifier");
      (scope = declareVar(key, scope));
      assertExp(value, isVarName, "valid identifier");
      _ref3 = (scope = declareVar(value, scope));
    }
    _ref3;
    assertExp(key, isVarName, "valid identifier");
    assertExp(value, isVarName, "valid identifier");
    (_ref6 = declareService("_res", scope, opts.function ? args : undefined));
    collector = _ref6[0];
    scope = _ref6[1];
    (_ref7 = declareService("_ref", scope, opts.function ? args : undefined));
    ref = _ref7[0];
    scope = _ref7[1];
    buffer.push((collector + " = []"));
    (_ref8 = compileGetLast(iterable, buffer, scope, opts));
    iterable = _ref8[0];
    buffer = _ref8[1];
    scope = _ref8[2];
    buffer.push((ref + " = " + pr(iterable)));
    (_ref9 = compileResolve(body, buffer, scope, opts));
    body = _ref9[0];
    buffer = _ref9[1];
    scope = _ref9[2];
    (!util.kwtest(pr(last(body)))) ? body.push((collector + ".push(" + pr(body.pop()) + ")")) : undefined;
    buffer.push(("for (" + key + " in " + ref + ") { " + value + " = " + ref + "[" + key + "]; " + render(body) + " }"));
    buffer.push(collector);
    return Array(buffer, scope);
  }));
  (specials.while = (function(form, scope, opts) {
    var buffer, formName, test, body, rvalue, collector, comp, _ref, _ref0, _ref1, _i, _ref2, _i0, _ref3, _ref4, _i1, _ref5, _i2, _ref6, _i3, _ref7;
    (!(typeof opts !== 'undefined' && opts !== null)) ? (opts = ({})) : undefined;
    (buffer = []);
    (form = form.slice());
    (formName = form.shift());
    if ((form.length < 2)) {
      throw Error((pr(formName) + " expects no less than " + pr(2) + " arguments"));
      _ref = undefined;
    } else {
      _ref = undefined;
    }
    _ref;
    if ((form.length > 3)) {
      throw Error((pr(formName) + " expects no more than " + pr(3) + " arguments"));
      _ref0 = undefined;
    } else {
      _ref0 = undefined;
    }
    _ref0;
    (_ref1 = form);
    test = _ref1[0];
    body = _ref1[1];
    rvalue = _ref1[2];
    if (((form.length === 2))) {
      (_ref2 = declareService("_res", scope, opts.function ? args : undefined));
      collector = _ref2[0];
      scope = _ref2[1];
      _ref3 = buffer.push((collector + " = []"));
    } else {
      _ref3 = (comp = "");
    }
    _ref3;
    (_ref4 = compileGetLast(test, buffer, scope, opts));
    test = _ref4[0];
    buffer = _ref4[1];
    scope = _ref4[2];
    (_ref5 = compileResolve(body, buffer, scope, opts));
    body = _ref5[0];
    buffer = _ref5[1];
    scope = _ref5[2];
    (((form.length === 2)) && (!util.kwtest(pr(last(body))))) ? body.push((collector + ".push(" + pr(body.pop()) + ")")) : undefined;
    buffer.push(("while (" + pr(test) + ") { " + render(body) + " }"));
    if (((form.length === 2))) {
      _ref7 = buffer.push(collector);
    } else {
      (_ref6 = compileResolve(rvalue, buffer, scope, opts));
      rvalue = _ref6[0];
      buffer = _ref6[1];
      scope = _ref6[2];
      _ref7 = buffer.push(render(rvalue));
    }
    _ref7;
    return Array(buffer, scope);
  }));
  (specials.try = (function(form, scope, opts) {
    var buffer, formName, collector, tryForm, catchForm, finalForm, err, res, _ref, _ref0, _ref1, _i, _ref2, _i0, _ref3, _i1, _ref4, _i2, _ref5, _i3, _ref6, _ref7, _i4, _ref8, _ref9, _i5, _ref10;
    (!(typeof opts !== 'undefined' && opts !== null)) ? (opts = ({})) : undefined;
    (buffer = []);
    (form = form.slice());
    (formName = form.shift());
    if ((form.length < 1)) {
      throw Error((pr(formName) + " expects no less than " + pr(1) + " arguments"));
      _ref = undefined;
    } else {
      _ref = undefined;
    }
    _ref;
    if ((form.length > 3)) {
      throw Error((pr(formName) + " expects no more than " + pr(3) + " arguments"));
      _ref0 = undefined;
    } else {
      _ref0 = undefined;
    }
    _ref0;
    (_ref1 = declareService("_ref", scope, opts.function ? args : undefined));
    collector = _ref1[0];
    scope = _ref1[1];
    (_ref2 = form);
    tryForm = _ref2[0];
    catchForm = _ref2[1];
    finalForm = _ref2[2];
    (_ref3 = compileResolve(tryForm, buffer, scope, opts));
    tryForm = _ref3[0];
    buffer = _ref3[1];
    scope = _ref3[2];
    tryForm.push((collector + " = " + pr(tryForm.pop())));
    if ((isList(catchForm) && ((car(catchForm) === "catch")))) {
      assertExp(catchForm, (function() {
        return ((arguments[0].length === 2) || (arguments[0].length === 3));
      }), "valid catch form");
      (_ref4 = catchForm);
      catchForm = _ref4[0];
      err = _ref4[1];
      catchForm = _ref4[2];
      assertExp(err, isVarName, "valid identifier");
      _ref6 = (scope = declareVar(err, scope));
    } else {
      (_ref5 = declareService("_err", scope, opts.function ? args : undefined));
      err = _ref5[0];
      _ref6 = scope = _ref5[1];
    }
    _ref6;
    (!(typeof catchForm !== 'undefined' && catchForm !== null)) ? (catchForm = []) : undefined;
    (_ref7 = compileResolve(catchForm, buffer, scope, opts));
    catchForm = _ref7[0];
    buffer = _ref7[1];
    scope = _ref7[2];
    (!util.kwtest(pr(last(catchForm)))) ? catchForm.push((collector + " = " + pr(catchForm.pop()))) : undefined;
    if ((typeof finalForm !== 'undefined' && finalForm !== null)) {
      if ((isList(finalForm) && ((car(finalForm) === "finally")))) {
        assertExp(finalForm, (function() {
          return ((arguments[0].length === 2));
        }));
        _ref8 = (finalForm = last(finalForm));
      } else {
        _ref8 = undefined;
      }
      _ref8;
      (_ref9 = compileResolve(finalForm, buffer, scope, opts));
      finalForm = _ref9[0];
      buffer = _ref9[1];
      scope = _ref9[2];
      _ref10 = (!util.kwtest(pr(last(finalForm)))) ? finalForm.push((collector + " = " + pr(finalForm.pop()))) : undefined;
    } else {
      _ref10 = undefined;
    }
    _ref10;
    (res = ("try { " + render(tryForm) + " } catch (" + pr(err) + ") { " + render(catchForm) + " }"));
    (typeof finalForm !== 'undefined' && finalForm !== null) ? (res += (" finally { " + render(finalForm) + " }")) : undefined;
    buffer.push(res, collector);
    return Array(buffer, scope);
  }));
  (specials.get = (function(form, scope, opts) {
    var buffer, formName, object, property, _ref, _ref0, _ref1, _i, _ref2, _ref3, _i0, _ref4, _i1;
    (!(typeof opts !== 'undefined' && opts !== null)) ? (opts = ({})) : undefined;
    (buffer = []);
    (form = form.slice());
    (formName = form.shift());
    if ((form.length < 1)) {
      throw Error((pr(formName) + " expects no less than " + pr(1) + " arguments"));
      _ref = undefined;
    } else {
      _ref = undefined;
    }
    _ref;
    if ((form.length > 2)) {
      throw Error((pr(formName) + " expects no more than " + pr(2) + " arguments"));
      _ref0 = undefined;
    } else {
      _ref0 = undefined;
    }
    _ref0;
    (_ref1 = form);
    object = _ref1[0];
    property = _ref1[1];
    if ((!(typeof property !== 'undefined' && property !== null))) {
      (property = object);
      _ref2 = (object = "");
    } else {
      _ref2 = undefined;
    }
    _ref2;
    (_ref3 = compileGetLast(object, buffer, scope, opts));
    object = _ref3[0];
    buffer = _ref3[1];
    scope = _ref3[2];
    (_ref4 = compileGetLast(property, buffer, scope, opts));
    property = _ref4[0];
    buffer = _ref4[1];
    scope = _ref4[2];
    assertExp(object, (function() {
      return (typeof arguments[0] !== 'undefined' && arguments[0] !== null);
    }), "valid object");
    isVarName(property) ? buffer.push((pr(object) + "." + property)) : buffer.push((pr(object) + "[" + pr(property) + "]"));
    return Array(buffer, scope);
  }));
  (specials.spread = (function(form, scope, opts) {
    var buffer, formName, _ref, _ref0, _ref1, _i, _ref2;
    (!(typeof opts !== 'undefined' && opts !== null)) ? (opts = ({})) : undefined;
    (buffer = []);
    (form = form.slice());
    (formName = form.shift());
    if ((form.length < 1)) {
      throw Error((pr(formName) + " expects no less than " + pr(1) + " arguments"));
      _ref = undefined;
    } else {
      _ref = undefined;
    }
    _ref;
    if ((form.length > 1)) {
      throw Error((pr(formName) + " expects no more than " + pr(1) + " arguments"));
      _ref0 = undefined;
    } else {
      _ref0 = undefined;
    }
    _ref0;
    (form = car(form));
    if (isList(form)) {
      (_ref1 = compileAdd(form, buffer, scope, opts));
      buffer = _ref1[0];
      _ref2 = scope = _ref1[1];
    } else if (isAtom(form)) {
      _ref2 = buffer.push(form);
    } else {
      throw Error(("spread requires atom, got: " + pr(form)));
      _ref2 = undefined;
    }
    _ref2;
    return Array(buffer, scope);
  }));
  (specials.return = (function(form, scope, opts) {
    var buffer, formName, _ref, _ref0, _i, _ref1;
    (!(typeof opts !== 'undefined' && opts !== null)) ? (opts = ({})) : undefined;
    (buffer = []);
    (form = form.slice());
    (formName = form.shift());
    if ((form.length > 1)) {
      throw Error((pr(formName) + " expects no more than " + pr(1) + " arguments"));
      _ref = undefined;
    } else {
      _ref = undefined;
    }
    _ref;
    if (((form.length !== 0))) {
      (_ref0 = compileGetLast(car(form), buffer, scope, opts));
      form = _ref0[0];
      buffer = _ref0[1];
      scope = _ref0[2];
      (!/^return\s/.test(form)) ? (form = ("return " + pr(form))) : undefined;
      _ref1 = buffer.push(form);
    } else {
      _ref1 = undefined;
    }
    _ref1;
    return Array(buffer, scope);
  }));
  (macros = ({}));

  function importMacros(store) {
    var key, val, _res, _ref;
    _res = [];
    _ref = store;
    for (key in _ref) {
      val = _ref[key];
      _res.push((macros[key] = val));
    }
    _res;
    return macros;
  }(exports.importMacros = importMacros);
  importMacros(require("./macros"));

  function parseMacros(form) {
    var key, val, i, _res, _ref, _ref0, _res0, _ref1, _ref2;
    if (util.isHash(form)) {
      _res = [];
      _ref = form;
      for (key in _ref) {
        val = _ref[key];
        _res.push((form[key] = parseMacros(val)));
      }
      _ref0 = _res;
    } else if (util.isList(form)) {
      if (((car(form) === "mac"))) {
        _ref2 = (form = makeMacro(cdr(form)));
      } else {
        _res0 = [];
        _ref1 = form;
        for (i = 0; i < _ref1.length; ++i) {
          val = _ref1[i];
          _res0.push((form[i] = parseMacros(val)));
        }
        _ref2 = _res0;
      }
      _ref0 = _ref2;
    } else {
      _ref0 = undefined;
    }
    _ref0;
    return form;
  }
  parseMacros;

  function makeMacro(form) {
    var name, body, compiled, scope, rendered, _ref, _i, _ref0, _ref1, _ref2, _i0;
    (_ref = form);
    name = _ref[0];
    var body = 2 <= _ref.length ? [].slice.call(_ref, 1, _i = _ref.length - 0) : (_i = 1, []);
    if ((!(typeof name !== 'undefined' && name !== null))) {
      throw Error("a macro requires a name");
      _ref0 = undefined;
    } else {
      _ref0 = undefined;
    }
    _ref0;
    if ((!(typeof body !== 'undefined' && body !== null))) {
      throw Error("a macro requires a body");
      _ref1 = undefined;
    } else {
      _ref1 = undefined;
    }
    _ref1;
    body.unshift("fn");
    (_ref2 = compileForm(body, ({
      hoist: [],
      service: []
    }), ({
      macro: true
    })));
    compiled = _ref2[0];
    scope = _ref2[1];
    (rendered = render(compiled));
    (macros[name] = vm.runInThisContext(rendered));
    return [];
  }
  makeMacro;

  function expandMacros(form) {
    var key, val, i, _res, _ref, _ref0, _res0, _ref1, _ref2;
    if (util.isHash(form)) {
      _res = [];
      _ref = form;
      for (key in _ref) {
        val = _ref[key];
        _res.push((form[key] = expandMacros(val)));
      }
      _ref0 = _res;
    } else if (util.isList(form)) {
      if (((car(form) === "mac"))) {
        _ref2 = (form = parseMacros(form));
      } else if (([].indexOf.call(Object.keys(macros), car(form)) >= 0)) {
        (form = macros[car(form)].apply(macros, [].concat(cdr(form))));
        (((typeof form) === "undefined")) ? (form = []) : undefined;
        _ref2 = (form = expandMacros(form));
      } else {
        _res0 = [];
        _ref1 = form;
        for (i = 0; i < _ref1.length; ++i) {
          val = _ref1[i];
          _res0.push((form[i] = expandMacros(val)));
        }
        _ref2 = _res0;
      }
      _ref0 = _ref2;
    } else {
      _ref0 = undefined;
    }
    _ref0;
    return form;
  }
  expandMacros;

  function macroexpand(src) {
    return expandMacros(parseMacros(src));
  }
  macroexpand;
  (exports.fileExtensions = [".jisp"]);
  (exports.register = (function() {
    return require("./register");
  }));
  (exports.tokenise = (function(src) {
    return tokenise(src);
  }));
  (exports.lex = (function(src) {
    return lex(tokenise(src));
  }));
  (exports.parse = (function(src) {
    return parse(lex(tokenise(src)));
  }));
  (exports.macroexpand = (function(src) {
    return macroexpand(parse(lex(tokenise(src))));
  }));
  (exports.macros = macros);

  function compile(src, opts) {
    var defaults, parsed, expanded, compiled, scope, _ref, _i;
    (defaults = ({
      wrap: true
    }));
    (opts = util.merge(defaults, opts));
    (parsed = parse(lex(tokenise(src))));
    parsed.unshift("do");
    opts.wrap ? (parsed = [
      ["get", ["fn", parsed], "call"], "this"
    ]) : undefined;
    (expanded = macroexpand(parsed));
    (_ref = compileForm(expanded, ({
      hoist: [],
      service: []
    }), ({
      toplevel: true
    })));
    compiled = _ref[0];
    scope = _ref[1];
    return beautify(render(compiled), ({
      indent_size: 2
    }));
  }(exports.compile = compile);

  function compileFile(filename) {
    var raw, stripped, err, _ref;
    (raw = fs.readFileSync(filename, "utf8"));
    (stripped = ((raw.charCodeAt(0) === 65279)) ? raw.substring(1) : raw);
    try {
      _ref = exports.compile(stripped);
    } catch (err) {
      throw err;
      _ref = undefined;
    }
    return _ref;
  }(exports.compileFile = compileFile);

  function run(code, options) {
    var mainModule, dir;
    (!(typeof options !== 'undefined' && options !== null)) ? (options = ({})) : undefined;
    (mainModule = require.main);
    (mainModule.filename = (process.argv[1] = options.filename ? fs.realpathSync(options.filename) : "."));
    mainModule.moduleCache ? (mainModule.moduleCache = ({})) : undefined;
    (dir = options.filename ? path.dirname(fs.realpathSync(options.filename)) : fs.realpathSync("."));
    (mainModule.paths = require("module")._nodeModulePaths(dir));
    ((!util.isJisp(mainModule.filename)) || require.extensions) ? (code = exports.compile(code)) : undefined;
    return mainModule._compile(code, mainModule.filename);
  }
  return (exports.run = run);
}).call(this);