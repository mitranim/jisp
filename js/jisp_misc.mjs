import * as a from '/Users/m/code/m/js/all.mjs'
import * as p from '/Users/m/code/m/js/path.mjs'
import * as jc from './jisp_conf.mjs'

export function joinLines(...val) {return a.joinLinesOptLax(val)}
export function isStrOrArr(val) {return a.isStr(val) || a.isTrueArr(val)}
export function reqStrOrArr(val) {return a.req(val, isStrOrArr)}
export function preview(src) {return a.ell(src, 128)}
export function errMeth(name, val) {throw TypeError(msgMeth(name, val))}
export function msgMeth(name, val) {return `method ${a.show(name)} not fully implemented on ${a.show(val)}`}
export function errGetter(name, val) {throw TypeError(msgGetter(name, val))}
export function msgGetter(name, val) {return `getter ${a.show(name)} not fully implemented on ${a.show(val)}`}
export function renderErr(val) {return (a.isErr(val) && val.message) || a.render(val)}
export function renderErrLax(val) {return (a.isErr(val) && val.message) || a.renderLax(val)}
export function isNotCosmetic(val) {return a.isSome(val) && !val.isCosmetic()}
export function isCosmetic(val) {return val?.isCosmetic()}

// Implemented by `Module`.
export function isImporter(val) {return a.hasMeth(val, `import`)}

// Implemented by `Root`.
export function isImporterRel(val) {return a.hasMeth(val, `importRel`)}

export function isFullMatch(src, reg) {
  a.reqStr(src)
  a.reqReg(reg)
  reg.lastIndex = 0
  return reg.exec(src)?.[0] === src
}

class StrSet extends a.TypedSet {
  reqVal(val) {return a.reqStr(val)}
}

/*
Reference:

  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#reserved_words

Set of names which are reserved in JS in ES6+ strict mode in all contexts. We
compile to native JS modules, which require ES6+ and use strict mode. We're
free to ignore older JS versions and loose mode.

Note that JS also has contextual keywords such as `async`, which can also be
used as identifiers. This set should NOT include them.

Most of these names are keywords, and attempting to use them as identifiers in
JS produces a syntax error. Some of these names are not keywords but rather
predeclared identifiers, typically contextual, such as `arguments`.

One special exception is `undefined`. It's actually NOT reserved in JS, and may
be redefined, even in ES6+ strict mode. However, we ourselves reserve it to
avoid such insanity, and to avoid collisions with the output of our macro
`nil`.
*/
export const jsReservedNames = new StrSet([`arguments`, `await`, `case`, `catch`, `class`, `const`, `continue`, `debugger`, `default`, `delete`, `do`, `else`, `enum`, `eval`, `export`, `extends`, `false`, `finally`, `for`, `function`, `if`, `implements`, `import`, `in`, `instanceof`, `interface`, `let`, `new`, `null`, `package`, `private`, `protected`, `public`, `return`, `static`, `super`, `switch`, `this`, `throw`, `true`, `try`, `typeof`, `undefined`, `var`, `void`, `while`, `with`, `yield`])

export function isNativeModule(val) {
  return (
    a.isObj(val) &&
    a.isNil(Object.getPrototypeOf(val)) &&
    val[Symbol.toStringTag] === `Module`
  )
}

export function reqNativeModule(val) {return a.req(val, isNativeModule)}
export function optNativeModule(val) {return a.opt(val, isNativeModule)}

export function isCanonicalModuleUrl(val) {
  return isAbsUrl(val) && !val.search && !val.hash
}

export function isAbsUrl(val) {
  return isAbsFileUrl(val) || isAbsNetworkUrl(val)
}

export function isAbsFileUrl(val) {
  return a.isInst(val, URL) && val.protocol === `file:` && !val.hostname
}

export function isAbsNetworkUrl(val) {
  return a.isInst(val, URL) && val.protocol !== `file:` && !!val.hostname
}

export function isCanonicalModuleUrlStr(val) {
  return a.isStr(val) && !isParametrizedStr(val) && isAbsUrlStr(val)
}

export function reqCanonicalModuleUrlStr(val) {
  return a.req(val, isCanonicalModuleUrlStr)
}

export function isParametrizedStr(val) {
  return a.isStr(val) && (val.includes(`?`) || val.includes(`#`))
}

export function isAbsUrlStr(val) {
  return isAbsFileUrlStr(val) || isAbsNetworkUrlStr(val)
}

