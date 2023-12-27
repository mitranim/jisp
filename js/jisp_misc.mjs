import * as a from '/Users/m/code/m/js/all.mjs'
import * as p from '/Users/m/code/m/js/path.mjs'
import * as jc from './jisp_conf.mjs'

export function joinLines(...val) {return a.joinLinesOptLax(val)}
export function joinUnderscore(...val) {return a.joinLax(val, `_`)}
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
export function toJsonCall(val) {return val.toJSON()}
export function readyCall(val) {return val.ready()}

// Placed in generic utils to minimize cyclic dependencies between higher-level modules.
export function ownNsLexCall(src) {
  return a.isObj(src) && `ownNsLex` in src ? src.ownNsLex() : undefined
}

// Placed in generic utils to minimize cyclic dependencies between higher-level modules.
export function optResolveLiveValCall(src) {
  return a.isObj(src) && `optResolveLiveVal` in src ? src.optResolveLiveVal() : undefined
}

export function isFullMatch(src, reg) {
  a.reqStr(src)
  a.reqReg(reg)
  reg.lastIndex = 0
  return reg.exec(src)?.[0] === src
}

export class StrSet extends a.TypedSet {
  reqVal(val) {return a.reqStr(val)}
}

export class ValidStrSet extends a.TypedSet {
  reqVal(val) {return a.reqValidStr(val)}
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
  return a.isNpo(val) && val[Symbol.toStringTag] === `Module`
}
export function reqNativeModule(val) {return a.req(val, isNativeModule)}
export function optNativeModule(val) {return a.opt(val, isNativeModule)}

// SYNC[canonical_module_url]
export function isCanonicalModuleFileUrl(val) {
  return isAbsFileUrl(val) && isCanonicalModuleUrl(val)
}

// SYNC[canonical_module_url]
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

export function isCanonicalModuleSrcUrlStr(val) {
  return isCanonicalModuleUrlStr(val) && p.posix.ext(val) === jc.conf.getFileExtSrc()
}

// SYNC[canonical_module_url]
export function isCanonicalModuleFileUrlStr(val) {
  return isAbsFileUrlStr(val) && isCanonicalModuleUrlStr(val)
}

// SYNC[canonical_module_url]
export function isCanonicalModuleUrlStr(val) {
  return a.isStr(val) && !isStrWithUrlDecorations(val) && isAbsUrlStr(val)
}

export function reqCanonicalModuleUrlStr(val) {
  return a.req(val, isCanonicalModuleUrlStr)
}

export function isStrWithUrlDecorations(val) {
  return a.isStr(val) && (val.includes(`?`) || val.includes(`#`))
}

// export function stripUrlDecorations(val) {
//   val = sliceUntil(val, `#`)
//   val = sliceUntil(val, `?`)
//   return val
// }

/*
export function replaceExt(src, exp) {
  a.reqStr(src)
  a.reqStr(exp)

  const act = p.posix.ext(src)
  if (act === exp) return src
  return a.stripSuf(src, act) + exp
}
*/

function sliceUntil(src, str) {
  src = a.reqStr(src)
  str = a.reqStr(str)
  const ind = src.indexOf(str)
  if (ind >= 0) return src.slice(0, ind)
  return src
}

export function isAbsUrlStr(val) {
  return isAbsFileUrlStr(val) || isAbsNetworkUrlStr(val)
}

