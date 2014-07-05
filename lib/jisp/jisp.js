(function() {
  function list() {
    var _i;
    args = 1 <= arguments.length ? [].slice.call(arguments, 0, _i = arguments.length - 0) : (_i = 0, []);
    return [].concat(args);
  }

  function range(start, end) {
    var a, _res, _ref;
    if (!(typeof end !== 'undefined' && end !== null)) {
      end = start;
      (start = 0);
    } else {}
    _res = [];
    while (true) {
      if (start <= end) {
        a = start;
        ++start;
        _ref = a;
      } else {
        _ref = undefined;
        break;
      }
      _res.push(_ref);
    }
    return _res;
  }
  var vm, fs, path, beautify, toplevel, util, ops, operators, opFuncs, tokenise, lex, parse, pr, spr, render, isAtom, isHash, isList, isVarName, isIdentifier, assertExp, toplevelRedeclare, toplevelRedefine, specials, macros;
  exports.version = "0.2.0";
  vm = require("vm");
  fs = require("fs");
  path = require("path");
  beautify = require("js-beautify");
  toplevel = require("./toplevel");
  util = require("./util");
  ops = require("./operators");
  operators = ops.operators;
  opFuncs = ops.opFuncs;
  tokenise = require("./tokenise");
  lex = require("./lex");
  parse = require("./parse");
  pr = util.pr;
  spr = util.spr;
  render = util.render;
  isAtom = util.isAtom;
  isHash = util.isHash;
  isList = util.isList;
  isVarName = util.isVarName;
  isIdentifier = util.isIdentifier;
  assertExp = util.assertExp;
  toplevelRedeclare = [];
  toplevelRedefine = [];

  function plusname(name) {
    return isNaN(Number(name.slice(-1)[0])) ? name + 0 : name.slice(0, -1) + (1 + Number(name.slice(-1)[0]));
  }
  plusname;

  function declareVar(name, scope) {
    var _ref;
    if ([].indexOf.call(scope.hoist, name, scope.hoist) >= 0) {
      _ref = scope;
    } else {
      scope.hoist.push(name);
      _ref = scope;
    }
    return _ref;
  }
  declareVar;

  function declareService(name, scope) {
    while (([].indexOf.call(scope.hoist, name, scope.hoist) >= 0) || ([].indexOf.call(scope.service, name, scope.service) >= 0)) {
      (name = plusname(name));
    }
    scope.service.push(name);
    return [name, scope];
  }
  declareService;

  function hasSpread(form) {
    return isList(form) && (form[0] === "spread");
  }
  hasSpread;

  function compileResolve(form, buffer, scope, opts, nested) {
    var compiled, i, name, newname, re, subst, str, _ref, _i, _ref0, _res, _ref1, _ref2;
    _ref = compileForm(form, scope, opts, nested);
    compiled = _ref[0];
    scope = _ref[1];
    _ref0 = scope.service;
    for (i in _ref0) {
      name = _ref0[i];
      if ([].indexOf.call(scope.hoist, name, scope.hoist) >= 0) {
        newname = name;
        while ([].indexOf.call(scope.hoist, newname, scope.hoist) >= 0) {
          (newname = plusname(newname));
        }
        scope.service[i] = newname;
        re = RegExp("(?=(?:[^$_A-Za-z0-9]{1}|^)" + name + "(?:[^$_A-Za-z0-9]{1}|$))([^$A-Za-z0-9]|^)" + name, "g");
        subst = "$1" + newname;
        _res = [];
        _ref1 = buffer;
        for (i = 0; i < _ref1.length; ++i) {
          str = _ref1[i];
          _res.push((typeof str !== 'undefined' && str !== null) && (typeof str === "string") ? (buffer[i] = str.replace(re, subst)) : undefined);
        }
        _ref2 = _res;
      } else {
        _ref2 = undefined;
      }
      _ref2;
    }
    return [compiled, buffer, scope];
  }
  compileResolve;

  function compileAdd(form, buffer, scope, opts, nested) {
    var compiled, _ref, _i;
    _ref = compileResolve(form, buffer, scope, opts, nested);
    compiled = _ref[0];
    buffer = _ref[1];
    scope = _ref[2];
    buffer.push.apply(buffer, [].concat(compiled));
    return [buffer, scope];
  }
  compileAdd;

  function compileGetLast(form, buffer, scope, opts, nested) {
    var lastItem, _ref, _i;
    _ref = compileAdd(form, buffer, scope, opts, nested);
    buffer = _ref[0];
    scope = _ref[1];
    lastItem = buffer.pop();
    return [lastItem, buffer, scope];
  }
  compileGetLast;

  function splitName(name) {
    var obj, method, _ref;
    if ((obj = name.match(/^[$_A-Za-z]{1}$|^[$_A-Za-z]+[$_\w]*([$_\w](?!\.))+$|^([$_.\[\]\w])+(?=\.|(\[.*(?=\[+).*\]))+|^(?:[$_.\[\]\w])+(?=\.|\[)+/))) {
      obj = obj[0];
      method = name.replace(obj, "");
      _ref = [obj, method];
    } else {
      _ref = [name, ""];
    }
    return _ref;
  }
  splitName;

  function returnify(form) {
    var _ref;
    if (isAtom(form) || isHash(form)) {
      _ref = ["return", form];
    } else if (isList(form) && (form[0] !== "return")) {
      _ref = ["return", form];
    } else {
      _ref = form;
    }
    return _ref;
  }
  returnify;

  function getArgNames(args) {
    var arr, arg, _i, _ref, _ref0;
    arr = [];
    _ref = args;
    for (_i = 0; _i < _ref.length; ++_i) {
      arg = _ref[_i];
      if (isAtom(arg) && isVarName(arg)) {
        _ref0 = arr.push(arg);
      } else if (isList(arg) && isVarName(arg[0]) && !(arg[0] === "spread")) {
        _ref0 = arr.push(arg[0]);
      } else {
        _ref0 = undefined;
      }
      _ref0;
    }
    return arr;
  }
  getArgNames;

  function notRedefined(name) {
    return !([].indexOf.call(toplevelRedeclare, name, toplevelRedeclare) >= 0) && !([].indexOf.call(toplevelRedefine, name, toplevelRedefine) >= 0);
  }
  notRedefined;

  function isPropertyExp(form) {
    return isList(form) && ((isList(form[0]) && (form[0].length === 2) && (form[0][0] === "get")) || util.isPropSyntax(form[0]));
  }
  isPropertyExp;

  function compileForm(form, scope, opts, nested) {
    var buffer, first, isOuterOperator, i, arg, argsSpread, name, method, collector, key, val, _ref, _i, _ref0, _i0, _ref1, _ref2, _ref3, _i1, _ref4, _i2, _ref5, _ref6, _i3, _ref7, _ref8, _i4, _ref9, _i5, _ref10, _ref11, _ref12, _i6, _ref13, _ref14, _ref15, _i7;
    !(typeof opts !== 'undefined' && opts !== null) ? (opts = {}) : undefined;
    if (isList(form) && util.isBlankObject(form)) {
      _ref13 = [
        [""], scope
      ];
    } else if (isAtom(form)) {
      if ((([].indexOf.call(Object.keys(toplevel), form, Object.keys(toplevel)) >= 0) && notRedefined(form)) || ([].indexOf.call(Object.keys(macros), form, Object.keys(macros)) >= 0)) {
        assertExp(form, isVarName, "valid identifier");
        (scope = declareVar(form, scope));
      } else if ([].indexOf.call(Object.keys(opFuncs), form, Object.keys(opFuncs)) >= 0) {
        assertExp(form, isVarName, "valid identifier");
        (scope = declareVar(form, scope));
        (form = opFuncs[form].name);
      } else {}
      _ref13 = [
        [form], scope
      ];
    } else if (isHash(form)) {
      buffer = [];
      nested = undefined;
      _ref14 = form;
      for (key in _ref14) {
        val = _ref14[key];
        _ref15 = compileGetLast(val, buffer, scope, opts, nested);
        form[key] = _ref15[0];
        buffer = _ref15[1];
        scope = _ref15[2];
      }
      buffer.push(form);
      _ref13 = [buffer, scope];
    } else {
      if (!isList(form)) {
        throw Error("expecting list, got: " + pr(form));
      } else {}
      buffer = [];
      form = form.slice();
      if ([].indexOf.call(Object.keys(specials), form[0], Object.keys(specials)) >= 0) {
        _ref = specials[form[0]](form, scope, opts, nested);
        buffer = _ref[0];
        scope = _ref[1];
      } else if ([].indexOf.call(Object.keys(macros), form[0], Object.keys(macros)) >= 0) {
        _ref12 = compileAdd(expandMacros(form), buffer, scope, opts, nested);
        buffer = _ref12[0];
        scope = _ref12[1];
      } else {
        nested = undefined;
        _ref0 = compileGetLast(form.shift(), buffer, scope, opts, nested);
        first = _ref0[0];
        buffer = _ref0[1];
        scope = _ref0[2];
        if (([].indexOf.call(Object.keys(toplevel), first, Object.keys(toplevel)) >= 0) && notRedefined(first)) {
          assertExp(first, isVarName, "valid identifier");
          (scope = declareVar(first, scope));
        } else {} if ([].indexOf.call(Object.keys(operators), first, Object.keys(operators)) >= 0) {
          if (!opts.compilingOperator) {
            isOuterOperator = true;
            _ref1 = (opts.compilingOperator = true);
          } else {
            _ref1 = (isOuterOperator = false);
          }
          _ref1;
        } else {
          opts = JSON.parse(JSON.stringify(opts));
          delete opts.compilingOperator;
        }
        _ref2 = form;
        for (i = 0; i < _ref2.length; ++i) {
          arg = _ref2[i];
          if (hasSpread(arg)) {
            argsSpread = true;
            _ref3 = compileGetLast(arg, buffer, scope, opts, nested);
            arg = _ref3[0];
            buffer = _ref3[1];
            scope = _ref3[2];
            _ref5 = (form[i] = ["spread", arg]);
          } else {
            _ref4 = compileGetLast(arg, buffer, scope, opts, nested);
            arg = _ref4[0];
            buffer = _ref4[1];
            scope = _ref4[2];
            _ref5 = (form[i] = arg);
          }
          _ref5;
        }
        if (!(typeof argsSpread !== 'undefined' && argsSpread !== null)) {
          _ref11 = [].indexOf.call(Object.keys(operators), first, Object.keys(operators)) >= 0 ? buffer.push(operators[first](form, isOuterOperator)) : buffer.push(pr(first) + "(" + spr(form) + ")");
        } else {
          form = ["quote", form];
          _ref6 = compileGetLast(form, buffer, scope, opts, nested);
          form = _ref6[0];
          buffer = _ref6[1];
          scope = _ref6[2];
          if ([].indexOf.call(Object.keys(operators), first, Object.keys(operators)) >= 0) {
            if (([].indexOf.call(Object.keys(opFuncs), first, Object.keys(opFuncs)) >= 0) && spr(opFuncs[first])) {
              assertExp(first, isVarName, "valid identifier");
              (scope = declareVar(first, scope));
              _ref7 = (first = opFuncs[first].name);
            } else {
              _ref7 = undefined;
              throw Error(pr(first) + " can't spread arguments (yet)");
            }
            _ref7;
          } else {}
          _ref8 = splitName(first);
          name = _ref8[0];
          method = _ref8[1];
          if (isIdentifier(name)) {
            _ref10 = buffer.push(name + method + ".apply(" + name + ", " + pr(form) + ")");
          } else {
            _ref9 = declareService("_ref", scope);
            collector = _ref9[0];
            scope = _ref9[1];
            _ref10 = buffer.push("(" + collector + " = " + name + ")" + method + ".apply(" + collector + ", " + pr(form) + ")");
          }
          _ref11 = _ref10;
        }
        _ref11;
      } if (isOuterOperator) {
        delete opts.compilingOperator;
      } else {}
      _ref13 = [buffer, scope];
    }
    return _ref13;
  }
  compileForm;
  specials = {};
  specials.do = (function(form, scope, opts, nested) {
    var buffer, formName, isNested, isTopLevel, outerScope, i, exp, ref, vars, funcs, dec, args, name, func, _ref, _ref0, _i, _ref1, _i0, _ref2, _ref3, _i1, _ref4, _ref5, _ref6, _i2, _ref7, _res, _ref8, _i3, _res0, _ref9, _ref10;
    !(typeof opts !== 'undefined' && opts !== null) ? (opts = {}) : undefined;
    buffer = [];
    form = form.slice();
    formName = form.shift();
    if (typeof nested !== 'undefined' && nested !== null) {
      isNested = nested;
      (nested = undefined);
    } else {
      (isNested = true);
    } if (opts.isTopLevel) {
      isTopLevel = true;
      delete opts.isTopLevel;
    } else {} if (isTopLevel) {
      outerScope = scope;
      (scope = {
        hoist: outerScope.hoist.slice(),
        service: outerScope.service.slice()
      });
    } else {}
    _ref = form;
    for (i = 0; i < _ref.length; ++i) {
      exp = _ref[i];
      nested = (!isTopLevel && (i === (form.length - 1))) || isPropertyExp(form[i + 1]);
      if (!(typeof exp !== 'undefined' && exp !== null)) {
        _ref3 = buffer.push(exp);
      } else {
        if (isPropertyExp(exp)) {
          ref = buffer.pop();
          !(typeof ref !== 'undefined' && ref !== null) ? (ref = "") : undefined;
          _ref0 = compileAdd(exp, buffer, scope, opts, nested);
          buffer = _ref0[0];
          scope = _ref0[1];
          _ref2 = buffer.push(ref + buffer.pop());
        } else {
          _ref1 = compileAdd(exp, buffer, scope, opts, nested);
          buffer = _ref1[0];
          _ref2 = scope = _ref1[1];
        }
        _ref3 = _ref2;
      }
      _ref3;
    }
    if (isTopLevel) {
      vars = [];
      funcs = [];
      dec = "var ";
      !(typeof args !== 'undefined' && args !== null) ? (args = []) : undefined;
      _ref4 = scope.hoist;
      for (_i1 = 0; _i1 < _ref4.length; ++_i1) {
        name = _ref4[_i1];
        if (!([].indexOf.call(outerScope.hoist, name, outerScope.hoist) >= 0) && !([].indexOf.call(args, name, args) >= 0)) {
          if ([].indexOf.call(Object.keys(toplevel), name, Object.keys(toplevel)) >= 0) {
            _ref5 = opts.topScope && ([].indexOf.call(toplevelRedeclare, name, toplevelRedeclare) >= 0) ? vars.push(name) : notRedefined(name) ? funcs.push(name) : undefined;
          } else if (([].indexOf.call(Object.keys(opFuncs), name, Object.keys(opFuncs)) >= 0) || ([].indexOf.call(Object.keys(macros), name, Object.keys(macros)) >= 0)) {
            _ref5 = funcs.push(name);
          } else {
            _ref5 = vars.push(name);
          }
          _ref6 = _ref5;
        } else {
          _ref6 = undefined;
        }
        _ref6;
      }
      _ref7 = scope.service;
      for (_i2 = 0; _i2 < _ref7.length; ++_i2) {
        name = _ref7[_i2];
        !([].indexOf.call(outerScope.service, name, outerScope.service) >= 0) ? vars.push(name) : undefined;
      }
      while (vars.length > 0) {
        name = vars.shift();
        if ([].indexOf.call(vars, name, vars) >= 0) {
          throw Error("compiler error: duplicate var in declarations:" + name);
        } else {}
        dec += (name + ", ");
      }
      if (dec.length > 4) {
        dec = dec.slice(0, dec.length - 2);
        buffer.unshift(dec);
      } else {} if ((typeof isTopLevel !== 'undefined' && isTopLevel !== null) && isTopLevel) {
        _res = [];
        while (funcs.length > 0) {
          func = funcs.pop();
          if ([].indexOf.call(funcs, func, funcs) >= 0) {
            throw Error("compiler error: duplicate func in declarations:" + func);
          } else {} if ([].indexOf.call(Object.keys(toplevel), func, Object.keys(toplevel)) >= 0) {
            _ref8 = notRedefined(func) ? buffer.unshift(toplevel[func].toString()) : undefined;
          } else if ([].indexOf.call(Object.keys(macros), func, Object.keys(macros)) >= 0) {
            _ref8 = buffer.unshift("var " + func + " = " + macros[func] + ";");
          } else if ([].indexOf.call(Object.keys(opFuncs), func, Object.keys(opFuncs)) >= 0) {
            _ref8 = buffer.unshift("var " + opFuncs[func].name + " = " + opFuncs[func].func + ";");
          } else {
            _ref8 = undefined;
            throw Error("unrecognised func: " + pr(func));
          }
          _res.push(_ref8);
        }
        _res;
      } else {
        _res0 = [];
        _ref9 = funcs;
        for (_i3 = 0; _i3 < _ref9.length; ++_i3) {
          func = _ref9[_i3];
          _res0.push(!([].indexOf.call(outerScope.hoist, func, outerScope.hoist) >= 0) ? outerScope.hoist.push(func) : undefined);
        }
        _res0;
      }
      _ref10 = (scope = outerScope);
    } else {
      _ref10 = undefined;
    }
    _ref10;
    return Array(buffer, scope);
  });
  specials.quote = (function(form, scope, opts, nested) {
    var buffer, formName, isNested, arr, res, exp, i, item, key, newform, _i, _ref, _ref0, _i0, _ref1, _i1, _ref2, _ref3, _i2, _ref4, _ref5, _i3, _ref6, _i4, _res, _ref7, _ref8, _i5, _ref9, _ref10, _ref11, _i6, _ref12, _ref13, _ref14, _ref15, _i7, _ref16, _ref17, _i8, _ref18;
    !(typeof opts !== 'undefined' && opts !== null) ? (opts = {}) : undefined;
    buffer = [];
    form = form.slice();
    formName = form.shift();
    if (form.length < 1) {
      throw Error(pr(formName) + " expects no less than " + pr(1) + " arguments");
    } else {} if (form.length > 1) {
      throw Error(pr(formName) + " expects no more than " + pr(1) + " arguments");
    } else {} if (typeof nested !== 'undefined' && nested !== null) {
      isNested = nested;
      (nested = undefined);
    } else {
      (isNested = true);
    }
    form = form[0];
    if (isAtom(form) && !util.isPrimitive(form) && !util.isSpecialValue(form)) {
      _ref13 = buffer.push(JSON.stringify(form));
    } else if (isAtom(form)) {
      _ref13 = buffer.push(form);
    } else if (isHash(form)) {
      if (!opts.macro) {
        _ref14 = form;
        for (key in _ref14) {
          exp = _ref14[key];
          _ref15 = compileGetLast(exp, buffer, scope, opts, nested);
          form[key] = _ref15[0];
          buffer = _ref15[1];
          scope = _ref15[2];
        }
        _ref18 = buffer.push(form);
      } else {
        newform = {};
        _ref16 = form;
        for (key in _ref16) {
          exp = _ref16[key];
          key = JSON.stringify(key);
          _ref17 = compileGetLast(["quote", exp], buffer, scope, opts, nested);
          newform[key] = _ref17[0];
          buffer = _ref17[1];
          scope = _ref17[2];
        }
        _ref18 = buffer.push(newform);
      }
      _ref13 = _ref18;
    } else {
      arr = [];
      res = "[]";
      _ref = form;
      for (_i = 0; _i < _ref.length; ++_i) {
        exp = _ref[_i];
        if (isList(exp) && (exp[0] === "quote") && isList(exp[1]) && (exp[1].length === 0)) {
          _ref2 = arr.push([]);
        } else if (isList(exp) && (exp[0] === "unquote") && isList(exp[1]) && (exp[1][0] === "spread")) {
          _ref3 = compileGetLast(exp.slice(1)[0], buffer, scope, opts, nested);
          exp = _ref3[0];
          buffer = _ref3[1];
          scope = _ref3[2];
          if (typeof exp !== 'undefined' && exp !== null) {
            if (arr.length > 0) {
              res += (".concat(" + pr(arr) + ")");
              (arr = []);
            } else {}
            _ref4 = res += (".concat(" + pr(exp) + ")");
          } else {
            _ref4 = undefined;
          }
          _ref2 = _ref4;
        } else if (isList(exp) && (exp[0] === "quote")) {
          _ref5 = compileGetLast(exp, buffer, scope, opts, nested);
          exp = _ref5[0];
          buffer = _ref5[1];
          scope = _ref5[2];
          _ref2 = typeof exp !== 'undefined' && exp !== null ? arr.push(exp) : undefined;
        } else if (isList(exp) && (exp[0] === "unquote")) {
          _ref6 = compileGetLast(exp, buffer, scope, opts, nested);
          exp = _ref6[0];
          buffer = _ref6[1];
          scope = _ref6[2];
          if ((typeof exp !== 'undefined' && exp !== null) && opts.macro) {
            if (isList(exp)) {
              _res = [];
              _ref7 = exp;
              for (i = 0; i < _ref7.length; ++i) {
                item = _ref7[i];
                if (isAtom(item)) {
                  _ref8 = compileGetLast(["quote", item], buffer, scope, opts, nested);
                  exp[i] = _ref8[0];
                  buffer = _ref8[1];
                  _ref9 = scope = _ref8[2];
                } else {
                  _ref9 = undefined;
                }
                _res.push(_ref9);
              }
              _ref10 = _res;
            } else {
              _ref10 = undefined;
            }
            _ref10;
          } else {}
          _ref2 = typeof exp !== 'undefined' && exp !== null ? arr.push(exp) : undefined;
        } else if (isList(exp) && (exp[0] === "spread") && !opts.macro) {
          _ref11 = compileGetLast(exp, buffer, scope, opts, nested);
          exp = _ref11[0];
          buffer = _ref11[1];
          scope = _ref11[2];
          if (typeof exp !== 'undefined' && exp !== null) {
            if (arr.length > 0) {
              res += (".concat(" + pr(arr) + ")");
              (arr = []);
            } else {}
            _ref12 = res += (".concat(" + pr(exp) + ")");
          } else {
            _ref12 = undefined;
          }
          _ref2 = _ref12;
        } else {
          if (isAtom(exp) && !opts.macro) {
            _ref0 = compileGetLast(exp, buffer, scope, opts, nested);
            exp = _ref0[0];
            buffer = _ref0[1];
            scope = _ref0[2];
          } else {
            _ref1 = compileGetLast(["quote", exp], buffer, scope, opts, nested);
            exp = _ref1[0];
            buffer = _ref1[1];
            scope = _ref1[2];
          }
          _ref2 = typeof exp !== 'undefined' && exp !== null ? arr.push(exp) : undefined;
        }
        _ref2;
      }
      arr.length > 0 ? res === "[]" ? (res = pr(arr)) : res += (".concat(" + pr(arr) + ")") : undefined;
      _ref13 = buffer.push(res);
    }
    _ref13;
    return Array(buffer, scope);
  });
  specials.unquote = (function(form, scope, opts, nested) {
    var buffer, formName, isNested, _ref, _i, _ref0, _i0;
    !(typeof opts !== 'undefined' && opts !== null) ? (opts = {}) : undefined;
    buffer = [];
    form = form.slice();
    formName = form.shift();
    if (form.length < 1) {
      throw Error(pr(formName) + " expects no less than " + pr(1) + " arguments");
    } else {} if (form.length > 1) {
      throw Error(pr(formName) + " expects no more than " + pr(1) + " arguments");
    } else {} if (typeof nested !== 'undefined' && nested !== null) {
      isNested = nested;
      (nested = undefined);
    } else {
      (isNested = true);
    }
    form = form[0];
    if (isList(form) && (form[0] === "quote")) {
      _ref = compileGetLast(form, buffer, scope, opts, nested);
      form = _ref[0];
      buffer = _ref[1];
      scope = _ref[2];
    } else {}
    _ref0 = compileAdd(form, buffer, scope, opts, nested);
    buffer = _ref0[0];
    scope = _ref0[1];
    return Array(buffer, scope);
  });
  specials["="] = (function(form, scope, opts, nested) {
    var buffer, formName, isNested, left, right, lastAssign, res, ref, ind, spreads, i, name, spreadname, spreadind, _ref, _i, _res, _ref0, _i0, _ref1, _i1, _ref2, _ref3, _i2, _ref4, _i3, _res0, _ref5, _ref6, _i4, _ref7, _ref8;
    !(typeof opts !== 'undefined' && opts !== null) ? (opts = {}) : undefined;
    buffer = [];
    form = form.slice();
    formName = form.shift();
    if (form.length < 1) {
      throw Error(pr(formName) + " expects no less than " + pr(1) + " arguments");
    } else {} if (typeof nested !== 'undefined' && nested !== null) {
      isNested = nested;
      (nested = undefined);
    } else {
      (isNested = true);
    } if (form.length === 1) {
      assertExp(form[0], isVarName, "valid identifier");
      opts.topScope && ([].indexOf.call(Object.keys(toplevel), form[0], Object.keys(toplevel)) >= 0) && !([].indexOf.call(scope.hoist, form[0], scope.hoist) >= 0) && notRedefined(form[0]) ? toplevelRedeclare.push(form[0]) : undefined;
      (scope = declareVar(form[0], scope));
      _ref = compileAdd(form[0], buffer, scope, opts, nested);
      buffer = _ref[0];
      _ref8 = scope = _ref[1];
    } else {
      assertExp(form, (function() {
        return (arguments[0].length % 2) === 0;
      }), "an even number of arguments");
      _res = [];
      while (form.length > 0) {
        left = form.shift();
        right = form.shift();
        lastAssign = form.length === 0 ? true : undefined;
        _ref0 = compileGetLast(right, buffer, scope, opts, nested);
        right = _ref0[0];
        buffer = _ref0[1];
        scope = _ref0[2];
        if (isList(left) && (left[0] === "get")) {
          _ref1 = compileGetLast(left, buffer, scope, opts, nested);
          left = _ref1[0];
          buffer = _ref1[1];
          scope = _ref1[2];
          res = pr(left) + " = " + pr(right);
          lastAssign && isNested ? (res = "(" + res + ")") : undefined;
          _ref2 = buffer.push(res);
        } else if (isList(left)) {
          _ref3 = declareService("_ref", scope, opts.function ? args : undefined);
          ref = _ref3[0];
          scope = _ref3[1];
          _ref4 = declareService("_i", scope, opts.function ? args : undefined);
          ind = _ref4[0];
          scope = _ref4[1];
          buffer.push(ref + " = " + pr(right));
          spreads = 0;
          _res0 = [];
          _ref5 = left;
          for (i = 0; i < _ref5.length; ++i) {
            name = _ref5[i];
            if (name[0] === "spread") {
              if (++spreads > 1) {
                throw Error("an assignment can only have one spread");
              } else {}
              _ref6 = compileGetLast(name, buffer, scope, opts, nested);
              name = _ref6[0];
              buffer = _ref6[1];
              scope = _ref6[2];
              assertExp(name, isVarName, "valid identifier");
              opts.topScope && ([].indexOf.call(Object.keys(toplevel), name, Object.keys(toplevel)) >= 0) && !([].indexOf.call(scope.hoist, name, scope.hoist) >= 0) && notRedefined(name) ? toplevelRedeclare.push(name) : undefined;
              (scope = declareVar(name, scope));
              spreadname = name;
              spreadind = i;
              _ref7 = buffer.push("var " + spreadname + " = " + left.length + " <= " + ref + ".length ? [].slice.call(" + ref + ", " + spreadind + ", " + ind + " = " + ref + ".length - " + (left.length - spreadind - 1) + ") : (" + ind + " = " + spreadind + ", [])");
            } else if (!(typeof spreadname !== 'undefined' && spreadname !== null)) {
              if (isVarName(name)) {
                assertExp(name, isVarName, "valid identifier");
                opts.topScope && ([].indexOf.call(Object.keys(toplevel), name, Object.keys(toplevel)) >= 0) && !([].indexOf.call(scope.hoist, name, scope.hoist) >= 0) && notRedefined(name) ? toplevelRedeclare.push(name) : undefined;
                (scope = declareVar(name, scope));
              } else {}
              _ref7 = buffer.push(pr(name) + " = " + ref + "[" + i + "]");
            } else {
              if (isVarName(name)) {
                assertExp(name, isVarName, "valid identifier");
                opts.topScope && ([].indexOf.call(Object.keys(toplevel), name, Object.keys(toplevel)) >= 0) && !([].indexOf.call(scope.hoist, name, scope.hoist) >= 0) && notRedefined(name) ? toplevelRedeclare.push(name) : undefined;
                (scope = declareVar(name, scope));
              } else {}
              _ref7 = buffer.push(pr(name) + " = " + ref + "[" + ind + "++]");
            }
            _res0.push(_ref7);
          }
          _ref2 = _res0;
        } else {
          if (isVarName(left)) {
            assertExp(left, isVarName, "valid identifier");
            opts.topScope && ([].indexOf.call(Object.keys(toplevel), left, Object.keys(toplevel)) >= 0) && !([].indexOf.call(scope.hoist, left, scope.hoist) >= 0) && notRedefined(left) ? toplevelRedeclare.push(left) : undefined;
            (scope = declareVar(left, scope));
          } else {}
          assertExp(left, isIdentifier);
          res = pr(left) + " = " + pr(right);
          isHash(right) && !isNested ? res += ";" : undefined;
          lastAssign && isNested ? (res = "(" + res + ")") : undefined;
          _ref2 = buffer.push(res);
        }
        _res.push(_ref2);
      }
      _ref8 = _res;
    }
    _ref8;
    return Array(buffer, scope);
  });
  specials.fn = (function(form, scope, opts, nested) {
    var buffer, formName, isNested, outerScope, args, body, optionals, spreads, i, arg, ind, name, restname, restind, rest, vars, funcs, dec, func, _ref, _i, _ref0, _ref1, _i0, _ref2, _i1, _ref3, _ref4, _ref5, _i2, _i3, _ref6, _ref7, _ref8, _i4, _ref9, _res, _ref10, _i5, _res0, _ref11;
    !(typeof opts !== 'undefined' && opts !== null) ? (opts = {}) : undefined;
    buffer = [];
    form = form.slice();
    formName = form.shift();
    if (typeof nested !== 'undefined' && nested !== null) {
      isNested = nested;
      (nested = undefined);
    } else {
      (isNested = true);
    }
    outerScope = scope;
    scope = {
      hoist: outerScope.hoist.slice(),
      service: outerScope.service.slice()
    };
    _ref = form;
    var args = 2 <= _ref.length ? [].slice.call(_ref, 0, _i = _ref.length - 1) : (_i = 0, []);
    body = _ref[_i++];
    scope.hoist.push.apply(scope.hoist, [].concat(getArgNames(args)));
    !(typeof body !== 'undefined' && body !== null) ? (body = []) : undefined;
    optionals = [];
    spreads = 0;
    _ref0 = args;
    for (i = 0; i < _ref0.length; ++i) {
      arg = _ref0[i];
      if (isList(arg)) {
        assertExp(arg, (function() {
          return arguments[0].length === 2;
        }), "optional or rest parameter");
        if (arg[0] === "spread") {
          if (++spreads > 1) {
            throw Error("cannot define more than one rest parameter");
          } else {}
          _ref1 = declareService("_i", scope, opts.function ? args : undefined);
          ind = _ref1[0];
          scope = _ref1[1];
          _ref2 = compileGetLast(arg, buffer, scope, opts, nested);
          name = _ref2[0];
          buffer = _ref2[1];
          scope = _ref2[2];
          assertExp(name, isVarName, "valid identifier");
          restname = name;
          restind = i;
          args[i] = restname;
          _ref3 = (rest = list(name + " = " + args.length + " <= arguments.length ? [].slice.call(arguments, " + i + ", " + ind + " = arguments.length - " + (args.length - i - 1) + ") : (" + ind + " = " + restind + ", [])"));
        } else {
          assertExp((name = arg[0]), isVarName, "valid parameter name");
          args[i] = name;
          _ref3 = optionals.push(["if", ["not", ["?", name]],
            ["=", name, arg[1]]
          ]);
        }
        _ref4 = _ref3;
      } else if (restname) {
        _ref4 = rest.push(pr(arg) + " = arguments[" + ind + "++]");
      } else {
        _ref4 = undefined;
      }
      _ref4;
    }
    typeof restind !== 'undefined' && restind !== null ? (args = args.slice(0, restind)) : undefined;
    optionals.length > 0 ? (body = [].concat(["do"]).concat(optionals).concat([body])) : undefined;
    body = returnify(body);
    _ref5 = compileResolve(body, buffer, scope, opts, nested);
    body = _ref5[0];
    buffer = _ref5[1];
    scope = _ref5[2];
    rest ? body.unshift.apply(body, [].concat(rest)) : undefined;
    vars = [];
    funcs = [];
    dec = "var ";
    !(typeof args !== 'undefined' && args !== null) ? (args = []) : undefined;
    _ref6 = scope.hoist;
    for (_i3 = 0; _i3 < _ref6.length; ++_i3) {
      name = _ref6[_i3];
      if (!([].indexOf.call(outerScope.hoist, name, outerScope.hoist) >= 0) && !([].indexOf.call(args, name, args) >= 0)) {
        if ([].indexOf.call(Object.keys(toplevel), name, Object.keys(toplevel)) >= 0) {
          _ref7 = opts.topScope && ([].indexOf.call(toplevelRedeclare, name, toplevelRedeclare) >= 0) ? vars.push(name) : notRedefined(name) ? funcs.push(name) : undefined;
        } else if (([].indexOf.call(Object.keys(opFuncs), name, Object.keys(opFuncs)) >= 0) || ([].indexOf.call(Object.keys(macros), name, Object.keys(macros)) >= 0)) {
          _ref7 = funcs.push(name);
        } else {
          _ref7 = vars.push(name);
        }
        _ref8 = _ref7;
      } else {
        _ref8 = undefined;
      }
      _ref8;
    }
    _ref9 = scope.service;
    for (_i4 = 0; _i4 < _ref9.length; ++_i4) {
      name = _ref9[_i4];
      !([].indexOf.call(outerScope.service, name, outerScope.service) >= 0) ? vars.push(name) : undefined;
    }
    while (vars.length > 0) {
      name = vars.shift();
      if ([].indexOf.call(vars, name, vars) >= 0) {
        throw Error("compiler error: duplicate var in declarations:" + name);
      } else {}
      dec += (name + ", ");
    }
    if (dec.length > 4) {
      dec = dec.slice(0, dec.length - 2);
      body.unshift(dec);
    } else {} if ((typeof isTopLevel !== 'undefined' && isTopLevel !== null) && isTopLevel) {
      _res = [];
      while (funcs.length > 0) {
        func = funcs.pop();
        if ([].indexOf.call(funcs, func, funcs) >= 0) {
          throw Error("compiler error: duplicate func in declarations:" + func);
        } else {} if ([].indexOf.call(Object.keys(toplevel), func, Object.keys(toplevel)) >= 0) {
          _ref10 = notRedefined(func) ? body.unshift(toplevel[func].toString()) : undefined;
        } else if ([].indexOf.call(Object.keys(macros), func, Object.keys(macros)) >= 0) {
          _ref10 = body.unshift("var " + func + " = " + macros[func] + ";");
        } else if ([].indexOf.call(Object.keys(opFuncs), func, Object.keys(opFuncs)) >= 0) {
          _ref10 = body.unshift("var " + opFuncs[func].name + " = " + opFuncs[func].func + ";");
        } else {
          _ref10 = undefined;
          throw Error("unrecognised func: " + pr(func));
        }
        _res.push(_ref10);
      }
      _res;
    } else {
      _res0 = [];
      _ref11 = funcs;
      for (_i5 = 0; _i5 < _ref11.length; ++_i5) {
        func = _ref11[_i5];
        _res0.push(!([].indexOf.call(outerScope.hoist, func, outerScope.hoist) >= 0) ? outerScope.hoist.push(func) : undefined);
      }
      _res0;
    }(scope = outerScope);
    buffer.push("(function(" + spr(args) + ") {" + render(body) + " })");
    return Array(buffer, scope);
  });
  specials.def = (function(form, scope, opts, nested) {
    var buffer, formName, isNested, outerScope, fname, args, body, optionals, spreads, i, arg, ind, name, restname, restind, rest, vars, funcs, dec, func, _ref, _i, _ref0, _ref1, _i0, _ref2, _i1, _ref3, _ref4, _ref5, _i2, _i3, _ref6, _ref7, _ref8, _i4, _ref9, _res, _ref10, _i5, _res0, _ref11;
    !(typeof opts !== 'undefined' && opts !== null) ? (opts = {}) : undefined;
    buffer = [];
    form = form.slice();
    formName = form.shift();
    if (typeof nested !== 'undefined' && nested !== null) {
      isNested = nested;
      (nested = undefined);
    } else {
      (isNested = true);
    }
    outerScope = scope;
    scope = {
      hoist: outerScope.hoist.slice(),
      service: outerScope.service.slice()
    };
    _ref = form;
    fname = _ref[0];
    var args = 3 <= _ref.length ? [].slice.call(_ref, 1, _i = _ref.length - 1) : (_i = 1, []);
    body = _ref[_i++];
    assertExp(fname, isVarName, "valid identifier");
    opts.topScope && ([].indexOf.call(Object.keys(toplevel), fname, Object.keys(toplevel)) >= 0) && !([].indexOf.call(scope.hoist, fname, scope.hoist) >= 0) && notRedefined(fname) ? toplevelRedefine.push(fname) : undefined;
    scope.hoist.push.apply(scope.hoist, [].concat(getArgNames(args)));
    !(typeof body !== 'undefined' && body !== null) ? (body = []) : undefined;
    optionals = [];
    spreads = 0;
    _ref0 = args;
    for (i = 0; i < _ref0.length; ++i) {
      arg = _ref0[i];
      if (isList(arg)) {
        assertExp(arg, (function() {
          return arguments[0].length === 2;
        }), "optional or rest parameter");
        if (arg[0] === "spread") {
          if (++spreads > 1) {
            throw Error("cannot define more than one rest parameter");
          } else {}
          _ref1 = declareService("_i", scope, opts.function ? args : undefined);
          ind = _ref1[0];
          scope = _ref1[1];
          _ref2 = compileGetLast(arg, buffer, scope, opts, nested);
          name = _ref2[0];
          buffer = _ref2[1];
          scope = _ref2[2];
          assertExp(name, isVarName, "valid identifier");
          restname = name;
          restind = i;
          args[i] = restname;
          _ref3 = (rest = list(name + " = " + args.length + " <= arguments.length ? [].slice.call(arguments, " + i + ", " + ind + " = arguments.length - " + (args.length - i - 1) + ") : (" + ind + " = " + restind + ", [])"));
        } else {
          assertExp((name = arg[0]), isVarName, "valid parameter name");
          args[i] = name;
          _ref3 = optionals.push(["if", ["not", ["?", name]],
            ["=", name, arg[1]]
          ]);
        }
        _ref4 = _ref3;
      } else if (restname) {
        _ref4 = rest.push(pr(arg) + " = arguments[" + ind + "++]");
      } else {
        _ref4 = undefined;
      }
      _ref4;
    }
    typeof restind !== 'undefined' && restind !== null ? (args = args.slice(0, restind)) : undefined;
    optionals.length > 0 ? (body = [].concat(["do"]).concat(optionals).concat([body])) : undefined;
    body = returnify(body);
    _ref5 = compileResolve(body, buffer, scope, opts, nested);
    body = _ref5[0];
    buffer = _ref5[1];
    scope = _ref5[2];
    rest ? body.unshift.apply(body, [].concat(rest)) : undefined;
    vars = [];
    funcs = [];
    dec = "var ";
    !(typeof args !== 'undefined' && args !== null) ? (args = []) : undefined;
    _ref6 = scope.hoist;
    for (_i3 = 0; _i3 < _ref6.length; ++_i3) {
      name = _ref6[_i3];
      if (!([].indexOf.call(outerScope.hoist, name, outerScope.hoist) >= 0) && !([].indexOf.call(args, name, args) >= 0)) {
        if ([].indexOf.call(Object.keys(toplevel), name, Object.keys(toplevel)) >= 0) {
          _ref7 = opts.topScope && ([].indexOf.call(toplevelRedeclare, name, toplevelRedeclare) >= 0) ? vars.push(name) : notRedefined(name) ? funcs.push(name) : undefined;
        } else if (([].indexOf.call(Object.keys(opFuncs), name, Object.keys(opFuncs)) >= 0) || ([].indexOf.call(Object.keys(macros), name, Object.keys(macros)) >= 0)) {
          _ref7 = funcs.push(name);
        } else {
          _ref7 = vars.push(name);
        }
        _ref8 = _ref7;
      } else {
        _ref8 = undefined;
      }
      _ref8;
    }
    _ref9 = scope.service;
    for (_i4 = 0; _i4 < _ref9.length; ++_i4) {
      name = _ref9[_i4];
      !([].indexOf.call(outerScope.service, name, outerScope.service) >= 0) ? vars.push(name) : undefined;
    }
    while (vars.length > 0) {
      name = vars.shift();
      if ([].indexOf.call(vars, name, vars) >= 0) {
        throw Error("compiler error: duplicate var in declarations:" + name);
      } else {}
      dec += (name + ", ");
    }
    if (dec.length > 4) {
      dec = dec.slice(0, dec.length - 2);
      body.unshift(dec);
    } else {} if ((typeof isTopLevel !== 'undefined' && isTopLevel !== null) && isTopLevel) {
      _res = [];
      while (funcs.length > 0) {
        func = funcs.pop();
        if ([].indexOf.call(funcs, func, funcs) >= 0) {
          throw Error("compiler error: duplicate func in declarations:" + func);
        } else {} if ([].indexOf.call(Object.keys(toplevel), func, Object.keys(toplevel)) >= 0) {
          _ref10 = notRedefined(func) ? body.unshift(toplevel[func].toString()) : undefined;
        } else if ([].indexOf.call(Object.keys(macros), func, Object.keys(macros)) >= 0) {
          _ref10 = body.unshift("var " + func + " = " + macros[func] + ";");
        } else if ([].indexOf.call(Object.keys(opFuncs), func, Object.keys(opFuncs)) >= 0) {
          _ref10 = body.unshift("var " + opFuncs[func].name + " = " + opFuncs[func].func + ";");
        } else {
          _ref10 = undefined;
          throw Error("unrecognised func: " + pr(func));
        }
        _res.push(_ref10);
      }
      _res;
    } else {
      _res0 = [];
      _ref11 = funcs;
      for (_i5 = 0; _i5 < _ref11.length; ++_i5) {
        func = _ref11[_i5];
        _res0.push(!([].indexOf.call(outerScope.hoist, func, outerScope.hoist) >= 0) ? outerScope.hoist.push(func) : undefined);
      }
      _res0;
    }(scope = outerScope);
    buffer.push("function " + fname + "(" + spr(args) + ") {" + render(body) + " }");
    buffer.push(fname);
    return Array(buffer, scope);
  });
  specials.mac = (function(form) {
    return makeMacro(form);
  });

  function collect(compiled, collector, isCase, isNested) {
    var plug, lastItem, _ref;
    !(typeof isCase !== 'undefined' && isCase !== null) ? (isCase = false) : undefined;
    !(typeof isNested !== 'undefined' && isNested !== null) ? (isNested = true) : undefined;
    if (isList(compiled) && (compiled.length > 0)) {
      /\{$/.test(compiled.slice(-1)[0]) ? (plug = compiled.pop()) : undefined;
      lastItem = compiled.pop();
      if (isNested) {
        if (/^return\s/.test(lastItem)) {
          _ref = (lastItem = lastItem.replace(/^return\s/, "return " + collector + " = "));
        } else if (util.kwtest(lastItem)) {
          _ref = (lastItem = collector + " = undefined; " + lastItem);
        } else {
          _ref = (lastItem = collector + " = " + pr(lastItem));
        }
        _ref;
      } else {}
      compiled.push(lastItem);
      isCase ? compiled.push("break") : undefined;
      typeof plug !== 'undefined' && plug !== null ? compiled.push(plug) : undefined;
    } else {}
    return compiled;
  }
  collect;
  specials.if = (function(form, scope, opts, nested) {
    var buffer, formName, isNested, predicate, prebranch, midcases, postbranch, collector, i, mid, midtest, midbranch, comp, _ref, _i, _ref0, _i0, _ref1, _i1, _ref2, _i2, _ref3, _i3, _ref4, _ref5, _i4, _ref6, _i5, _ref7, _i6, _i7, _ref8, _ref9;
    !(typeof opts !== 'undefined' && opts !== null) ? (opts = {}) : undefined;
    buffer = [];
    form = form.slice();
    formName = form.shift();
    if (typeof nested !== 'undefined' && nested !== null) {
      isNested = nested;
      (nested = undefined);
    } else {
      (isNested = true);
    }
    _ref = form;
    predicate = _ref[0];
    prebranch = _ref[1];
    var midcases = 4 <= _ref.length ? [].slice.call(_ref, 2, _i = _ref.length - 1) : (_i = 2, []);
    postbranch = _ref[_i++];
    if ((typeof postbranch !== 'undefined' && postbranch !== null) && (postbranch[0] === "elif")) {
      midcases.push(postbranch);
      (postbranch = undefined);
    } else {}
    _ref0 = compileGetLast(predicate, buffer, scope, opts, nested);
    predicate = _ref0[0];
    buffer = _ref0[1];
    scope = _ref0[2];
    !(typeof predicate !== 'undefined' && predicate !== null) ? (predicate = "false") : undefined;
    _ref1 = compileResolve(prebranch, buffer, scope, opts, nested);
    prebranch = _ref1[0];
    buffer = _ref1[1];
    scope = _ref1[2];
    _ref2 = compileResolve(postbranch, buffer, scope, opts, nested);
    postbranch = _ref2[0];
    buffer = _ref2[1];
    scope = _ref2[2];
    if ((prebranch.length === 1) && !util.kwtest(prebranch[0]) && (midcases.length === 0) && (postbranch.length === 1) && !util.kwtest(postbranch[0])) {
      _ref9 = buffer.push(pr(predicate) + " ? " + pr(prebranch[0]) + " : " + pr(postbranch[0]));
    } else {
      if (isNested) {
        _ref3 = declareService("_ref", scope, opts.function ? args : undefined);
        collector = _ref3[0];
        scope = _ref3[1];
      } else {}
      prebranch = collect(prebranch, collector, false, isNested);
      postbranch = collect(postbranch, collector, false, isNested);
      _ref4 = midcases;
      for (i = 0; i < _ref4.length; ++i) {
        mid = _ref4[i];
        assertExp(mid, (function(x) {
          return x.shift() === "elif";
        }), "elif");
        _ref5 = mid;
        midtest = _ref5[0];
        midbranch = _ref5[1];
        _ref6 = compileResolve(midtest, buffer, scope, opts, nested);
        midtest = _ref6[0];
        buffer = _ref6[1];
        scope = _ref6[2];
        !(typeof midtest !== 'undefined' && midtest !== null) ? (midtest = "false") : undefined;
        if (midtest.length > 1) {
          throw Error(pr("elif") + " must compile to single expression (todo fix later); got:" + pr(midtest));
        } else {}
        _ref7 = compileResolve(midbranch, buffer, scope, opts, nested);
        midbranch = _ref7[0];
        buffer = _ref7[1];
        scope = _ref7[2];
        (midcases[i] = {
          test: midtest,
          branch: collect(midbranch, collector, false, isNested)
        });
      }
      comp = "if (" + pr(predicate) + ") { " + render(prebranch) + " } ";
      _ref8 = midcases;
      for (_i7 = 0; _i7 < _ref8.length; ++_i7) {
        mid = _ref8[_i7];
        comp += (" else if (" + spr(mid.test) + ") { " + render(mid.branch) + " }");
      }
      typeof postbranch !== 'undefined' && postbranch !== null ? comp += (" else { " + render(postbranch) + " }") : undefined;
      buffer.push(comp);
      _ref9 = isNested ? buffer.push(collector) : undefined;
    }
    _ref9;
    return Array(buffer, scope);
  });
  specials.switch = (function(form, scope, opts, nested) {
    var buffer, formName, isNested, predicate, midcases, postbranch, collector, i, mid, midtest, midbranch, comp, _ref, _i, _ref0, _i0, _ref1, _i1, _ref2, _ref3, _i2, _ref4, _i3, _ref5, _i4, _ref6, _i5, _i6, _ref7;
    !(typeof opts !== 'undefined' && opts !== null) ? (opts = {}) : undefined;
    buffer = [];
    form = form.slice();
    formName = form.shift();
    if (typeof nested !== 'undefined' && nested !== null) {
      isNested = nested;
      (nested = undefined);
    } else {
      (isNested = true);
    }
    _ref = form;
    predicate = _ref[0];
    var midcases = 3 <= _ref.length ? [].slice.call(_ref, 1, _i = _ref.length - 1) : (_i = 1, []);
    postbranch = _ref[_i++];
    if ((typeof postbranch !== 'undefined' && postbranch !== null) && (postbranch[0] === "case")) {
      midcases.push(postbranch);
      (postbranch = undefined);
    } else {} if (isNested) {
      _ref0 = declareService("_ref", scope, opts.function ? args : undefined);
      collector = _ref0[0];
      scope = _ref0[1];
    } else {}
    _ref1 = compileGetLast(predicate, buffer, scope, opts, nested);
    predicate = _ref1[0];
    buffer = _ref1[1];
    scope = _ref1[2];
    !(typeof predicate !== 'undefined' && predicate !== null) ? (predicate = "false") : undefined;
    _ref2 = midcases;
    for (i = 0; i < _ref2.length; ++i) {
      mid = _ref2[i];
      assertExp(mid, (function(x) {
        return x.shift() === "case";
      }), "case");
      _ref3 = mid;
      midtest = _ref3[0];
      midbranch = _ref3[1];
      _ref4 = compileResolve(midtest, buffer, scope, opts, nested);
      midtest = _ref4[0];
      buffer = _ref4[1];
      scope = _ref4[2];
      !(typeof midtest !== 'undefined' && midtest !== null) ? (midtest = "false") : undefined;
      if (midtest.length > 1) {
        throw Error(pr("case") + " must compile to single expression (todo fix later); got:" + pr(midtest));
      } else {}
      _ref5 = compileResolve(midbranch, buffer, scope, opts, nested);
      midbranch = _ref5[0];
      buffer = _ref5[1];
      scope = _ref5[2];
      (midcases[i] = {
        test: midtest,
        branch: collect(midbranch, collector, true, isNested)
      });
    }
    _ref6 = compileResolve(postbranch, buffer, scope, opts, nested);
    postbranch = _ref6[0];
    buffer = _ref6[1];
    scope = _ref6[2];
    postbranch = collect(postbranch, collector, false, isNested);
    comp = "switch (" + pr(predicate) + ") { ";
    _ref7 = midcases;
    for (_i6 = 0; _i6 < _ref7.length; ++_i6) {
      mid = _ref7[_i6];
      comp += (" case " + spr(mid.test) + ": " + render(mid.branch));
    }
    comp += (" default: " + render(postbranch) + " }");
    buffer.push(comp);
    isNested ? buffer.push(collector) : undefined;
    return Array(buffer, scope);
  });
  specials.for = (function(form, scope, opts, nested) {
    var buffer, formName, isNested, value, key, iterable, body, collector, ref, _ref, _i, _ref0, _i0, _ref1, _i1, _ref2, _i2, _ref3, _ref4, _i3, _ref5, _i4, _ref6, _i5, _ref7, _i6;
    !(typeof opts !== 'undefined' && opts !== null) ? (opts = {}) : undefined;
    buffer = [];
    form = form.slice();
    formName = form.shift();
    if (form.length < 2) {
      throw Error(pr(formName) + " expects no less than " + pr(2) + " arguments");
    } else {} if (form.length > 4) {
      throw Error(pr(formName) + " expects no more than " + pr(4) + " arguments");
    } else {} if (typeof nested !== 'undefined' && nested !== null) {
      isNested = nested;
      (nested = undefined);
    } else {
      (isNested = true);
    }
    _ref = form;
    value = _ref[0];
    key = _ref[1];
    iterable = _ref[2];
    body = _ref[3];
    if (!(typeof body !== 'undefined' && body !== null)) {
      if (!(typeof iterable !== 'undefined' && iterable !== null)) {
        if (isNaN(Number(value)) || !(parseInt(value) > 0)) {
          throw Error("expecting integer, got " + pr(value));
        } else {}
        body = key;
        iterable = ["quote", [range, 1, [parseInt, value]]];
        _ref0 = declareService("_i", scope, opts.function ? args : undefined);
        key = _ref0[0];
        scope = _ref0[1];
        _ref1 = declareService("_val", scope, opts.function ? args : undefined);
        value = _ref1[0];
        _ref3 = scope = _ref1[1];
      } else {
        body = iterable;
        iterable = key;
        _ref2 = declareService("_i", scope, opts.function ? args : undefined);
        key = _ref2[0];
        scope = _ref2[1];
        assertExp(value, isVarName, "valid identifier");
        opts.topScope && ([].indexOf.call(Object.keys(toplevel), value, Object.keys(toplevel)) >= 0) && !([].indexOf.call(scope.hoist, value, scope.hoist) >= 0) && notRedefined(value) ? toplevelRedeclare.push(value) : undefined;
        _ref3 = (scope = declareVar(value, scope));
      }
      _ref3;
    } else {
      assertExp(key, isVarName, "valid identifier");
      opts.topScope && ([].indexOf.call(Object.keys(toplevel), key, Object.keys(toplevel)) >= 0) && !([].indexOf.call(scope.hoist, key, scope.hoist) >= 0) && notRedefined(key) ? toplevelRedeclare.push(key) : undefined;
      (scope = declareVar(key, scope));
      assertExp(value, isVarName, "valid identifier");
      opts.topScope && ([].indexOf.call(Object.keys(toplevel), value, Object.keys(toplevel)) >= 0) && !([].indexOf.call(scope.hoist, value, scope.hoist) >= 0) && notRedefined(value) ? toplevelRedeclare.push(value) : undefined;
      (scope = declareVar(value, scope));
    }
    assertExp(key, isVarName, "valid identifier");
    assertExp(value, isVarName, "valid identifier");
    if (isNested) {
      _ref4 = declareService("_res", scope, opts.function ? args : undefined);
      collector = _ref4[0];
      scope = _ref4[1];
      buffer.push(collector + " = []");
    } else {}
    _ref5 = declareService("_ref", scope, opts.function ? args : undefined);
    ref = _ref5[0];
    scope = _ref5[1];
    _ref6 = compileGetLast(iterable, buffer, scope, opts, nested);
    iterable = _ref6[0];
    buffer = _ref6[1];
    scope = _ref6[2];
    buffer.push(ref + " = " + pr(iterable));
    _ref7 = compileResolve(body, buffer, scope, opts, nested);
    body = _ref7[0];
    buffer = _ref7[1];
    scope = _ref7[2];
    isNested && !util.kwtest(pr(body.slice(-1)[0])) ? body.push(collector + ".push(" + pr(body.pop()) + ")") : undefined;
    buffer.push("for (" + key + " = 0; " + key + " < " + ref + ".length; ++" + key + ") { " + value + " = " + ref + "[" + key + "]; " + render(body) + " }");
    isNested ? buffer.push(collector) : undefined;
    return Array(buffer, scope);
  });
  specials.over = (function(form, scope, opts, nested) {
    var buffer, formName, isNested, value, key, iterable, body, collector, ref, _ref, _i, _ref0, _i0, _ref1, _i1, _ref2, _i2, _ref3, _i3, _ref4, _i4, _ref5, _i5, _ref6, _i6;
    !(typeof opts !== 'undefined' && opts !== null) ? (opts = {}) : undefined;
    buffer = [];
    form = form.slice();
    formName = form.shift();
    if (form.length < 2) {
      throw Error(pr(formName) + " expects no less than " + pr(2) + " arguments");
    } else {} if (form.length > 4) {
      throw Error(pr(formName) + " expects no more than " + pr(4) + " arguments");
    } else {} if (typeof nested !== 'undefined' && nested !== null) {
      isNested = nested;
      (nested = undefined);
    } else {
      (isNested = true);
    }
    _ref = form;
    value = _ref[0];
    key = _ref[1];
    iterable = _ref[2];
    body = _ref[3];
    if (!(typeof body !== 'undefined' && body !== null)) {
      body = iterable;
      iterable = key;
      _ref0 = declareService("_key", scope, opts.function ? args : undefined);
      key = _ref0[0];
      scope = _ref0[1];
      assertExp(value, isVarName, "valid identifier");
      opts.topScope && ([].indexOf.call(Object.keys(toplevel), value, Object.keys(toplevel)) >= 0) && !([].indexOf.call(scope.hoist, value, scope.hoist) >= 0) && notRedefined(value) ? toplevelRedeclare.push(value) : undefined;
      (scope = declareVar(value, scope));
    } else if (!(typeof iterable !== 'undefined' && iterable !== null)) {
      body = key;
      iterable = value;
      _ref1 = declareService("_key", scope, opts.function ? args : undefined);
      key = _ref1[0];
      scope = _ref1[1];
      _ref2 = declareService("_val", scope, opts.function ? args : undefined);
      value = _ref2[0];
      scope = _ref2[1];
    } else {
      assertExp(key, isVarName, "valid identifier");
      opts.topScope && ([].indexOf.call(Object.keys(toplevel), key, Object.keys(toplevel)) >= 0) && !([].indexOf.call(scope.hoist, key, scope.hoist) >= 0) && notRedefined(key) ? toplevelRedeclare.push(key) : undefined;
      (scope = declareVar(key, scope));
      assertExp(value, isVarName, "valid identifier");
      opts.topScope && ([].indexOf.call(Object.keys(toplevel), value, Object.keys(toplevel)) >= 0) && !([].indexOf.call(scope.hoist, value, scope.hoist) >= 0) && notRedefined(value) ? toplevelRedeclare.push(value) : undefined;
      (scope = declareVar(value, scope));
    }
    assertExp(key, isVarName, "valid identifier");
    assertExp(value, isVarName, "valid identifier");
    if (isNested) {
      _ref3 = declareService("_res", scope, opts.function ? args : undefined);
      collector = _ref3[0];
      scope = _ref3[1];
      buffer.push(collector + " = []");
    } else {}
    _ref4 = declareService("_ref", scope, opts.function ? args : undefined);
    ref = _ref4[0];
    scope = _ref4[1];
    _ref5 = compileGetLast(iterable, buffer, scope, opts, nested);
    iterable = _ref5[0];
    buffer = _ref5[1];
    scope = _ref5[2];
    buffer.push(ref + " = " + pr(iterable));
    _ref6 = compileResolve(body, buffer, scope, opts, nested);
    body = _ref6[0];
    buffer = _ref6[1];
    scope = _ref6[2];
    isNested && !util.kwtest(pr(body.slice(-1)[0])) ? body.push(collector + ".push(" + pr(body.pop()) + ")") : undefined;
    buffer.push("for (" + key + " in " + ref + ") { " + value + " = " + ref + "[" + key + "]; " + render(body) + " }");
    isNested ? buffer.push(collector) : undefined;
    return Array(buffer, scope);
  });
  specials.while = (function(form, scope, opts, nested) {
    var buffer, formName, isNested, test, body, rvalue, collector, comp, _ref, _i, _ref0, _i0, _ref1, _ref2, _i1, _ref3, _i2, _ref4, _i3, _ref5;
    !(typeof opts !== 'undefined' && opts !== null) ? (opts = {}) : undefined;
    buffer = [];
    form = form.slice();
    formName = form.shift();
    if (form.length < 2) {
      throw Error(pr(formName) + " expects no less than " + pr(2) + " arguments");
    } else {} if (form.length > 3) {
      throw Error(pr(formName) + " expects no more than " + pr(3) + " arguments");
    } else {} if (typeof nested !== 'undefined' && nested !== null) {
      isNested = nested;
      (nested = undefined);
    } else {
      (isNested = true);
    }
    _ref = form;
    test = _ref[0];
    body = _ref[1];
    rvalue = _ref[2];
    if (form.length === 2) {
      if (isNested) {
        _ref0 = declareService("_res", scope, opts.function ? args : undefined);
        collector = _ref0[0];
        scope = _ref0[1];
        _ref1 = buffer.push(collector + " = []");
      } else {
        _ref1 = undefined;
      }
      _ref1;
    } else {
      (comp = "");
    }
    _ref2 = compileGetLast(test, buffer, scope, opts, nested);
    test = _ref2[0];
    buffer = _ref2[1];
    scope = _ref2[2];
    _ref3 = compileResolve(body, buffer, scope, opts, nested);
    body = _ref3[0];
    buffer = _ref3[1];
    scope = _ref3[2];
    isNested && (form.length === 2) && !util.kwtest(pr(body.slice(-1)[0])) ? body.push(collector + ".push(" + pr(body.pop()) + ")") : undefined;
    buffer.push("while (" + pr(test) + ") { " + render(body) + " }");
    if (form.length === 2) {
      _ref5 = isNested ? buffer.push(collector) : undefined;
    } else {
      _ref4 = compileResolve(rvalue, buffer, scope, opts, nested);
      rvalue = _ref4[0];
      buffer = _ref4[1];
      scope = _ref4[2];
      _ref5 = buffer.push(render(rvalue));
    }
    _ref5;
    return Array(buffer, scope);
  });
  specials.try = (function(form, scope, opts, nested) {
    var buffer, formName, isNested, tryForm, catchForm, finalForm, collector, err, res, _ref, _i, _ref0, _i0, _ref1, _i1, _ref2, _i2, _ref3, _i3, _ref4, _i4, _ref5, _i5;
    !(typeof opts !== 'undefined' && opts !== null) ? (opts = {}) : undefined;
    buffer = [];
    form = form.slice();
    formName = form.shift();
    if (form.length < 1) {
      throw Error(pr(formName) + " expects no less than " + pr(1) + " arguments");
    } else {} if (form.length > 3) {
      throw Error(pr(formName) + " expects no more than " + pr(3) + " arguments");
    } else {} if (typeof nested !== 'undefined' && nested !== null) {
      isNested = nested;
      (nested = undefined);
    } else {
      (isNested = true);
    }
    _ref = form;
    tryForm = _ref[0];
    catchForm = _ref[1];
    finalForm = _ref[2];
    _ref0 = compileResolve(tryForm, buffer, scope, opts, nested);
    tryForm = _ref0[0];
    buffer = _ref0[1];
    scope = _ref0[2];
    if (isNested) {
      _ref1 = declareService("_ref", scope, opts.function ? args : undefined);
      collector = _ref1[0];
      scope = _ref1[1];
      tryForm.push(collector + " = " + pr(tryForm.pop()));
    } else {} if (isList(catchForm) && (catchForm[0] === "catch")) {
      assertExp(catchForm, (function() {
        return arguments[0].length === 2 || arguments[0].length === 3;
      }), "valid catch form");
      _ref2 = catchForm;
      catchForm = _ref2[0];
      err = _ref2[1];
      catchForm = _ref2[2];
      assertExp(err, isVarName, "valid identifier");
    } else {
      _ref3 = declareService("_err", scope, opts.function ? args : undefined);
      err = _ref3[0];
      scope = _ref3[1];
    }!(typeof catchForm !== 'undefined' && catchForm !== null) ? (catchForm = undefined) : undefined;
    _ref4 = compileResolve(catchForm, buffer, scope, opts, nested);
    catchForm = _ref4[0];
    buffer = _ref4[1];
    scope = _ref4[2];
    isNested && !util.kwtest(pr(catchForm.slice(-1)[0])) ? catchForm.push(collector + " = " + pr(catchForm.pop())) : undefined;
    if (typeof finalForm !== 'undefined' && finalForm !== null) {
      if (isList(finalForm) && (finalForm[0] === "finally")) {
        assertExp(finalForm, (function() {
          return arguments[0].length === 2;
        }));
        (finalForm = finalForm.slice(-1)[0]);
      } else {}
      _ref5 = compileResolve(finalForm, buffer, scope, opts, nested);
      finalForm = _ref5[0];
      buffer = _ref5[1];
      scope = _ref5[2];
      isNested && !util.kwtest(pr(finalForm.slice(-1)[0])) ? finalForm.push(collector + " = " + pr(finalForm.pop())) : undefined;
    } else {}
    res = "try { " + render(tryForm) + " } catch (" + pr(err) + ") { " + render(catchForm) + " }";
    typeof finalForm !== 'undefined' && finalForm !== null ? res += (" finally { " + render(finalForm) + " }") : undefined;
    buffer.push(res);
    isNested ? buffer.push(collector) : undefined;
    return Array(buffer, scope);
  });
  specials.get = (function(form, scope, opts, nested) {
    var buffer, formName, isNested, object, property, _ref, _i, _ref0, _i0, _ref1, _i1;
    !(typeof opts !== 'undefined' && opts !== null) ? (opts = {}) : undefined;
    buffer = [];
    form = form.slice();
    formName = form.shift();
    if (form.length < 1) {
      throw Error(pr(formName) + " expects no less than " + pr(1) + " arguments");
    } else {} if (form.length > 2) {
      throw Error(pr(formName) + " expects no more than " + pr(2) + " arguments");
    } else {} if (typeof nested !== 'undefined' && nested !== null) {
      isNested = nested;
      (nested = undefined);
    } else {
      (isNested = true);
    }
    _ref = form;
    object = _ref[0];
    property = _ref[1];
    if (!(typeof property !== 'undefined' && property !== null)) {
      property = object;
      (object = "");
    } else {}
    _ref0 = compileGetLast(object, buffer, scope, opts, nested);
    object = _ref0[0];
    buffer = _ref0[1];
    scope = _ref0[2];
    _ref1 = compileGetLast(property, buffer, scope, opts, nested);
    property = _ref1[0];
    buffer = _ref1[1];
    scope = _ref1[2];
    assertExp(object, (function() {
      return typeof arguments[0] !== 'undefined' && arguments[0] !== null;
    }), "valid object");
    isVarName(property) ? buffer.push(pr(object) + "." + property) : buffer.push(pr(object) + "[" + pr(property) + "]");
    return Array(buffer, scope);
  });
  specials.spread = (function(form, scope, opts, nested) {
    var buffer, formName, isNested, _ref, _i, _ref0;
    !(typeof opts !== 'undefined' && opts !== null) ? (opts = {}) : undefined;
    buffer = [];
    form = form.slice();
    formName = form.shift();
    if (form.length < 1) {
      throw Error(pr(formName) + " expects no less than " + pr(1) + " arguments");
    } else {} if (form.length > 1) {
      throw Error(pr(formName) + " expects no more than " + pr(1) + " arguments");
    } else {} if (typeof nested !== 'undefined' && nested !== null) {
      isNested = nested;
      (nested = undefined);
    } else {
      (isNested = true);
    }
    form = form[0];
    if (isList(form)) {
      _ref = compileAdd(form, buffer, scope, opts, nested);
      buffer = _ref[0];
      _ref0 = scope = _ref[1];
    } else if (isAtom(form)) {
      _ref0 = buffer.push(form);
    } else {
      _ref0 = undefined;
      throw Error("spread requires atom, got: " + pr(form));
    }
    _ref0;
    return Array(buffer, scope);
  });
  specials.return = (function(form, scope, opts, nested) {
    var buffer, formName, isNested, _ref, _i, _ref0;
    !(typeof opts !== 'undefined' && opts !== null) ? (opts = {}) : undefined;
    buffer = [];
    form = form.slice();
    formName = form.shift();
    if (form.length > 1) {
      throw Error(pr(formName) + " expects no more than " + pr(1) + " arguments");
    } else {} if (typeof nested !== 'undefined' && nested !== null) {
      isNested = nested;
      (nested = undefined);
    } else {
      (isNested = true);
    } if (form.length !== 0) {
      _ref = compileGetLast(form[0], buffer, scope, opts, nested);
      form = _ref[0];
      buffer = _ref[1];
      scope = _ref[2];
      !util.kwtest(form) ? (form = "return " + pr(form)) : undefined;
      _ref0 = buffer.push(form);
    } else {
      _ref0 = undefined;
    }
    _ref0;
    return Array(buffer, scope);
  });
  macros = {};

  function importMacros() {
    var store, key, val, _i, _i0, _ref, _res, _ref0;
    stores = 1 <= arguments.length ? [].slice.call(arguments, 0, _i = arguments.length - 0) : (_i = 0, []);
    _ref = stores;
    for (_i0 = 0; _i0 < _ref.length; ++_i0) {
      store = _ref[_i0];
      _res = [];
      _ref0 = store;
      for (key in _ref0) {
        val = _ref0[key];
        _res.push((macros[key] = val));
      }
      _res;
    }
    return macros;
  }
  exports.importMacros = importMacros;
  importMacros(require("./macros"));

  function parseMacros(form) {
    var key, val, i, _res, _ref, _res0, _ref0, _ref1;
    if (util.isHash(form)) {
      _res = [];
      _ref = form;
      for (key in _ref) {
        val = _ref[key];
        _res.push((form[key] = parseMacros(val)));
      }
      _res;
    } else if (util.isList(form)) {
      if (form[0] === "mac") {
        _ref1 = (form = makeMacro(form.slice(1)));
      } else {
        _res0 = [];
        _ref0 = form;
        for (i = 0; i < _ref0.length; ++i) {
          val = _ref0[i];
          _res0.push((form[i] = parseMacros(val)));
        }
        _ref1 = _res0;
      }
      _ref1;
    } else {}
    return form;
  }
  parseMacros;

  function makeMacro(form) {
    var name, body, compiled, scope, rendered, _ref, _i, _ref0, _i0;
    _ref = form;
    name = _ref[0];
    var body = 2 <= _ref.length ? [].slice.call(_ref, 1, _i = _ref.length - 0) : (_i = 1, []);
    if (!(typeof name !== 'undefined' && name !== null)) {
      throw Error("a macro requires a name");
    } else {} if (!(typeof body !== 'undefined' && body !== null)) {
      throw Error("a macro requires a body");
    } else {}
    body.unshift("fn");
    _ref0 = compileForm(body, {
      hoist: [],
      service: []
    }, {
      macro: true
    });
    compiled = _ref0[0];
    scope = _ref0[1];
    rendered = render(compiled);
    macros[name] = jispEval(rendered);
    return [];
  }
  makeMacro;

  function expandMacros(form) {
    var key, val, i, _res, _ref, _res0, _ref0, _ref1;
    if (util.isHash(form)) {
      _res = [];
      _ref = form;
      for (key in _ref) {
        val = _ref[key];
        _res.push((form[key] = expandMacros(val)));
      }
      _res;
    } else if (util.isList(form)) {
      if (form[0] === "mac") {
        _ref1 = (form = parseMacros(form));
      } else if ([].indexOf.call(Object.keys(macros), form[0], Object.keys(macros)) >= 0) {
        form = macros[form[0]].apply(macros, [].concat(form.slice(1)));
        typeof form === "undefined" ? (form = []) : undefined;
        _ref1 = (form = expandMacros(form));
      } else {
        _res0 = [];
        _ref0 = form;
        for (i = 0; i < _ref0.length; ++i) {
          val = _ref0[i];
          _res0.push((form[i] = expandMacros(val)));
        }
        _ref1 = _res0;
      }
      _ref1;
    } else {}
    return form;
  }
  expandMacros;

  function macroexpand(src) {
    return expandMacros(parseMacros(src));
  }
  macroexpand;
  exports.fileExtensions = [".jisp"];
  exports.register = (function() {
    return require("./register");
  });
  exports.tokenise = (function(src) {
    return tokenise(src);
  });
  exports.lex = (function(src) {
    return lex(tokenise(src));
  });
  exports.parse = (function(src) {
    return parse(lex(tokenise(src)));
  });
  exports.macroexpand = (function(src) {
    return macroexpand(parse(lex(tokenise(src))));
  });
  exports.macros = macros;

  function compile(src, opts) {
    var defaults, parsed, expanded, compiled, scope, _ref, _i;
    defaults = {
      wrap: true,
      topScope: true,
      isTopLevel: true
    };
    opts = util.merge(defaults, opts);
    parsed = parse(lex(tokenise(src)));
    parsed.unshift("do");
    opts.wrap ? (parsed = [
      ["get", ["fn", parsed], "call"], "this"
    ]) : undefined;
    if (!opts.repl) {
      toplevelRedeclare = [];
      (toplevelRedefine = []);
    } else {}
    expanded = macroexpand(parsed);
    _ref = compileForm(expanded, {
      hoist: [],
      service: []
    }, opts);
    compiled = _ref[0];
    scope = _ref[1];
    return typeof beautify !== 'undefined' && beautify !== null ? beautify(render(compiled), {
      indent_size: 2
    }) : render(compiled);
  }
  exports.compile = compile;

  function jispEval(src) {
    return (typeof vm !== 'undefined' && vm !== null) && (typeof vm.runInThisContext !== 'undefined' && vm.runInThisContext !== null) ? vm.runInThisContext(src) : eval(src);
  }
  exports.eval = jispEval;

  function compileFile(filename) {
    var raw, stripped, _ref;
    raw = fs.readFileSync(filename, "utf8");
    stripped = raw.charCodeAt(0) === 65279 ? raw.substring(1) : raw;
    try {
      _ref = exports.compile(stripped);
    } catch (err) {
      throw err;
    }
    return _ref;
  }
  exports.compileFile = compileFile;

  function run(code, options) {
    var mainModule, dir;
    !(typeof options !== 'undefined' && options !== null) ? (options = {}) : undefined;
    mainModule = require.main;
    mainModule.filename = (process.argv[1] = options.filename ? fs.realpathSync(options.filename) : ".");
    mainModule.moduleCache ? (mainModule.moduleCache = {}) : undefined;
    dir = options.filename ? path.dirname(fs.realpathSync(options.filename)) : fs.realpathSync(".");
    mainModule.paths = require("module")._nodeModulePaths(dir);
    !util.isJisp(mainModule.filename) || require.extensions ? (code = exports.compile(code)) : undefined;
    return mainModule._compile(code, mainModule.filename);
  }
  return exports.run = run;
}).call(this);