/*
Reflects how `URL` parses `file:` URLs.

The following are absolute. After a decoding-encoding roundtrip, their href
begins with `file:///`. Substituting slashes for backslashes makes no
difference.

  * `file:`
  * `file:c:`
  * `file:one`
  * `file:c:/one`
  * `file:./one` (strips off `./`)
  * `file:./c:/one` (strips off `./`)
  * `file:../one` (strips off `../`)
  * `file:../c:/one` (strips off `../`)
  * `file:/`
  * `file:/c:`
  * `file:/one`
  * `file:/c:/one`
  * `file:/./one` (strips off `./`)
  * `file:/./c:/one` (strips off `./`)
  * `file:/../one` (strips off `../`)
  * `file:/../c:/one` (strips off `../`)
  * `file://`
  * `file://c:`
  * `file://c:/one`
  * `file:///`
  * `file:///one`
  * `file:///c:/one`
  * `file:///./one` (strips off `./`)
  * `file:///./c:/one` (strips off `./`)

The following are relative.

  * `file://one`
  * `file://.`
  * `file://./`
  * `file://./one`
*/
export function isAbsFileUrlStr(val) {
  return hasFileScheme(val) && !isRelFileUrlStr(val)
}

export function isRelFileUrlStr(val) {
  return a.isStr(val) && /^file:[/][/](?!$)(?![/]|[A-Za-z]:)/.test(val)
}

export function isAbsNetworkUrlStr(val) {
  return a.isStr(val) && !hasFileScheme(val) && hasScheme(val)
}

export function hasScheme(val) {
  return a.isStr(val) && /^\w+:/.test(val)
}

export function hasFileScheme(val) {
  return a.isStr(val) && val.startsWith(`file:`)
}

/*
More restrictive than normal relative path format.
Requires the path to have NO special prefix.
Used for paths in `jisp:<path>`.
*/
export function isStrictRelStr(val) {
  return (
    a.isStr(val) &&
    !val.startsWith(`/`) &&
    !val.startsWith(`\\`) &&
    !val.startsWith(`.`) &&
    !hasScheme(val) &&
    !isAbsUrlStr(val)
  )
}

// export function isLangImportPath(val) {
//   return a.isStr(val) && val.startsWith(jc.Conf.main.SCHEME)
// }

// FIXME move to `Root` for better assertions.
export function toCompFileUrl(val) {
  return p.posix.join(
    p.posix.dir(import.meta.url),
    unparametrize(a.req(val, isStrictRelStr)) + jc.Conf.main.EXT_NATIVE,
  )
}

export function unparametrize(src) {
  return stripAt(stripAt(src, `?`), `#`)
}

export function stripAt(src, str) {
  src = a.reqStr(src)
  str = a.reqStr(str)
  const ind = src.indexOf(str)
  if (ind >= 0) return src.slice(0, ind)
  return src
}

export class PromiseMap extends a.TypedMap {
  reqKey(key) {return a.reqValidStr(key)}
  reqVal(val) {return a.reqPromise(val)}
}

// Questionable. Do we need this?
export class PromiseCache extends PromiseMap {
  goc(key, fun, ctx) {
    a.reqFun(fun)
    if (this.has(key)) return this.get(key)
    return this.setted(key, fun.call(ctx, key))
  }
}

// FIXME use or remove.
export class NativeModuleMap extends a.TypedMap {
  reqKey(key) {return reqCanonicalModuleUrlStr(key)}
  reqVal(val) {return reqNativeModule(val)}
}

// FIXME use or remove.
export class Url extends URL {
  simple() {
    return pathJoinOpt(
      a.optStr(this.protocol).replace(/:/g, ``),
      a.optStr(this.hostname),
      a.optStr(this.pathname),
    )
  }
}

/*
Avoids `p.posix.join` because we're appending an absolute path to a relative
path, which is forbidden in `@mitranim/js/path.mjs`.
*/
function pathJoinOpt(...val) {
  let out = ``
  for (val of val) if (a.isSome(val)) out = a.inter(out, `/`, a.renderLax(val))
  return out
}

/*
export function partitionWhile(src, fun) {
  a.reqFun(fun)
  if (a.isNil(src)) return []

  const truthy = []
  const falsy = []

  for (const val of a.values(src)) {
    if (allow) {
      if (fun(val)) truthy.push(val)
      else {
        allow = false
        falsy.push(val)
      }
    }
    else {
      falsy.push(val)
    }
  }

  return [truthy, falsy]
}
*/