export function isAbsUrlStrDirLike(val) {
  return isAbsUrlStr(val) && !isStrWithUrlDecorations(val) && p.posix.isDirLike(val)
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
Opposite of `p.paths.clean`. Instead of cleaning the path, it "uncleans" the
path, prepending `./` when the path is strictly relative.
*/
export function toPosixRel(val) {
  if (!a.optStr(val)) return undefined
  a.reqStr(val)
  if (p.posix.isRelImplicit(val)) return p.posix.relPre() + val
  return val
}

export function optCompilerImportUrl(src) {
  if (!a.optStr(src)) return undefined

  const sch = jc.conf.getUrlScheme()
  if (!src.startsWith(sch)) return undefined

  return new Url(src.slice(sch.length), import.meta.url)
}

export function optUrlExt(val) {
  if (!a.optInst(val, URL)) return undefined
  return p.posix.ext(val.pathname)
}

// export class TypedWeakMap extends WeakMap {
//   reqKey() {throw l.errImpl()}
//   reqVal() {throw l.errImpl()}
//   set(key, val) {return super.set(this.reqKey(key), this.reqVal(val))}
//   setted(key, val) {return this.set(key, val).get(key)}
// }

export class PromiseMap extends a.TypedMap {
  reqKey(key) {return a.reqValidStr(key)}
  reqVal(val) {return a.reqPromise(val)}
}

// export class PromiseWeakMap extends TypedWeakMap {
//   reqKey() {return a.reqValidStr(key)}
//   reqVal() {return a.reqPromise(val)}
// }

// // FIXME use or remove.
// export class NativeModuleMap extends a.TypedMap {
//   reqKey(key) {return reqCanonicalModuleUrlStr(key)}
//   reqVal(val) {return reqNativeModule(val)}
// }

export function toUrl(val) {return a.toInst(val, Url)}
export function toUrlOpt(val) {return a.toInstOpt(val, Url)}

export class Url extends URL {
  pk() {
    if (this.isCanonical()) return this.href
    throw Error(`unable to get primary key of non-canonical URL ${a.show(this.href)}; only canonical URLs may considered to be primary keys`)
  }

  // simple() {
  //   return pathJoinOpt(
  //     a.optStr(this.protocol).replace(/:/g, ``),
  //     a.optStr(this.hostname),
  //     a.optStr(this.pathname),
  //   )
  // }

  clone() {return new this.constructor(this)}
  isAbs() {return this.isFile() ? !this.hostname : !!this.hostname}
  isFile() {return this.protocol === `file:`}
  isNet() {return !this.isFile()}
  isDecorated() {return !!this.search || !!this.hash}
  isCanonical() {return this.isAbs() && !this.isDecorated()}

  toCanonical() {
    this.toUndecorated()

    // While we can automatically undecorate the URL, we can't automatically
    // convert relative URLs to absolute.
    if (!this.isCanonical()) throw Error(`unable to convert URL ${a.show(this)} ${a.show(this.href)} to canonical`)

    return this
  }

  toUndecorated() {
    this.search = ``
    this.hash = ``
    return this
  }

  getDir() {return p.posix.dir(this.pathname)}

  toDir() {
    this.pathname = p.posix.dirLike(this.getDir())
    return this
  }

  toDirLike() {
    this.pathname = p.posix.dirLike(this.pathname)
    return this
  }

  getBaseName() {return p.posix.base(this.pathname)}
  getBaseNameWithoutExt() {return p.posix.name(this.pathname)}
  getExt() {return p.posix.ext(this.pathname)}
  hasExt() {return !!this.getExt()}

  // TODO more descriptive name. This may be confusing or ambiguous.
  hasExtSrc() {return this.getExt() === jc.conf.getFileExtSrc()}

  // TODO more descriptive name. This may be confusing or ambiguous.
  hasExtTar() {return this.getExt() === jc.conf.getFileExtTar()}

  setExtTar() {return this.setExt(jc.conf.getFileExtTar())}

  setExt(val) {
    a.reqStr(val)

    const path = this.pathname
    const prev = p.posix.ext(path)
    if (prev === val) return this

    this.pathname = a.stripSuf(path, prev) + val
    return this
  }

  optRelTo(tar) {
    if (!a.optInst(tar, URL)) return undefined
    if (this.protocol !== tar.protocol) return undefined
    if (this.hostname !== tar.hostname) return undefined
    if (this.port !== tar.port) return undefined
    return p.posix.relTo(this.pathname, tar.pathname)
  }

  reqRelTo(val) {
    a.reqInst(val, URL)

    return (
      this.optRelTo(val) ??
      a.panic(Error(`unable to make URL ${a.show(this.href)} relative to URL ${a.show(val.href)}`))
    )
  }

  /*
  Not equivalent to `toUrlOpt`. When the source value is non-nil, this always
  generates a new instance.
  */
  static opt(val) {return a.isNil(val) ? undefined : new this(val)}
}

// /*
// Avoids `p.posix.join` because we're appending an absolute path to a relative
// path, which is forbidden in `@mitranim/js/path.mjs`.
// */
// function pathJoinOpt(...val) {
//   let out = ``
//   for (val of val) if (a.isSome(val)) out = a.inter(out, `/`, a.renderLax(val))
//   return out
// }

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

export async function strToHash(src) {
  const srcArr = new TextEncoder().encode(a.reqStr(src))
  const outBuf = await crypto.subtle.digest(`sha-256`, srcArr)
  return a.arrHex(new Uint8Array(outBuf))
}
