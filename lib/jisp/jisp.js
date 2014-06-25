(function() {
  function last(iterable) {
    return iterable.slice((iterable.length - 1))[0];
  }

  function init(iterable) {
    return iterable.slice(0, (iterable.length - 1));
  }

  function car(iterable) {
    return iterable[0];
  }

  function list(args) {
    var _i;
    args = 1 <= arguments.length ? [].slice.call(arguments, 0, _i = arguments.length - 0) : (_i = _i, []);
    return [].concat(args);
  }

  function cdr(iterable) {
    return iterable.slice(1);
  }
  var vm, fs, path, beautify, toplevel, util, ops, operators, opFuncs, tokenise, lex, parse, pr, spr, render, isAtom, isHash, isList, isVarName, isIdentifier, specials, macros;
  (exports.version = "0.0.6");
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

  function plusname(name) {
    var _ref;
    if (isNaN(Number(last(name)))) {
      _ref = (name + 0);
    } else {
      _ref = (init(name) + (1 + Number(last(name))));
    }
    return _ref;
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

  function assertArg(exp, test, expect) {
    var _ref, _ref0;
    if ((!(typeof expect !== 'undefined' && expect !== null))) {
      _ref = (expect = "valid expression");
    } else {
      _ref = undefined;
    }
    _ref;
    if (test(exp)) {
      _ref0 = true;
    } else {
      throw Error(("expecting " + pr(expect) + ", got " + pr(exp)));
      _ref0 = undefined;
    }
    return _ref0;
  }
  assertArg;

  function hasSpread(form) {
    return (isList(form) && ((car(form) === "spread")));
  }
  hasSpread;

  function compileResolve(form, buffer, scope, opts) {
    var compiled, i, name, newname, re, subst, str, _ref, _i, _res, _ref0, _ref1, _res0, _res1, _ref2, _ref3;
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
        _ref2 = buffer;
        for (i = 0; i < _ref2.length; ++i) {
          str = _ref2[i];
          if (((typeof str !== 'undefined' && str !== null) && (((typeof str) === "string")))) {
            _ref3 = (buffer[i] = str.replace(re, subst));
          } else {
            _ref3 = undefined;
          }
          _res1.push(_ref3);
        }
        _ref1 = _res1;
      } else {
        _ref1 = undefined;
      }
      _res.push(_ref1);
    }
    _res;
    return [compiled, buffer, scope];
  }
  compileResolve;

  function compileAdd(form, buffer, scope, opts) {
    var compiled, _ref, _i, _ref0;
    (_ref = compileResolve(form, buffer, scope, opts));
    compiled = _ref[0];
    buffer = _ref[1];
    scope = _ref[2];
    (_ref0 = buffer).push.apply(_ref0, [].concat(compiled));
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

  function compile(form, opts) {
    var defaults, compiled, scope, _ref, _ref0, _i;
    (defaults = {
      wrap: true
    });
    (opts = util.merge(defaults, opts));
    form.unshift("do");
    if (opts.wrap) {
      _ref = (form = [
        ["get", ["fn", form], "call"], "this"
      ]);
    } else {
      _ref = undefined;
    }
    _ref;
    (_ref0 = compileForm(form, {
      hoist: [],
      service: []
    }, {
      toplevel: true
    }));
    compiled = _ref0[0];
    scope = _ref0[1];
    return beautify(render(compiled), {
      indent_size: 2
    });
  }
  compile;

  function compileForm(form, scope, opts) {
    var buffer, key, val, first, i, arg, argsSpread, name, method, collector, _ref, _ref0, _ref1, _res, _ref2, _ref3, _i, _ref4, _ref5, _ref6, _i0, _ref7, _i1, _ref8, _res0, _ref9, _ref10, _ref11, _i2, _ref12, _i3, _ref13, _ref14, _ref15, _ref16, _i4, _ref17, _ref18, _ref19, _i5, _ref110, _ref111, _i6;
    if ((!(typeof opts !== 'undefined' && opts !== null))) {
      _ref = (opts = {});
    } else {
      _ref = undefined;
    }
    _ref;
    if ((isList(form) && util.isBlankObject(form))) {
      _ref0 = [
        [form], scope
      ];
    } else if (isAtom(form)) {
      if (([].indexOf.call(Object.keys(toplevel), form) >= 0)) {
        assertArg(form, isVarName, "valid identifier");
        _ref1 = (scope = declareVar(form, scope));
      } else if (([].indexOf.call(Object.keys(opFuncs), form) >= 0)) {
        assertArg(form, isVarName, "valid identifier");
        (scope = declareVar(form, scope));
        _ref1 = (form = opFuncs[form].name);
      } else {
        _ref1 = undefined;
      }
      _ref1;
      _ref0 = [
        [form], scope
      ];
    } else if (isHash(form)) {
      (buffer = []);
      _res = [];
      _ref2 = form;
      for (key in _ref2) {
        val = _ref2[key];
        (_ref3 = compileGetLast(val, buffer, scope, opts));
        form[key] = _ref3[0];
        buffer = _ref3[1];
        _res.push(scope = _ref3[2]);
      }
      _res;
      buffer.push(form);
      _ref0 = [buffer, scope];
    } else {
      if ((!isList(form))) {
        throw Error(("expecting list, got" + pr(form)));
        _ref4 = undefined;
      } else {
        _ref4 = undefined;
      }
      _ref4;
      (buffer = []);
      (form = form.slice());
      if (([].indexOf.call(Object.keys(specials), car(form)) >= 0)) {
        (_ref6 = specials[car(form)](form, scope, opts));
        buffer = _ref6[0];
        _ref5 = scope = _ref6[1];
      } else {
        (_ref7 = compileGetLast(form.shift(), buffer, scope, opts));
        first = _ref7[0];
        buffer = _ref7[1];
        scope = _ref7[2];
        if (([].indexOf.call(Object.keys(toplevel), first) >= 0)) {
          assertArg(first, isVarName, "valid identifier");
          _ref8 = (scope = declareVar(first, scope));
        } else {
          _ref8 = undefined;
        }
        _ref8;
        _res0 = [];
        _ref9 = form;
        for (i = 0; i < _ref9.length; ++i) {
          arg = _ref9[i];
          if (hasSpread(arg)) {
            (argsSpread = true);
            (_ref11 = compileGetLast(arg, buffer, scope, opts));
            arg = _ref11[0];
            buffer = _ref11[1];
            scope = _ref11[2];
            _ref10 = (form[i] = ["spread", arg]);
          } else {
            (_ref12 = compileGetLast(arg, buffer, scope, opts));
            arg = _ref12[0];
            buffer = _ref12[1];
            scope = _ref12[2];
            _ref10 = (form[i] = arg);
          }
          _res0.push(_ref10);
        }
        _res0;
        if ((!(typeof argsSpread !== 'undefined' && argsSpread !== null))) {
          if (([].indexOf.call(Object.keys(operators), first) >= 0)) {
            _ref14 = (_ref15 = buffer).push.apply(_ref15, [].concat(operators[first](form)));
          } else {
            _ref14 = buffer.push((pr(first) + "(" + spr(form) + ")"));
          }
          _ref13 = _ref14;
        } else {
          (form = ["quote", form]);
          (_ref16 = compileGetLast(form, buffer, scope, opts));
          form = _ref16[0];
          buffer = _ref16[1];
          scope = _ref16[2];
          if (([].indexOf.call(Object.keys(operators), first) >= 0)) {
            if ((([].indexOf.call(Object.keys(opFuncs), first) >= 0) && spr(opFuncs[first]))) {
              assertArg(first, isVarName, "valid identifier");
              (scope = declareVar(first, scope));
              _ref18 = (first = opFuncs[first].name);
            } else {
              throw Error(([pr, first] + " can't spread arguments (yet)"));
              _ref18 = undefined;
            }
            _ref17 = _ref18;
          } else {
            _ref17 = undefined;
          }
          _ref17;
          (_ref19 = splitName(first));
          name = _ref19[0];
          method = _ref19[1];
          if (((first === name))) {
            _ref110 = buffer.push((name + ".apply(" + name + ", " + pr(form) + ")"));
          } else {
            (_ref111 = declareService("_ref", scope));
            collector = _ref111[0];
            scope = _ref111[1];
            _ref110 = buffer.push(("(" + collector + " = " + name + ")" + method + ".apply(" + collector + ", " + pr(form) + ")"));
          }
          _ref13 = _ref110;
        }
        _ref5 = _ref13;
      }
      _ref5;
      _ref0 = [buffer, scope];
    }
    return _ref0;
  }
  compileForm;
  (specials = {});
  (specials.do = (function(form, scope, opts) {
    var buffer, formName, isTopLevel, outerScope, exp, ref, vars, funcs, dec, args, name, func, _ref, _ref0, _ref1, _i, _res, _ref2, _ref3, _ref4, _ref5, _ref6, _i0, _ref7, _i1, _ref8, _ref9, _i2, _res0, _ref10, _ref11, _ref12, _i3, _res1, _ref13, _ref14, _res2, _ref15, _ref16, _ref17, _res3, _ref18, _ref19, _i4, _res4, _ref110, _ref111;
    if ((!(typeof opts !== 'undefined' && opts !== null))) {
      _ref = (opts = {});
    } else {
      _ref = undefined;
    }
    _ref;
    (buffer = []);
    (form = form.slice());
    (formName = form.shift());
    if (opts.toplevel) {
      (isTopLevel = true);
      _ref0 = (delete opts.toplevel);
    } else {
      _ref0 = undefined;
    }
    _ref0;
    if (isTopLevel) {
      (outerScope = scope);
      _ref1 = (scope = {
        hoist: outerScope.hoist.slice(),
        service: outerScope.service.slice()
      });
    } else {
      _ref1 = undefined;
    }
    _ref1;
    _res = [];
    _ref2 = form;
    for (_i = 0; _i < _ref2.length; ++_i) {
      exp = _ref2[_i];
      if ((!(typeof exp !== 'undefined' && exp !== null))) {
        _ref3 = buffer.push(exp);
      } else {
        if (((isList(car(exp)) && ((car(exp).length === 2)) && ((car(car(exp)) === "get"))) || util.isPropSyntax(car(exp)))) {
          (ref = buffer.pop());
          if ((!(typeof ref !== 'undefined' && ref !== null))) {
            _ref5 = (ref = "");
          } else {
            _ref5 = undefined;
          }
          _ref5;
          (_ref6 = compileAdd(exp, buffer, scope, opts));
          buffer = _ref6[0];
          scope = _ref6[1];
          _ref4 = buffer.push((ref + buffer.pop()));
        } else {
          (_ref7 = compileAdd(exp, buffer, scope, opts));
          buffer = _ref7[0];
          _ref4 = scope = _ref7[1];
        }
        _ref3 = _ref4;
      }
      _res.push(_ref3);
    }
    _res;
    if (isTopLevel) {
      (vars = []);
      (funcs = []);
      (dec = "var ");
      if ((!(typeof args !== 'undefined' && args !== null))) {
        _ref9 = (args = []);
      } else {
        _ref9 = undefined;
      }
      _ref9;
      _res0 = [];
      _ref10 = scope.hoist;
      for (_i2 = 0; _i2 < _ref10.length; ++_i2) {
        name = _ref10[_i2];
        if (((!([].indexOf.call(outerScope.hoist, name) >= 0)) && (!([].indexOf.call(args, name) >= 0)))) {
          if ((([].indexOf.call(Object.keys(toplevel), name) >= 0) || ([].indexOf.call(Object.keys(opFuncs), name) >= 0))) {
            _ref12 = funcs.push(name);
          } else {
            _ref12 = vars.push(name);
          }
          _ref11 = _ref12;
        } else {
          _ref11 = undefined;
        }
        _res0.push(_ref11);
      }
      _res0;
      _res1 = [];
      _ref13 = scope.service;
      for (_i3 = 0; _i3 < _ref13.length; ++_i3) {
        name = _ref13[_i3];
        if ((!([].indexOf.call(outerScope.service, name) >= 0))) {
          _ref14 = vars.push(name);
        } else {
          _ref14 = undefined;
        }
        _res1.push(_ref14);
      }
      _res1;
      _res2 = [];
      while ((vars.length > 0)) {
        (name = vars.shift());
        if (([].indexOf.call(vars, name) >= 0)) {
          throw Error(("compiler error: duplicate var in declarations:" + name));
          _ref15 = undefined;
        } else {
          _ref15 = undefined;
        }
        _ref15;
        _res2.push((dec += (name + ", ")));
      }
      _res2;
      if ((dec.length > 4)) {
        (dec = dec.slice(0, (dec.length - 2)));
        _ref16 = buffer.unshift(dec);
      } else {
        _ref16 = undefined;
      }
      _ref16;
      if (((typeof isTopLevel !== 'undefined' && isTopLevel !== null) && isTopLevel)) {
        _res3 = [];
        while ((funcs.length > 0)) {
          (func = funcs.pop());
          if (([].indexOf.call(funcs, func) >= 0)) {
            throw Error(("compiler error: duplicate func in declarations:" + func));
            _ref18 = undefined;
          } else {
            _ref18 = undefined;
          }
          _ref18;
          if (([].indexOf.call(Object.keys(toplevel), func) >= 0)) {
            _ref19 = buffer.unshift(toplevel[func].toString());
          } else if (([].indexOf.call(Object.keys(opFuncs), func) >= 0)) {
            _ref19 = buffer.unshift(("var " + opFuncs[func].name + " = " + opFuncs[func].func));
          } else {
            throw Error(("unrecognised func: " + pr(func)));
            _ref19 = undefined;
          }
          _res3.push(_ref19);
        }
        _ref17 = _res3;
      } else {
        _res4 = [];
        _ref110 = funcs;
        for (_i4 = 0; _i4 < _ref110.length; ++_i4) {
          func = _ref110[_i4];
          if ((!([].indexOf.call(outerScope.hoist, func) >= 0))) {
            _ref111 = outerScope.hoist.push(func);
          } else {
            _ref111 = undefined;
          }
          _res4.push(_ref111);
        }
        _ref17 = _res4;
      }
      _ref17;
      _ref8 = (scope = outerScope);
    } else {
      _ref8 = undefined;
    }
    _ref8;
    return Array(buffer, scope);
  }));
  (specials.quote = (function(form, scope, opts) {
    var buffer, formName, key, exp, arr, res, _ref, _ref0, _ref1, _ref2, _res, _ref3, _ref4, _i, _i0, _res0, _ref5, _ref6, _ref7, _i1, _ref8, _ref9, _i2, _ref10, _ref11, _ref12, _i3, _ref13, _ref14, _ref15;
    if ((!(typeof opts !== 'undefined' && opts !== null))) {
      _ref = (opts = {});
    } else {
      _ref = undefined;
    }
    _ref;
    (buffer = []);
    (form = form.slice());
    (formName = form.shift());
    if ((form.length < 1)) {
      throw Error((pr(formName) + " expects no less than " + pr(1) + " arguments"));
      _ref0 = undefined;
    } else {
      _ref0 = undefined;
    }
    _ref0;
    if ((form.length > 1)) {
      throw Error((pr(formName) + " expects no more than " + pr(1) + " arguments"));
      _ref1 = undefined;
    } else {
      _ref1 = undefined;
    }
    _ref1;
    (form = car(form));
    if ((opts.macro && isAtom(form) && (!util.isPrimitive(form)))) {
      _ref2 = buffer.push(("'" + form + "'"));
    } else if (isAtom(form)) {
      _ref2 = buffer.push(form);
    } else if (isHash(form)) {
      _res = [];
      _ref3 = form;
      for (key in _ref3) {
        exp = _ref3[key];
        (_ref4 = compileGetLast(["quote", exp], buffer, scope, opts));
        form[key] = _ref4[0];
        buffer = _ref4[1];
        _res.push(scope = _ref4[2]);
      }
      _res;
      _ref2 = buffer.push(form);
    } else {
      (arr = []);
      (res = "[]");
      _res0 = [];
      _ref5 = form;
      for (_i0 = 0; _i0 < _ref5.length; ++_i0) {
        exp = _ref5[_i0];
        if ((isList(exp) && ((car(exp) === "quote")) && isList(exp[1]) && ((exp[1].length === 0)))) {
          _ref6 = arr.push([]);
        } else if ((isList(exp) && ((car(exp) === "quote") || (car(exp) === "unquote")))) {
          (_ref7 = compileGetLast(exp, buffer, scope, opts));
          exp = _ref7[0];
          buffer = _ref7[1];
          scope = _ref7[2];
          if ((typeof exp !== 'undefined' && exp !== null)) {
            _ref8 = arr.push(exp);
          } else {
            _ref8 = undefined;
          }
          _ref6 = _ref8;
        } else if ((isList(exp) && ((car(exp) === "spread")) && (!opts.macro))) {
          (_ref9 = compileGetLast(exp, buffer, scope, opts));
          exp = _ref9[0];
          buffer = _ref9[1];
          scope = _ref9[2];
          if ((typeof exp !== 'undefined' && exp !== null)) {
            if ((arr.length > 0)) {
              (res += (".concat(" + pr(arr) + ")"));
              _ref11 = (arr = []);
            } else {
              _ref11 = undefined;
            }
            _ref11;
            _ref10 = (res += (".concat(" + pr(exp) + ")"));
          } else {
            _ref10 = undefined;
          }
          _ref6 = _ref10;
        } else {
          (_ref12 = compileGetLast(["quote", exp], buffer, scope, opts));
          exp = _ref12[0];
          buffer = _ref12[1];
          scope = _ref12[2];
          if ((typeof exp !== 'undefined' && exp !== null)) {
            _ref13 = arr.push(exp);
          } else {
            _ref13 = undefined;
          }
          _ref6 = _ref13;
        }
        _res0.push(_ref6);
      }
      _res0;
      if ((arr.length > 0)) {
        if (((res === "[]"))) {
          _ref15 = (res = pr(arr));
        } else {
          _ref15 = (res += (".concat(" + pr(arr) + ")"));
        }
        _ref14 = _ref15;
      } else {
        _ref14 = undefined;
      }
      _ref14;
      _ref2 = buffer.push(res);
    }
    _ref2;
    return Array(buffer, scope);
  }));
  (specials.unquote = (function(form, scope, opts) {
    var buffer, formName, _ref, _ref0, _ref1, _ref2, _ref3, _i, _ref4, _i0;
    if ((!(typeof opts !== 'undefined' && opts !== null))) {
      _ref = (opts = {});
    } else {
      _ref = undefined;
    }
    _ref;
    (buffer = []);
    (form = form.slice());
    (formName = form.shift());
    if ((form.length < 1)) {
      throw Error((pr(formName) + " expects no less than " + pr(1) + " arguments"));
      _ref0 = undefined;
    } else {
      _ref0 = undefined;
    }
    _ref0;
    if ((form.length > 1)) {
      throw Error((pr(formName) + " expects no more than " + pr(1) + " arguments"));
      _ref1 = undefined;
    } else {
      _ref1 = undefined;
    }
    _ref1;
    (form = car(form));
    if ((isList(form) && ((car(form) === "quote")))) {
      (_ref3 = compileGetLast(form, buffer, scope, opts));
      form = _ref3[0];
      buffer = _ref3[1];
      _ref2 = scope = _ref3[2];
    } else {
      _ref2 = undefined;
    }
    _ref2;
    (_ref4 = compileAdd(form, buffer, scope, opts));
    buffer = _ref4[0];
    scope = _ref4[1];
    return Array(buffer, scope);
  }));
  (specials["="] = (function(form, scope, opts) {
    var buffer, formName, left, right, ref, ind, spreads, i, name, spreadname, spreadind, _ref, _ref0, _ref1, _ref2, _i, _res, _ref3, _i0, _ref4, _ref5, _i1, _ref6, _ref7, _i2, _ref8, _ref9, _i3, _res0, _ref10, _ref11, _ref12, _ref13, _i4, _ref14, _ref15, _ref16;
    if ((!(typeof opts !== 'undefined' && opts !== null))) {
      _ref = (opts = {});
    } else {
      _ref = undefined;
    }
    _ref;
    (buffer = []);
    (form = form.slice());
    (formName = form.shift());
    if ((form.length < 1)) {
      throw Error((pr(formName) + " expects no less than " + pr(1) + " arguments"));
      _ref0 = undefined;
    } else {
      _ref0 = undefined;
    }
    _ref0;
    if (((form.length === 1))) {
      assertArg(car(form), isVarName, "valid identifier");
      (scope = declareVar(car(form), scope));
      (_ref2 = compileAdd(car(form), buffer, scope, opts));
      buffer = _ref2[0];
      _ref1 = scope = _ref2[1];
    } else {
      assertArg(form, (function() {
        return (((arguments[0].length % 2) === 0));
      }), "even number of arguments");
      _res = [];
      while ((form.length > 0)) {
        (left = form.shift());
        (right = form.shift());
        (_ref3 = compileGetLast(right, buffer, scope, opts));
        right = _ref3[0];
        buffer = _ref3[1];
        scope = _ref3[2];
        if ((isList(left) && ((car(left) === "get")))) {
          (_ref5 = compileGetLast(left, buffer, scope, opts));
          left = _ref5[0];
          buffer = _ref5[1];
          scope = _ref5[2];
          _ref4 = buffer.push(("(" + pr(left) + " = " + pr(right) + ")"));
        } else if (isList(left)) {
          if (opts.function) {
            _ref6 = args;
          } else {
            _ref6 = undefined;
          }(_ref7 = declareService("_ref", scope, _ref6));
          ref = _ref7[0];
          scope = _ref7[1];
          if (opts.function) {
            _ref8 = args;
          } else {
            _ref8 = undefined;
          }(_ref9 = declareService("_i", scope, _ref8));
          ind = _ref9[0];
          scope = _ref9[1];
          buffer.push(("(" + ref + " = " + pr(right) + ")"));
          (spreads = 0);
          _res0 = [];
          _ref10 = left;
          for (i = 0; i < _ref10.length; ++i) {
            name = _ref10[i];
            if (((car(name) === "spread"))) {
              if ((++spreads > 1)) {
                throw Error("an assignment can only have one spread");
                _ref12 = undefined;
              } else {
                _ref12 = undefined;
              }
              _ref12;
              (_ref13 = compileGetLast(name, buffer, scope, opts));
              name = _ref13[0];
              buffer = _ref13[1];
              scope = _ref13[2];
              assertArg(name, isVarName, "valid identifier");
              (scope = declareVar(name, scope));
              (spreadname = name);
              (spreadind = i);
              _ref11 = buffer.push(("var " + spreadname + " = " + left.length + " <= " + ref + ".length ? [].slice.call(" + ref + ", " + spreadind + ", " + ind + " = " + ref + ".length - " + (left.length - spreadind - 1) + ") : (" + ind + " = " + spreadind + ", [])"));
            } else if ((!(typeof spreadname !== 'undefined' && spreadname !== null))) {
              if (isVarName(name)) {
                assertArg(name, isVarName, "valid identifier");
                _ref14 = (scope = declareVar(name, scope));
              } else {
                _ref14 = undefined;
              }
              _ref14;
              _ref11 = buffer.push((pr(name) + " = " + ref + "[" + i + "]"));
            } else {
              if (isVarName(name)) {
                assertArg(name, isVarName, "valid identifier");
                _ref15 = (scope = declareVar(name, scope));
              } else {
                _ref15 = undefined;
              }
              _ref15;
              _ref11 = buffer.push((pr(name) + " = " + ref + "[" + ind + "++]"));
            }
            _res0.push(_ref11);
          }
          _ref4 = _res0;
        } else {
          if (isVarName(left)) {
            assertArg(left, isVarName, "valid identifier");
            _ref16 = (scope = declareVar(left, scope));
          } else {
            _ref16 = undefined;
          }
          _ref16;
          assertArg(left, isIdentifier);
          _ref4 = buffer.push(("(" + pr(left) + " = " + pr(right) + ")"));
        }
        _res.push(_ref4);
      }
      _ref1 = _res;
    }
    _ref1;
    return Array(buffer, scope);
  }));
  (specials.fn = (function(form, scope, opts) {
    var buffer, formName, outerScope, args, body, optionals, spreads, i, arg, ind, name, restname, rest, vars, funcs, dec, func, _ref, _ref0, _i, _ref1, _ref2, _res, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _i0, _ref9, _i1, _ref10, _ref11, _i2, _ref12, _ref13, _ref14, _i3, _res0, _ref15, _ref16, _ref17, _i4, _res1, _ref18, _ref19, _res2, _ref110, _ref111, _ref112, _res3, _ref113, _ref114, _i5, _res4, _ref115, _ref116;
    if ((!(typeof opts !== 'undefined' && opts !== null))) {
      _ref = (opts = {});
    } else {
      _ref = undefined;
    }
    _ref;
    (buffer = []);
    (form = form.slice());
    (formName = form.shift());
    (outerScope = scope);
    (scope = {
      hoist: outerScope.hoist.slice(),
      service: outerScope.service.slice()
    });
    (_ref0 = form);
    var args = 2 <= _ref0.length ? [].slice.call(_ref0, 0, _i = _ref0.length - 1) : (_i = 0, []);
    body = _ref0[_i++];
    (_ref1 = scope.hoist).push.apply(_ref1, [].concat(getArgNames(args)));
    if ((!(typeof body !== 'undefined' && body !== null))) {
      _ref2 = (body = []);
    } else {
      _ref2 = undefined;
    }
    _ref2;
    (optionals = []);
    (spreads = 0);
    _res = [];
    _ref3 = args;
    for (i = 0; i < _ref3.length; ++i) {
      arg = _ref3[i];
      if (isList(arg)) {
        assertArg(arg, (function() {
          return ((arguments[0].length === 2));
        }), "optional or rest parameter");
        if (((car(arg) === "spread"))) {
          if ((++spreads > 1)) {
            throw Error("cannot define more than one rest parameter");
            _ref6 = undefined;
          } else {
            _ref6 = undefined;
          }
          _ref6;
          if (opts.function) {
            _ref7 = args;
          } else {
            _ref7 = undefined;
          }(_ref8 = declareService("_i", scope, _ref7));
          ind = _ref8[0];
          scope = _ref8[1];
          (_ref9 = compileGetLast(arg, buffer, scope, opts));
          name = _ref9[0];
          buffer = _ref9[1];
          scope = _ref9[2];
          assertArg(name, isVarName, "valid identifier");
          (args[i] = (restname = name));
          _ref5 = (rest = list((name + " = " + args.length + " <= arguments.length ? [].slice.call(arguments, " + i + ", " + ind + " = arguments.length - " + (args.length - i - 1) + ") : (" + ind + " = " + ind + ", [])")));
        } else {
          assertArg((name = car(arg)), isVarName, "valid parameter name");
          (args[i] = name);
          _ref5 = optionals.push(["if", ["not", ["?", name]],
            ["=", name, arg[1]]
          ]);
        }
        _ref4 = _ref5;
      } else if (restname) {
        _ref4 = rest.push((pr(arg) + " = arguments[" + ind + "++]"));
      } else {
        _ref4 = undefined;
      }
      _res.push(_ref4);
    }
    _res;
    if ((optionals.length > 0)) {
      _ref10 = (body = [].concat(["do"]).concat(optionals).concat([body]));
    } else {
      _ref10 = undefined;
    }
    _ref10;
    (body = returnify(body));
    (_ref11 = compileResolve(body, buffer, scope, opts));
    body = _ref11[0];
    buffer = _ref11[1];
    scope = _ref11[2];
    if (rest) {
      _ref12 = (_ref13 = body).unshift.apply(_ref13, [].concat(rest));
    } else {
      _ref12 = undefined;
    }
    _ref12;
    (vars = []);
    (funcs = []);
    (dec = "var ");
    if ((!(typeof args !== 'undefined' && args !== null))) {
      _ref14 = (args = []);
    } else {
      _ref14 = undefined;
    }
    _ref14;
    _res0 = [];
    _ref15 = scope.hoist;
    for (_i3 = 0; _i3 < _ref15.length; ++_i3) {
      name = _ref15[_i3];
      if (((!([].indexOf.call(outerScope.hoist, name) >= 0)) && (!([].indexOf.call(args, name) >= 0)))) {
        if ((([].indexOf.call(Object.keys(toplevel), name) >= 0) || ([].indexOf.call(Object.keys(opFuncs), name) >= 0))) {
          _ref17 = funcs.push(name);
        } else {
          _ref17 = vars.push(name);
        }
        _ref16 = _ref17;
      } else {
        _ref16 = undefined;
      }
      _res0.push(_ref16);
    }
    _res0;
    _res1 = [];
    _ref18 = scope.service;
    for (_i4 = 0; _i4 < _ref18.length; ++_i4) {
      name = _ref18[_i4];
      if ((!([].indexOf.call(outerScope.service, name) >= 0))) {
        _ref19 = vars.push(name);
      } else {
        _ref19 = undefined;
      }
      _res1.push(_ref19);
    }
    _res1;
    _res2 = [];
    while ((vars.length > 0)) {
      (name = vars.shift());
      if (([].indexOf.call(vars, name) >= 0)) {
        throw Error(("compiler error: duplicate var in declarations:" + name));
        _ref110 = undefined;
      } else {
        _ref110 = undefined;
      }
      _ref110;
      _res2.push((dec += (name + ", ")));
    }
    _res2;
    if ((dec.length > 4)) {
      (dec = dec.slice(0, (dec.length - 2)));
      _ref111 = body.unshift(dec);
    } else {
      _ref111 = undefined;
    }
    _ref111;
    if (((typeof isTopLevel !== 'undefined' && isTopLevel !== null) && isTopLevel)) {
      _res3 = [];
      while ((funcs.length > 0)) {
        (func = funcs.pop());
        if (([].indexOf.call(funcs, func) >= 0)) {
          throw Error(("compiler error: duplicate func in declarations:" + func));
          _ref113 = undefined;
        } else {
          _ref113 = undefined;
        }
        _ref113;
        if (([].indexOf.call(Object.keys(toplevel), func) >= 0)) {
          _ref114 = body.unshift(toplevel[func].toString());
        } else if (([].indexOf.call(Object.keys(opFuncs), func) >= 0)) {
          _ref114 = body.unshift(("var " + opFuncs[func].name + " = " + opFuncs[func].func));
        } else {
          throw Error(("unrecognised func: " + pr(func)));
          _ref114 = undefined;
        }
        _res3.push(_ref114);
      }
      _ref112 = _res3;
    } else {
      _res4 = [];
      _ref115 = funcs;
      for (_i5 = 0; _i5 < _ref115.length; ++_i5) {
        func = _ref115[_i5];
        if ((!([].indexOf.call(outerScope.hoist, func) >= 0))) {
          _ref116 = outerScope.hoist.push(func);
        } else {
          _ref116 = undefined;
        }
        _res4.push(_ref116);
      }
      _ref112 = _res4;
    }
    _ref112;
    (scope = outerScope);
    buffer.push(("(function(" + spr(args) + ") {" + render(body) + " })"));
    return Array(buffer, scope);
  }));
  (specials.def = (function(form, scope, opts) {
    var buffer, formName, outerScope, fname, args, body, optionals, spreads, i, arg, ind, name, restname, rest, vars, funcs, dec, func, _ref, _ref0, _i, _ref1, _ref2, _res, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _i0, _ref9, _i1, _ref10, _ref11, _i2, _ref12, _ref13, _ref14, _i3, _res0, _ref15, _ref16, _ref17, _i4, _res1, _ref18, _ref19, _res2, _ref110, _ref111, _ref112, _res3, _ref113, _ref114, _i5, _res4, _ref115, _ref116;
    if ((!(typeof opts !== 'undefined' && opts !== null))) {
      _ref = (opts = {});
    } else {
      _ref = undefined;
    }
    _ref;
    (buffer = []);
    (form = form.slice());
    (formName = form.shift());
    (outerScope = scope);
    (scope = {
      hoist: outerScope.hoist.slice(),
      service: outerScope.service.slice()
    });
    (_ref0 = form);
    fname = _ref0[0];
    var args = 3 <= _ref0.length ? [].slice.call(_ref0, 1, _i = _ref0.length - 1) : (_i = 1, []);
    body = _ref0[_i++];
    assertArg(fname, isVarName, "valid function name");
    (_ref1 = scope.hoist).push.apply(_ref1, [].concat(getArgNames(args)));
    if ((!(typeof body !== 'undefined' && body !== null))) {
      _ref2 = (body = []);
    } else {
      _ref2 = undefined;
    }
    _ref2;
    (optionals = []);
    (spreads = 0);
    _res = [];
    _ref3 = args;
    for (i = 0; i < _ref3.length; ++i) {
      arg = _ref3[i];
      if (isList(arg)) {
        assertArg(arg, (function() {
          return ((arguments[0].length === 2));
        }), "optional or rest parameter");
        if (((car(arg) === "spread"))) {
          if ((++spreads > 1)) {
            throw Error("cannot define more than one rest parameter");
            _ref6 = undefined;
          } else {
            _ref6 = undefined;
          }
          _ref6;
          if (opts.function) {
            _ref7 = args;
          } else {
            _ref7 = undefined;
          }(_ref8 = declareService("_i", scope, _ref7));
          ind = _ref8[0];
          scope = _ref8[1];
          (_ref9 = compileGetLast(arg, buffer, scope, opts));
          name = _ref9[0];
          buffer = _ref9[1];
          scope = _ref9[2];
          assertArg(name, isVarName, "valid identifier");
          (args[i] = (restname = name));
          _ref5 = (rest = list((name + " = " + args.length + " <= arguments.length ? [].slice.call(arguments, " + i + ", " + ind + " = arguments.length - " + (args.length - i - 1) + ") : (" + ind + " = " + ind + ", [])")));
        } else {
          assertArg((name = car(arg)), isVarName, "valid parameter name");
          (args[i] = name);
          _ref5 = optionals.push(["if", ["not", ["?", name]],
            ["=", name, arg[1]]
          ]);
        }
        _ref4 = _ref5;
      } else if (restname) {
        _ref4 = rest.push((pr(arg) + " = arguments[" + ind + "++]"));
      } else {
        _ref4 = undefined;
      }
      _res.push(_ref4);
    }
    _res;
    if ((optionals.length > 0)) {
      _ref10 = (body = [].concat(["do"]).concat(optionals).concat([body]));
    } else {
      _ref10 = undefined;
    }
    _ref10;
    (body = returnify(body));
    (_ref11 = compileResolve(body, buffer, scope, opts));
    body = _ref11[0];
    buffer = _ref11[1];
    scope = _ref11[2];
    if (rest) {
      _ref12 = (_ref13 = body).unshift.apply(_ref13, [].concat(rest));
    } else {
      _ref12 = undefined;
    }
    _ref12;
    (vars = []);
    (funcs = []);
    (dec = "var ");
    if ((!(typeof args !== 'undefined' && args !== null))) {
      _ref14 = (args = []);
    } else {
      _ref14 = undefined;
    }
    _ref14;
    _res0 = [];
    _ref15 = scope.hoist;
    for (_i3 = 0; _i3 < _ref15.length; ++_i3) {
      name = _ref15[_i3];
      if (((!([].indexOf.call(outerScope.hoist, name) >= 0)) && (!([].indexOf.call(args, name) >= 0)))) {
        if ((([].indexOf.call(Object.keys(toplevel), name) >= 0) || ([].indexOf.call(Object.keys(opFuncs), name) >= 0))) {
          _ref17 = funcs.push(name);
        } else {
          _ref17 = vars.push(name);
        }
        _ref16 = _ref17;
      } else {
        _ref16 = undefined;
      }
      _res0.push(_ref16);
    }
    _res0;
    _res1 = [];
    _ref18 = scope.service;
    for (_i4 = 0; _i4 < _ref18.length; ++_i4) {
      name = _ref18[_i4];
      if ((!([].indexOf.call(outerScope.service, name) >= 0))) {
        _ref19 = vars.push(name);
      } else {
        _ref19 = undefined;
      }
      _res1.push(_ref19);
    }
    _res1;
    _res2 = [];
    while ((vars.length > 0)) {
      (name = vars.shift());
      if (([].indexOf.call(vars, name) >= 0)) {
        throw Error(("compiler error: duplicate var in declarations:" + name));
        _ref110 = undefined;
      } else {
        _ref110 = undefined;
      }
      _ref110;
      _res2.push((dec += (name + ", ")));
    }
    _res2;
    if ((dec.length > 4)) {
      (dec = dec.slice(0, (dec.length - 2)));
      _ref111 = body.unshift(dec);
    } else {
      _ref111 = undefined;
    }
    _ref111;
    if (((typeof isTopLevel !== 'undefined' && isTopLevel !== null) && isTopLevel)) {
      _res3 = [];
      while ((funcs.length > 0)) {
        (func = funcs.pop());
        if (([].indexOf.call(funcs, func) >= 0)) {
          throw Error(("compiler error: duplicate func in declarations:" + func));
          _ref113 = undefined;
        } else {
          _ref113 = undefined;
        }
        _ref113;
        if (([].indexOf.call(Object.keys(toplevel), func) >= 0)) {
          _ref114 = body.unshift(toplevel[func].toString());
        } else if (([].indexOf.call(Object.keys(opFuncs), func) >= 0)) {
          _ref114 = body.unshift(("var " + opFuncs[func].name + " = " + opFuncs[func].func));
        } else {
          throw Error(("unrecognised func: " + pr(func)));
          _ref114 = undefined;
        }
        _res3.push(_ref114);
      }
      _ref112 = _res3;
    } else {
      _res4 = [];
      _ref115 = funcs;
      for (_i5 = 0; _i5 < _ref115.length; ++_i5) {
        func = _ref115[_i5];
        if ((!([].indexOf.call(outerScope.hoist, func) >= 0))) {
          _ref116 = outerScope.hoist.push(func);
        } else {
          _ref116 = undefined;
        }
        _res4.push(_ref116);
      }
      _ref112 = _res4;
    }
    _ref112;
    (scope = outerScope);
    buffer.push(("function " + fname + "(" + spr(args) + ") {" + render(body) + " }"));
    buffer.push(fname);
    return Array(buffer, scope);
  }));
  (specials.if = (function(form, scope, opts) {
    var buffer, formName, predicate, prebranch, midcases, postbranch, collector, i, mid, midtest, midbranch, comp, _ref, _ref0, _i, _ref1, _ref2, _ref3, _i0, _ref4, _i1, _ref5, _ref6, _i2, _res, _ref7, _ref8, _i3, _ref9, _i4, _ref10, _ref11, _ref12, _i5, _ref13, _i6, _i7, _res0, _ref14, _ref15;
    if ((!(typeof opts !== 'undefined' && opts !== null))) {
      _ref = (opts = {});
    } else {
      _ref = undefined;
    }
    _ref;
    (buffer = []);
    (form = form.slice());
    (formName = form.shift());
    (_ref0 = form);
    predicate = _ref0[0];
    prebranch = _ref0[1];
    var midcases = 4 <= _ref0.length ? [].slice.call(_ref0, 2, _i = _ref0.length - 1) : (_i = 2, []);
    postbranch = _ref0[_i++];
    if (((typeof postbranch !== 'undefined' && postbranch !== null) && ((car(postbranch) === 'elif')))) {
      midcases.push(postbranch);
      _ref1 = (postbranch = undefined);
    } else {
      _ref1 = undefined;
    }
    _ref1;
    if (opts.function) {
      _ref2 = args;
    } else {
      _ref2 = undefined;
    }(_ref3 = declareService("_ref", scope, _ref2));
    collector = _ref3[0];
    scope = _ref3[1];

    function collect(compiled, collector, isCase) {
      var plug, lastItem, _ref4, _ref5, _ref6, _ref7, _ref8;
      if ((!(typeof isCase !== 'undefined' && isCase !== null))) {
        _ref4 = (isCase = false);
      } else {
        _ref4 = undefined;
      }
      _ref4;
      if ((isList(compiled) && (compiled.length > 0))) {
        if (/\{$/.test(last(compiled))) {
          _ref6 = (plug = compiled.pop());
        } else {
          _ref6 = undefined;
        }
        _ref6;
        (lastItem = compiled.pop());
        if (/^return\s/.test(lastItem)) {
          _ref7 = (lastItem = lastItem.replace(/^return\s/, ("return " + collector + " = ")));
        } else if (util.kwtest(lastItem)) {
          _ref7 = (lastItem = (collector + " = undefined; " + lastItem));
        } else {
          _ref7 = (lastItem = (collector + " = " + pr(lastItem)));
        }
        _ref7;
        compiled.push(lastItem);
        if ((typeof plug !== 'undefined' && plug !== null)) {
          _ref8 = compiled.push(plug);
        } else {
          _ref8 = undefined;
        }
        _ref5 = _ref8;
      } else {
        _ref5 = undefined;
      }
      _ref5;
      return compiled;
    }
    collect;
    (_ref4 = compileGetLast(predicate, buffer, scope, opts));
    predicate = _ref4[0];
    buffer = _ref4[1];
    scope = _ref4[2];
    if ((!(typeof predicate !== 'undefined' && predicate !== null))) {
      _ref5 = (predicate = "false");
    } else {
      _ref5 = undefined;
    }
    _ref5;
    (_ref6 = compileResolve(prebranch, buffer, scope, opts));
    prebranch = _ref6[0];
    buffer = _ref6[1];
    scope = _ref6[2];
    (prebranch = collect(prebranch, collector));
    _res = [];
    _ref7 = midcases;
    for (i = 0; i < _ref7.length; ++i) {
      mid = _ref7[i];
      assertArg(mid, (function(x) {
        return ((x.shift() === 'elif'));
      }), 'elif');
      (_ref8 = mid);
      midtest = _ref8[0];
      midbranch = _ref8[1];
      (_ref9 = compileResolve(midtest, buffer, scope, opts));
      midtest = _ref9[0];
      buffer = _ref9[1];
      scope = _ref9[2];
      if ((!(typeof midtest !== 'undefined' && midtest !== null))) {
        _ref10 = (midtest = "false");
      } else {
        _ref10 = undefined;
      }
      _ref10;
      if ((midtest.length > 1)) {
        throw Error((pr('elif') + " must compile to single expression (todo fix later); got:" + pr(midtest)));
        _ref11 = undefined;
      } else {
        _ref11 = undefined;
      }
      _ref11;
      (_ref12 = compileResolve(midbranch, buffer, scope, opts));
      midbranch = _ref12[0];
      buffer = _ref12[1];
      scope = _ref12[2];
      _res.push((midcases[i] = {
        test: midtest,
        branch: collect(midbranch, collector)
      }));
    }
    _res;
    (_ref13 = compileResolve(postbranch, buffer, scope, opts));
    postbranch = _ref13[0];
    buffer = _ref13[1];
    scope = _ref13[2];
    (postbranch = collect(postbranch, collector));
    (comp = ("if (" + pr(predicate) + ") { " + render(prebranch) + " } "));
    _res0 = [];
    _ref14 = midcases;
    for (_i7 = 0; _i7 < _ref14.length; ++_i7) {
      mid = _ref14[_i7];
      _res0.push((comp += (" else if (" + spr(mid.test) + ") { " + render(mid.branch) + " }")));
    }
    _res0;
    if ((typeof postbranch !== 'undefined' && postbranch !== null)) {
      _ref15 = (comp += (" else { " + render(postbranch) + " }"));
    } else {
      _ref15 = undefined;
    }
    _ref15;
    buffer.push(comp, collector);
    return Array(buffer, scope);
  }));
  (specials.switch = (function(form, scope, opts) {
    var buffer, formName, predicate, midcases, postbranch, collector, i, mid, midtest, midbranch, comp, _ref, _ref0, _i, _ref1, _ref2, _ref3, _i0, _ref4, _i1, _ref5, _res, _ref6, _ref7, _i2, _ref8, _i3, _ref9, _ref10, _ref11, _i4, _ref12, _i5, _i6, _res0, _ref13;
    if ((!(typeof opts !== 'undefined' && opts !== null))) {
      _ref = (opts = {});
    } else {
      _ref = undefined;
    }
    _ref;
    (buffer = []);
    (form = form.slice());
    (formName = form.shift());
    (_ref0 = form);
    predicate = _ref0[0];
    var midcases = 3 <= _ref0.length ? [].slice.call(_ref0, 1, _i = _ref0.length - 1) : (_i = 1, []);
    postbranch = _ref0[_i++];
    if (((typeof postbranch !== 'undefined' && postbranch !== null) && ((car(postbranch) === "case")))) {
      midcases.push(postbranch);
      _ref1 = (postbranch = undefined);
    } else {
      _ref1 = undefined;
    }
    _ref1;
    if (opts.function) {
      _ref2 = args;
    } else {
      _ref2 = undefined;
    }(_ref3 = declareService("_ref", scope, _ref2));
    collector = _ref3[0];
    scope = _ref3[1];

    function collect(compiled, collector, isCase) {
      var plug, lastItem, _ref4, _ref5, _ref6, _ref7, _ref8;
      if ((!(typeof isCase !== 'undefined' && isCase !== null))) {
        _ref4 = (isCase = false);
      } else {
        _ref4 = undefined;
      }
      _ref4;
      if ((isList(compiled) && (compiled.length > 0))) {
        if (/\{$/.test(last(compiled))) {
          _ref6 = (plug = compiled.pop());
        } else {
          _ref6 = undefined;
        }
        _ref6;
        (lastItem = compiled.pop());
        if (/^return\s/.test(lastItem)) {
          _ref7 = (lastItem = lastItem.replace(/^return\s/, ("return " + collector + " = ")));
        } else if (util.kwtest(lastItem)) {
          _ref7 = (lastItem = (collector + " = undefined; " + lastItem));
        } else {
          _ref7 = (lastItem = (collector + " = " + pr(lastItem)));
        }
        _ref7;
        compiled.push(lastItem);
        compiled.push("break");
        if ((typeof plug !== 'undefined' && plug !== null)) {
          _ref8 = compiled.push(plug);
        } else {
          _ref8 = undefined;
        }
        _ref5 = _ref8;
      } else {
        _ref5 = undefined;
      }
      _ref5;
      return compiled;
    }
    collect;
    (_ref4 = compileGetLast(predicate, buffer, scope, opts));
    predicate = _ref4[0];
    buffer = _ref4[1];
    scope = _ref4[2];
    if ((!(typeof predicate !== 'undefined' && predicate !== null))) {
      _ref5 = (predicate = "false");
    } else {
      _ref5 = undefined;
    }
    _ref5;
    _res = [];
    _ref6 = midcases;
    for (i = 0; i < _ref6.length; ++i) {
      mid = _ref6[i];
      assertArg(mid, (function(x) {
        return ((x.shift() === "case"));
      }), "case");
      (_ref7 = mid);
      midtest = _ref7[0];
      midbranch = _ref7[1];
      (_ref8 = compileResolve(midtest, buffer, scope, opts));
      midtest = _ref8[0];
      buffer = _ref8[1];
      scope = _ref8[2];
      if ((!(typeof midtest !== 'undefined' && midtest !== null))) {
        _ref9 = (midtest = "false");
      } else {
        _ref9 = undefined;
      }
      _ref9;
      if ((midtest.length > 1)) {
        throw Error((pr("case") + " must compile to single expression (todo fix later); got:" + pr(midtest)));
        _ref10 = undefined;
      } else {
        _ref10 = undefined;
      }
      _ref10;
      (_ref11 = compileResolve(midbranch, buffer, scope, opts));
      midbranch = _ref11[0];
      buffer = _ref11[1];
      scope = _ref11[2];
      _res.push((midcases[i] = {
        test: midtest,
        branch: collect(midbranch, collector)
      }));
    }
    _res;
    (_ref12 = compileResolve(postbranch, buffer, scope, opts));
    postbranch = _ref12[0];
    buffer = _ref12[1];
    scope = _ref12[2];
    (postbranch = collect(postbranch, collector));
    (comp = ("switch (" + pr(predicate) + ") { "));
    _res0 = [];
    _ref13 = midcases;
    for (_i6 = 0; _i6 < _ref13.length; ++_i6) {
      mid = _ref13[_i6];
      _res0.push((comp += (" case " + spr(mid.test) + ": " + render(mid.branch))));
    }
    _res0;
    (comp += (" default: " + render(postbranch) + " }"));
    buffer.push(comp, collector);
    return Array(buffer, scope);
  }));
  (specials.for = (function(form, scope, opts) {
    var buffer, formName, value, key, iterable, body, collector, ref, _ref, _ref0, _ref1, _ref2, _i, _ref3, _ref4, _ref5, _ref6, _ref7, _i0, _ref8, _ref9, _i1, _ref10, _ref11, _i2, _ref12, _ref13, _i3, _ref14, _ref15, _i4, _ref16, _i5, _ref17, _i6;
    if ((!(typeof opts !== 'undefined' && opts !== null))) {
      _ref = (opts = {});
    } else {
      _ref = undefined;
    }
    _ref;
    (buffer = []);
    (form = form.slice());
    (formName = form.shift());
    if ((form.length < 2)) {
      throw Error((pr(formName) + " expects no less than " + pr(2) + " arguments"));
      _ref0 = undefined;
    } else {
      _ref0 = undefined;
    }
    _ref0;
    if ((form.length > 4)) {
      throw Error((pr(formName) + " expects no more than " + pr(4) + " arguments"));
      _ref1 = undefined;
    } else {
      _ref1 = undefined;
    }
    _ref1;
    (_ref2 = form);
    value = _ref2[0];
    key = _ref2[1];
    iterable = _ref2[2];
    body = _ref2[3];
    if ((!(typeof body !== 'undefined' && body !== null))) {
      if ((!(typeof iterable !== 'undefined' && iterable !== null))) {
        if ((isNaN(Number(value)) || (!(parseInt(value) > 0)))) {
          throw Error(("expecting integer, got " + pr(value)));
          _ref5 = undefined;
        } else {
          _ref5 = undefined;
        }
        _ref5;
        (body = key);
        (iterable = ["quote", [range, 1, [parseInt, value]]]);
        if (opts.function) {
          _ref6 = args;
        } else {
          _ref6 = undefined;
        }(_ref7 = declareService('_i', scope, _ref6));
        key = _ref7[0];
        scope = _ref7[1];
        if (opts.function) {
          _ref8 = args;
        } else {
          _ref8 = undefined;
        }(_ref9 = declareService("_val", scope, _ref8));
        value = _ref9[0];
        _ref4 = scope = _ref9[1];
      } else {
        (body = iterable);
        (iterable = key); if (opts.function) {
          _ref10 = args;
        } else {
          _ref10 = undefined;
        }(_ref11 = declareService('_i', scope, _ref10));
        key = _ref11[0];
        scope = _ref11[1];
        assertArg(value, isVarName, "valid identifier");
        _ref4 = (scope = declareVar(value, scope));
      }
      _ref3 = _ref4;
    } else {
      assertArg(key, isVarName, "valid identifier");
      (scope = declareVar(key, scope));
      assertArg(value, isVarName, "valid identifier");
      _ref3 = (scope = declareVar(value, scope));
    }
    _ref3;
    assertArg(key, isVarName, "valid identifier");
    assertArg(value, isVarName, "valid identifier");
    if (opts.function) {
      _ref12 = args;
    } else {
      _ref12 = undefined;
    }(_ref13 = declareService("_res", scope, _ref12));
    collector = _ref13[0];
    scope = _ref13[1];
    if (opts.function) {
      _ref14 = args;
    } else {
      _ref14 = undefined;
    }(_ref15 = declareService("_ref", scope, _ref14));
    ref = _ref15[0];
    scope = _ref15[1];
    buffer.push((collector + " = []"));
    (_ref16 = compileGetLast(iterable, buffer, scope, opts));
    iterable = _ref16[0];
    buffer = _ref16[1];
    scope = _ref16[2];
    buffer.push((ref + " = " + iterable));
    (_ref17 = compileResolve(body, buffer, scope, opts));
    body = _ref17[0];
    buffer = _ref17[1];
    scope = _ref17[2];
    body.push((collector + ".push(" + pr(body.pop()) + ")"));
    buffer.push(("for (" + key + " = 0; " + key + " < " + ref + ".length; ++" + key + ") { " + value + " = " + ref + "[" + key + "]; " + render(body) + " }"));
    buffer.push(collector);
    return Array(buffer, scope);
  }));
  (specials.over = (function(form, scope, opts) {
    var buffer, formName, value, key, iterable, body, collector, ref, _ref, _ref0, _ref1, _ref2, _i, _ref3, _ref4, _ref5, _i0, _ref6, _ref7, _i1, _ref8, _ref9, _i2, _ref10, _ref11, _i3, _ref12, _ref13, _i4, _ref14, _i5, _ref15, _i6;
    if ((!(typeof opts !== 'undefined' && opts !== null))) {
      _ref = (opts = {});
    } else {
      _ref = undefined;
    }
    _ref;
    (buffer = []);
    (form = form.slice());
    (formName = form.shift());
    if ((form.length < 2)) {
      throw Error((pr(formName) + " expects no less than " + pr(2) + " arguments"));
      _ref0 = undefined;
    } else {
      _ref0 = undefined;
    }
    _ref0;
    if ((form.length > 4)) {
      throw Error((pr(formName) + " expects no more than " + pr(4) + " arguments"));
      _ref1 = undefined;
    } else {
      _ref1 = undefined;
    }
    _ref1;
    (_ref2 = form);
    value = _ref2[0];
    key = _ref2[1];
    iterable = _ref2[2];
    body = _ref2[3];
    if ((!(typeof body !== 'undefined' && body !== null))) {
      (body = iterable);
      (iterable = key);
      if (opts.function) {
        _ref4 = args;
      } else {
        _ref4 = undefined;
      }(_ref5 = declareService("_key", scope, _ref4));
      key = _ref5[0];
      scope = _ref5[1];
      assertArg(value, isVarName, "valid identifier");
      _ref3 = (scope = declareVar(value, scope));
    } else if ((!(typeof iterable !== 'undefined' && iterable !== null))) {
      (body = key);
      (iterable = value);
      if (opts.function) {
        _ref6 = args;
      } else {
        _ref6 = undefined;
      }(_ref7 = declareService("_key", scope, _ref6));
      key = _ref7[0];
      scope = _ref7[1];
      if (opts.function) {
        _ref8 = args;
      } else {
        _ref8 = undefined;
      }(_ref9 = declareService("_val", scope, _ref8));
      value = _ref9[0];
      _ref3 = scope = _ref9[1];
    } else {
      assertArg(key, isVarName, "valid identifier");
      (scope = declareVar(key, scope));
      assertArg(value, isVarName, "valid identifier");
      _ref3 = (scope = declareVar(value, scope));
    }
    _ref3;
    assertArg(key, isVarName, "valid identifier");
    assertArg(value, isVarName, "valid identifier");
    if (opts.function) {
      _ref10 = args;
    } else {
      _ref10 = undefined;
    }(_ref11 = declareService("_res", scope, _ref10));
    collector = _ref11[0];
    scope = _ref11[1];
    if (opts.function) {
      _ref12 = args;
    } else {
      _ref12 = undefined;
    }(_ref13 = declareService("_ref", scope, _ref12));
    ref = _ref13[0];
    scope = _ref13[1];
    buffer.push((collector + " = []"));
    (_ref14 = compileGetLast(iterable, buffer, scope, opts));
    iterable = _ref14[0];
    buffer = _ref14[1];
    scope = _ref14[2];
    buffer.push((ref + " = " + iterable));
    (_ref15 = compileResolve(body, buffer, scope, opts));
    body = _ref15[0];
    buffer = _ref15[1];
    scope = _ref15[2];
    body.push((collector + ".push(" + pr(body.pop()) + ")"));
    buffer.push(("for (" + key + " in " + ref + ") { " + value + " = " + ref + "[" + key + "]; " + render(body) + " }"));
    buffer.push(collector);
    return Array(buffer, scope);
  }));
  (specials.while = (function(form, scope, opts) {
    var buffer, formName, test, body, rvalue, collector, comp, _ref, _ref0, _ref1, _ref2, _i, _ref3, _ref4, _ref5, _i0, _ref6, _i1, _ref7, _i2, _ref8, _ref9, _ref10, _i3;
    if ((!(typeof opts !== 'undefined' && opts !== null))) {
      _ref = (opts = {});
    } else {
      _ref = undefined;
    }
    _ref;
    (buffer = []);
    (form = form.slice());
    (formName = form.shift());
    if ((form.length < 2)) {
      throw Error((pr(formName) + " expects no less than " + pr(2) + " arguments"));
      _ref0 = undefined;
    } else {
      _ref0 = undefined;
    }
    _ref0;
    if ((form.length > 3)) {
      throw Error((pr(formName) + " expects no more than " + pr(3) + " arguments"));
      _ref1 = undefined;
    } else {
      _ref1 = undefined;
    }
    _ref1;
    (_ref2 = form);
    test = _ref2[0];
    body = _ref2[1];
    rvalue = _ref2[2];
    if (((form.length === 2))) {
      if (opts.function) {
        _ref4 = args;
      } else {
        _ref4 = undefined;
      }(_ref5 = declareService("_res", scope, _ref4));
      collector = _ref5[0];
      scope = _ref5[1];
      _ref3 = buffer.push((collector + " = []"));
    } else {
      _ref3 = (comp = "");
    }
    _ref3;
    (_ref6 = compileGetLast(test, buffer, scope, opts));
    test = _ref6[0];
    buffer = _ref6[1];
    scope = _ref6[2];
    (_ref7 = compileResolve(body, buffer, scope, opts));
    body = _ref7[0];
    buffer = _ref7[1];
    scope = _ref7[2];
    if (((form.length === 2))) {
      _ref8 = body.push((collector + ".push(" + pr(body.pop()) + ")"));
    } else {
      _ref8 = undefined;
    }
    _ref8;
    buffer.push(("while (" + pr(test) + ") { " + render(body) + " }"));
    if (((form.length === 2))) {
      _ref9 = buffer.push(collector);
    } else {
      (_ref10 = compileResolve(rvalue, buffer, scope, opts));
      rvalue = _ref10[0];
      buffer = _ref10[1];
      scope = _ref10[2];
      _ref9 = buffer.push(render(rvalue));
    }
    _ref9;
    return Array(buffer, scope);
  }));
  (specials.try = (function(form, scope, opts) {
    var buffer, formName, ref, tryForm, catchForm, finalForm, err, res, _ref, _ref0, _ref1, _ref2, _ref3, _i, _ref4, _i0, _ref5, _i1, _ref6, _ref7, _i2, _ref8, _ref9, _i3, _ref10, _ref11, _i4, _ref12, _ref13, _ref14, _i5, _ref15;
    if ((!(typeof opts !== 'undefined' && opts !== null))) {
      _ref = (opts = {});
    } else {
      _ref = undefined;
    }
    _ref;
    (buffer = []);
    (form = form.slice());
    (formName = form.shift());
    if ((form.length < 1)) {
      throw Error((pr(formName) + " expects no less than " + pr(1) + " arguments"));
      _ref0 = undefined;
    } else {
      _ref0 = undefined;
    }
    _ref0;
    if ((form.length > 3)) {
      throw Error((pr(formName) + " expects no more than " + pr(3) + " arguments"));
      _ref1 = undefined;
    } else {
      _ref1 = undefined;
    }
    _ref1;
    if (opts.function) {
      _ref2 = args;
    } else {
      _ref2 = undefined;
    }(_ref3 = declareService("_ref", scope, _ref2));
    ref = _ref3[0];
    scope = _ref3[1];
    (_ref4 = form);
    tryForm = _ref4[0];
    catchForm = _ref4[1];
    finalForm = _ref4[2];
    (_ref5 = compileResolve(tryForm, buffer, scope, opts));
    tryForm = _ref5[0];
    buffer = _ref5[1];
    scope = _ref5[2];
    tryForm.push((ref + " = " + pr(tryForm.pop())));
    if ((isList(catchForm) && ((car(catchForm) === "catch")))) {
      assertArg(catchForm, (function() {
        return ((arguments[0].length === 2) || (arguments[0].length === 3));
      }), "valid catch form");
      (_ref7 = catchForm);
      catchForm = _ref7[0];
      err = _ref7[1];
      catchForm = _ref7[2];
      assertArg(err, isVarName, "valid identifier");
      _ref6 = (scope = declareVar(err, scope));
    } else {
      if (opts.function) {
        _ref8 = args;
      } else {
        _ref8 = undefined;
      }(_ref9 = declareService("_err", scope, _ref8));
      err = _ref9[0];
      _ref6 = scope = _ref9[1];
    }
    _ref6;
    if ((!(typeof catchForm !== 'undefined' && catchForm !== null))) {
      _ref10 = (catchForm = []);
    } else {
      _ref10 = undefined;
    }
    _ref10;
    (_ref11 = compileResolve(catchForm, buffer, scope, opts));
    catchForm = _ref11[0];
    buffer = _ref11[1];
    scope = _ref11[2];
    catchForm.push((ref + " = " + pr(catchForm.pop())));
    if ((typeof finalForm !== 'undefined' && finalForm !== null)) {
      if ((isList(finalForm) && ((car(finalForm) === "finally")))) {
        assertArg(finalForm, (function() {
          return ((arguments[0].length === 2));
        }));
        _ref13 = (finalForm = last(finalForm));
      } else {
        _ref13 = undefined;
      }
      _ref13;
      (_ref14 = compileResolve(finalForm, buffer, scope, opts));
      finalForm = _ref14[0];
      buffer = _ref14[1];
      scope = _ref14[2];
      _ref12 = finalForm.push((ref + " = " + pr(finalForm.pop())));
    } else {
      _ref12 = undefined;
    }
    _ref12;
    (res = ("try { " + render(tryForm) + " } catch (" + pr(err) + ") { " + render(catchForm) + " }"));
    if ((typeof finalForm !== 'undefined' && finalForm !== null)) {
      _ref15 = (res += (" finally { " + render(finalForm) + " }"));
    } else {
      _ref15 = undefined;
    }
    _ref15;
    buffer.push(res, ref);
    return Array(buffer, scope);
  }));
  (specials.get = (function(form, scope, opts) {
    var buffer, formName, object, property, _ref, _ref0, _ref1, _ref2, _i, _ref3, _ref4, _i0, _ref5, _i1, _ref6;
    if ((!(typeof opts !== 'undefined' && opts !== null))) {
      _ref = (opts = {});
    } else {
      _ref = undefined;
    }
    _ref;
    (buffer = []);
    (form = form.slice());
    (formName = form.shift());
    if ((form.length < 1)) {
      throw Error((pr(formName) + " expects no less than " + pr(1) + " arguments"));
      _ref0 = undefined;
    } else {
      _ref0 = undefined;
    }
    _ref0;
    if ((form.length > 2)) {
      throw Error((pr(formName) + " expects no more than " + pr(2) + " arguments"));
      _ref1 = undefined;
    } else {
      _ref1 = undefined;
    }
    _ref1;
    (_ref2 = form);
    object = _ref2[0];
    property = _ref2[1];
    if ((!(typeof property !== 'undefined' && property !== null))) {
      (property = object);
      _ref3 = (object = "");
    } else {
      _ref3 = undefined;
    }
    _ref3;
    (_ref4 = compileGetLast(object, buffer, scope, opts));
    object = _ref4[0];
    buffer = _ref4[1];
    scope = _ref4[2];
    (_ref5 = compileGetLast(property, buffer, scope, opts));
    property = _ref5[0];
    buffer = _ref5[1];
    scope = _ref5[2];
    assertArg(object, (function() {
      return (typeof arguments[0] !== 'undefined' && arguments[0] !== null);
    }), "valid object");
    if (isVarName(property)) {
      _ref6 = buffer.push((pr(object) + "." + property));
    } else {
      _ref6 = buffer.push((pr(object) + "[" + pr(property) + "]"));
    }
    _ref6;
    return Array(buffer, scope);
  }));
  (specials.spread = (function(form, scope, opts) {
    var buffer, formName, _ref, _ref0, _ref1, _ref2, _ref3, _i;
    if ((!(typeof opts !== 'undefined' && opts !== null))) {
      _ref = (opts = {});
    } else {
      _ref = undefined;
    }
    _ref;
    (buffer = []);
    (form = form.slice());
    (formName = form.shift());
    if ((form.length < 1)) {
      throw Error((pr(formName) + " expects no less than " + pr(1) + " arguments"));
      _ref0 = undefined;
    } else {
      _ref0 = undefined;
    }
    _ref0;
    if ((form.length > 1)) {
      throw Error((pr(formName) + " expects no more than " + pr(1) + " arguments"));
      _ref1 = undefined;
    } else {
      _ref1 = undefined;
    }
    _ref1;
    (form = car(form));
    if (isList(form)) {
      (_ref3 = compileAdd(form, buffer, scope, opts));
      buffer = _ref3[0];
      _ref2 = scope = _ref3[1];
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
    var buffer, formName, _ref, _ref0, _ref1, _ref2, _i, _ref3;
    if ((!(typeof opts !== 'undefined' && opts !== null))) {
      _ref = (opts = {});
    } else {
      _ref = undefined;
    }
    _ref;
    (buffer = []);
    (form = form.slice());
    (formName = form.shift());
    if ((form.length > 1)) {
      throw Error((pr(formName) + " expects no more than " + pr(1) + " arguments"));
      _ref0 = undefined;
    } else {
      _ref0 = undefined;
    }
    _ref0;
    if (((form.length !== 0))) {
      (_ref2 = compileGetLast(car(form), buffer, scope, opts));
      form = _ref2[0];
      buffer = _ref2[1];
      scope = _ref2[2];
      if ((!/^return\s/.test(form))) {
        _ref3 = (form = ("return " + pr(form)));
      } else {
        _ref3 = undefined;
      }
      _ref3;
      _ref1 = buffer.push(form);
    } else {
      _ref1 = undefined;
    }
    _ref1;
    return Array(buffer, scope);
  }));
  (macros = {});

  function parseMacros(form) {
    var key, val, i, _ref, _res, _ref0, _ref1, _res0, _ref2;
    if (util.isHash(form)) {
      _res = [];
      _ref0 = form;
      for (key in _ref0) {
        val = _ref0[key];
        _res.push((form[key] = parseMacros(val)));
      }
      _ref = _res;
    } else if (util.isList(form)) {
      if (((car(form) === "mac"))) {
        _ref1 = (form = makeMacro(cdr(form)));
      } else {
        _res0 = [];
        _ref2 = form;
        for (i = 0; i < _ref2.length; ++i) {
          val = _ref2[i];
          _res0.push((form[i] = parseMacros(val)));
        }
        _ref1 = _res0;
      }
      _ref = _ref1;
    } else {
      _ref = undefined;
    }
    _ref;
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
    (_ref2 = compileForm(body, {
      hoist: [],
      service: []
    }, {
      macro: true
    }));
    compiled = _ref2[0];
    scope = _ref2[1];
    (rendered = render(compiled));
    (macros[name] = vm.runInThisContext(rendered));
    return [];
  }
  makeMacro;

  function expandMacros(form) {
    var key, val, i, _ref, _res, _ref0, _ref1, _ref2, _ref3, _res0, _ref4;
    if (util.isHash(form)) {
      _res = [];
      _ref0 = form;
      for (key in _ref0) {
        val = _ref0[key];
        _res.push((form[key] = expandMacros(val)));
      }
      _ref = _res;
    } else if (util.isList(form)) {
      if (((car(form) === "mac"))) {
        _ref1 = (form = parseMacros(form));
      } else if (([].indexOf.call(Object.keys(macros), car(form)) >= 0)) {
        (form = (_ref2 = macros)[car(form)].apply(_ref2, [].concat(cdr(form))));
        if ((((typeof form) === "undefined"))) {
          _ref3 = (form = []);
        } else {
          _ref3 = undefined;
        }
        _ref3;
        _ref1 = (form = expandMacros(form));
      } else {
        _res0 = [];
        _ref4 = form;
        for (i = 0; i < _ref4.length; ++i) {
          val = _ref4[i];
          _res0.push((form[i] = expandMacros(val)));
        }
        _ref1 = _res0;
      }
      _ref = _ref1;
    } else {
      _ref = undefined;
    }
    _ref;
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
  (exports.compile = (function(src, opts) {
    return compile(macroexpand(parse(lex(tokenise(src)))), opts);
  }));

  function compileFile(filename) {
    var raw, stripped, err, _ref, _ref0;
    (raw = fs.readFileSync(filename, "utf8"));
    if (((raw.charCodeAt(0) === 65279))) {
      _ref = raw.substring(1);
    } else {
      _ref = raw;
    }(stripped = _ref);
    try {
      _ref0 = exports.compile(stripped);
    } catch (err) {
      throw err;
      _ref0 = undefined;
    }
    return _ref0;
  }(exports.compileFile = compileFile);

  function run(code, options) {
    var mainModule, dir, _ref, _ref0, _ref1, _ref2, _ref3;
    if ((!(typeof options !== 'undefined' && options !== null))) {
      _ref = (options = {});
    } else {
      _ref = undefined;
    }
    _ref;
    (mainModule = require.main);
    if (options.filename) {
      _ref0 = fs.realpathSync(options.filename);
    } else {
      _ref0 = ".";
    }(mainModule.filename = (process.argv[1] = _ref0)); if (mainModule.moduleCache) {
      _ref1 = (mainModule.moduleCache = {});
    } else {
      _ref1 = undefined;
    }
    _ref1;
    if (options.filename) {
      _ref2 = path.dirname(fs.realpathSync(options.filename));
    } else {
      _ref2 = fs.realpathSync(".");
    }(dir = _ref2);
    (mainModule.paths = require("module")._nodeModulePaths(dir)); if (((!util.isJisp(mainModule.filename)) || require.extensions)) {
      _ref3 = (code = exports.compile(code));
    } else {
      _ref3 = undefined;
    }
    _ref3;
    return mainModule._compile(code, mainModule.filename);
  }
  return (exports.run = run);
}).call(this);