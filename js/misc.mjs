import {a, p} from './dep.mjs'
import * as jc from './conf.mjs'

/*
These symbols are used by some internal code as an alternative to `instanceof`
checks. Whenever possible, we should use simple `instanceof` instead. However,
sometimes that would require impossible cyclic imports. This is the current
workaround.
*/
export const symType = Symbol.for(`jisp.type`)
export const symTypeRoot = Symbol.for(`jisp.type.Root`)
export const symTypeModule = Symbol.for(`jisp.type.Module`)
export const symTypeModuleNodeList = Symbol.for(`jisp.type.ModuleNodeList`)

export function hasInternalType(val, exp) {
  return a.isComp(val) && symType in val && val[symType] === exp
}

export function hasInternalTypeModule(val) {
  return hasInternalType(val, symTypeModule)
}

export function hasInternalTypeModuleNodeList(val) {
  return hasInternalType(val, symTypeModuleNodeList)
}

export function isStrOrArr(val) {return a.isStr(val) || a.isArr(val)}
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
export function readyCall(val) {return val.ready()}

// Placed in generic utils to minimize cyclic dependencies between higher-level modules.
export function ownNsLexCall(src) {
  return a.isComp(src) && `ownNsLex` in src ? src.ownNsLex() : undefined
}

// Placed in generic utils to minimize cyclic dependencies between higher-level modules.
export function optLiveValCall(src) {
  return a.isComp(src) && `optLiveVal` in src ? src.optLiveVal() : undefined
}

// Placed in generic utils to minimize cyclic dependencies between higher-level modules.
export function optLiveValSrcCall(src) {
  return a.isComp(src) && `optLiveValSrc` in src ? src.optLiveValSrc() : undefined
}

// Placed in generic utils to minimize cyclic dependencies between higher-level modules.
export function optLiveValInnerCall(src) {
  return a.isComp(src) && `optLiveValInner` in src ? src.optLiveValInner() : undefined
}

export function isFullMatch(src, reg) {
  a.reqStr(src)
  a.reqReg(reg)
  reg.lastIndex = 0
  return reg.exec(src)?.[0] === src
}

// Similar to `a.joinLinesOpt` but stricter. Every element must be a string.
export function joinLines(...src) {
  return a.joinOptBy(src, `\n`, a.reqStr)
}

export function joinParagraphs(...src) {
  return a.joinOptBy(src, `\n\n`, a.reqStr)
}

// Same as `a.str` but stricter. Every element must be a string.
export function str(...src) {
  let out = ``
  for (src of src) out += a.reqStr(src)
  return out
}

export class StrSet extends a.TypedSet {
  reqVal(val) {return a.reqStr(val)}
}

export class ValidStrSet extends a.TypedSet {
  reqVal(val) {return a.reqValidStr(val)}
}

export class ValidStrMap extends a.TypedMap {
  reqKey(key) {return a.reqValidStr(key)}
  reqVal(val) {return a.reqValidStr(val)}
}

/*
Should exactly match the set of names which, in ES5+, require special syntax.
Such names can't be used on their own as expressions. Non-exhaustive examples:

  * Reserved but not implemented (at the time of writing) names such as `enum`.
  * Declaration keywords such as `function`.
  * Unary keywords such as `typeof`.
  * Binary keywords such as `in`.

Should NOT include nullary keywords which can be used on their own as
expressions. Examples include `null`, `false`, `true`, and possibly more.
Such keywords should be placed in `jsReservedNames`.

Reference:

  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#reserved_words
*/
export const jsKeywordNames = new StrSet([`await`, `case`, `catch`, `class`, `const`, `continue`, `debugger`, `default`, `delete`, `do`, `else`, `enum`, `export`, `extends`, `finally`, `for`, `function`, `if`, `implements`, `import`, `in`, `instanceof`, `interface`, `let`, `new`, `package`, `private`, `protected`, `public`, `return`, `static`, `switch`, `throw`, `try`, `typeof`, `var`, `void`, `while`, `with`, `yield`])

/*
Should exactly match the set of names which, in ES5+, can be used on their own
as expressions, but can not be redeclared. Attempting to redeclare such names
typically causes a syntax error in ES.

To avoid generating syntactically invalid JS, we should prevent user code from
using ES keywords and reserved names in declarations. Note that such names can
still be used for exports. Even in ES, there are absolutely no restrictions on
exported names.

Some of these names may be used on their own as expressions. In other words,
some of these names act as regular identifiers or nullary keywords. The
simplest way to make them available in Jisp code is by declaring them as
globals:

  [declare `jisp:global.mjs`]

Some of these names can be used only in specific contexts. Examples include
`arguments` and `super`. It's worth understanding that in ES, all names which
have contextual meaning are always reserved globally. At the time of writing,
this rule holds for all contextual names and keywords in ES. This prevents
contextually-provided names and keywords from accidentally masking user-defined
names, because user-defined names are not allowed to match any keywords or
reserved names.

In Jisp, contextual names must also avoid collision with user-defined names.
However, Jisp does not reserve any names, and never will. This means that
implicit, contextual declarations must be optional in both directions:
ancestor-wise and descendant-wise. Ancestor-wise means that if any such
declaration would mask a name already available in the current lexical scope,
then the declaration must be skipped. Descendant-wise means that any descendant
user code is allowed to redeclare such names.

For example, `Func` would contextually declare the macro `ret`, if and only if
the name `ret` is completely missing from the current scope. If the name `ret`
is already declared, then `Func` does not declare it in its namespace. If it
does declare `ret`, it places that declaration in a "mixin" of its lexical
namespace, thus allowing redeclaration. At the time of writing, we don't have
such contextual declarations, but we may add them in the future.

Notably, this set does not include `undefined` because at the time of writing,
it is NOT a reserved name in ES. It's a regular predeclared identifier. In
ES5+, the predeclared `undefined` can't be reassigned or redeclared in root
scope, but can be redeclared in local scope. Because Jisp code never runs in
root scope, for our intents and purposes, `undefined` is a regular identifier.
*/
export const jsReservedNames = new StrSet([`arguments`, `eval`, `false`, `null`, `super`, `this`, `true`])

export function isNativeModule(val) {
  return a.isNpo(val) && val[Symbol.toStringTag] === `Module`
}
export function reqNativeModule(val) {return a.req(val, isNativeModule)}
export function optNativeModule(val) {return a.opt(val, isNativeModule)}

// // SYNC[canonical_module_url]
// export function isCanonicalModuleFileUrl(val) {
//   return isAbsFileUrl(val) && isCanonicalModuleUrl(val)
// }

// SYNC[canonical_module_url]
export function isCanonicalModuleUrl(val) {
  return isAbsUrl(val) && !val.search && !val.hash
}

export function isAbsUrl(val) {
  return isAbsFileUrl(val) || isAbsNetworkUrl(val)
}

export function isFileUrl(val) {
  return a.isInst(val, URL) && val.protocol === `file:`
}

export function isAbsFileUrl(val) {
  return isFileUrl(val) && !val.hostname
}

export function isAbsNetworkUrl(val) {
  return a.isInst(val, URL) && !isFileUrl(val) && !!val.hostname
}

export function isCanonicalModuleSrcUrlStr(val) {
  return isCanonicalModuleUrlStr(val) && p.posix.ext(val) === jc.conf.getFileExtSrc()
}

export function isCanonicalModuleTarUrlStr(val) {
  return isCanonicalModuleUrlStr(val) && p.posix.ext(val) === jc.conf.getFileExtTar()
}

// // SYNC[canonical_module_url]
// export function isCanonicalModuleFileUrlStr(val) {
//   return isAbsFileUrlStr(val) && isCanonicalModuleUrlStr(val)
// }

// SYNC[canonical_module_url]
export function isCanonicalModuleUrlStr(val) {
  return a.isStr(val) && !isStrWithUrlDecorations(val) && isAbsUrlStr(val)
}

// export function reqCanonicalModuleUrlStr(val) {
//   return a.req(val, isCanonicalModuleUrlStr)
// }

// TODO better name.
export function isRelImplicitStr(val) {
  return a.isStr(val) && !hasScheme(val) && p.posix.isRelImplicit(val)
}

// TODO better name.
export function isCanonicalRelImplicitStr(val) {
  return isRelImplicitStr(val) && !isStrWithUrlDecorations(val)
}

/*
See the comment on `ImportBase` for the various formats of import paths that
we support.
*/
export function isCanonicalModulePath(val) {
  return isCanonicalRelImplicitStr(val) || isCanonicalModuleUrlStr(val)
}

export function isStrWithUrlDecorations(val) {
  return a.isStr(val) && (val.includes(`?`) || val.includes(`#`))
}

/*
export function stripUrlDecorations(val) {
  val = sliceUntil(val, `#`)
  val = sliceUntil(val, `?`)
  return val
}
*/

/*
export function replaceExt(src, exp) {
  a.reqStr(src)
  a.reqStr(exp)

  const act = p.posix.ext(src)
  if (act === exp) return src
  return a.stripSuf(src, act) + exp
}
*/

/*
function sliceUntil(src, str) {
  src = a.reqStr(src)
  str = a.reqStr(str)
  const ind = src.indexOf(str)
  if (ind >= 0) return src.slice(0, ind)
  return src
}
*/

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
  // Used by `a.pk` and `a.Coll`.
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

// Suboptimal, needs tuning.
// TODO move to `@mitranim/js` and revise.
export function mapUniq(src, fun) {
  src = a.map(src, fun)
  switch (src.length) {
    case 0: return src
    case 1: return src
    default: return [...new Set(src)]
  }
}

export function own(tar, key) {
  a.reqComp(tar)
  a.reqValidStr(key)
  if (a.hasOwn(tar, key)) return
  Object.defineProperty(tar, key, {writable: true})
}

export function mapPair(src, fun) {
  src = a.arr(src)
  a.reqFun(fun)

  const len = src.length
  if (len % 2) throw Error(`expected an even number of elements, got ${a.show(len)} elements`)

  let out = []
  let ind = 0
  while (ind < len) out.push(fun.call(this, src[ind++], src[ind++]))
  return out
}