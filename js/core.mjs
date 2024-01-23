/*
Technical note. The compiler core is provided as a single file, without any
dependencies, to minimize startup latency. It would be preferable to split this
up for code clarity and maintenance, but that would have negative effects on
user experience, or require an additional build step.
*/

/*
# Reading-related code

In Lisp-style languages, "reading" means taking source code and generating AST
nodes from it.
*/

/*
Describes a view over a source string, spanning from position A to position B,
where positions may be anywhere in the source string.
*/
export class Span {
  src = ``
  pos = 0
  end = 0
  path = ``

  constructor(...src) {if (src.length) this.init(...src)}

  init(src, pos, end, path) {
    src = laxStr(src)
    this.src = src
    this.pos = optNat(pos) ?? 0
    this.end = optNat(end) ?? src.length
    this.path = laxStr(path)
    return this
  }

  hasMore() {return this.pos < this.src.length && this.pos < this.end}
  skip(len) {return this.pos += reqNat(len), this}
  view() {return this.src.slice(this.pos, this.end)}

  context() {
    const src = this.src
    const pos = this.pos
    const rem = src.slice(pos)
    if (!rem) return ``

    const [row, col] = rowCol(src, pos)

    return joinParagraphs(
      reqStr(this.path) + `:` + (row + 1) + `:` + (col + 1),
      joinLines(
        (row ? ellipsis : ``),
        (pos && col ? ellipsis : ``) + trunc(rem, 128, ellipsis),
      ),
    )
  }
}

export class Reader extends Span {
  *[Symbol.iterator]() {
    let val
    while (isSome(val = this.read())) yield val
  }

  read() {
    if (!this.more()) return undefined

    return (
      undefined
      ?? this.readBraces()
      ?? this.readBrackets()
      ?? this.readParens()
      ?? this.readBigInt()
      ?? this.readFloat()
      ?? this.readStrBacktick()
      ?? this.readStrDouble()
      ?? this.readSym()
      ?? panic(this.errUnrec())
    )
  }

  more() {return this.skippedCosmetic(), this.hasMore()}

  // SYNC[delim].
  reqDelim() {
    const head = this.src[this.pos]
    if (
      !head
      || head === ` `
      || head === `\t`
      || head === `\v`
      || head === `\r`
      || head === `\n`
      || head === `{`
      || head === `}`
      || head === `[`
      || head === `]`
      || head === `(`
      || head === `)`
    ) return
    throw this.errUnrec(`expected whitespace, delimiter, or EOF`)
  }

  readBraces() {return this.readList(`{`, `}`)}
  readBrackets() {return this.readList(`[`, `]`)}
  readParens() {return this.readList(`(`, `)`)}

  readList(pre, suf) {
    reqValidStr(pre)
    reqValidStr(suf)
    this.reqNoPrefix(suf)

    const start = this.pos
    if (!this.skippedPrefix(pre)) return undefined

    const out = []

    for (;;) {
      if (!this.more()) break
      if (this.skippedPrefix(suf)) {
        nodeSpanSet(out, this.spanSince(start))
        return out
      }
      out.push(this.read())
    }

    throw this.err(`expected closing ${show(suf)}, found EOF`)
  }

  readBigInt() {
    const mat = this.view().match(/^(-?\d+(?:_\d+)*)n/)
    if (!mat) return undefined

    const out = BigInt(mat[1])
    this.skip(mat[0].length)
    this.reqDelim()
    return out
  }

  readFloat() {
    const mat = this.view().match(/^-?\d+(?:_\d+)*(?:[.]\d+(?:_\d+)*)?/)
    if (!mat) return undefined

    const src = reqStr(mat[0])
    const out = reqFin(Number.parseFloat(src.replace(/_/g, ``)))
    this.skip(src.length)
    this.reqDelim()
    return out
  }

  readStrBacktick() {
    const mat = this.view().match(/^(?:``(?!`)|(`+)(?!`)([^]*?)\1)/)
    if (!mat) return undefined

    const out = laxStr(mat[2])
    this.skip(mat[0].length)
    this.reqDelim()
    return out
  }

  readStrDouble() {
    const mat = this.view().match(/^(?:""(?!")|("+)(?!")((?:\\[^]|[^])*?)\1)/)
    if (!mat) return undefined

    const out = this.decodeStr(laxStr(mat[2]))
    this.skip(mat[0].length)
    this.reqDelim()
    return out
  }

  decodeStr(src) {
    reqStr(src)
    if (src.includes(`\\`)) return JSON.parse(`"` + src + `"`)
    return src
  }

  readSym() {
    const start = this.pos

    if (!this.skippedSymUnqual()) return undefined
    while (this.skippedPrefix(accessor)) {
      if (!this.skippedSymUnqual()) {
        throw this.errUnrec(`expected symbol after accessor`)
      }
    }

    this.reqDelim()
    return Symbol.for(this.src.slice(start, this.pos))
  }

  skippedSymUnqual() {return this.skippedSymIdent() || this.skippedSymOper()}
  skippedSymIdent() {return this.skippedReg(this.regIdent())}
  skippedSymOper() {return this.skippedReg(this.regOper())}
  regIdent() {return regIdentBegin}
  regOper() {return regOperBegin}

  spanSince(ind) {
    reqNat(ind)
    return new Span(this.src, ind, this.pos, this.path)
  }

  skippedCosmetic() {
    const pos = this.pos
    while (this.skippedSpace() || this.skippedComment()) {}
    return this.pos > pos
  }

  skippedComment() {
    return this.skippedReg(/^(;{2,})(?!;)([^]*?)\1/) && (this.reqDelim(), true)
  }

  skippedSpace() {return this.skippedReg(/^\s+/)}

  skippedPrefix(pre) {
    reqValidStr(pre)
    return this.hasPrefix(pre) && (this.skip(pre.length), true)
  }

  // Assumes that the regex starts with `^`.
  skippedReg(reg) {return this.skipped(this.view().match(reqReg(reg))?.[0].length)}

  skipped(len) {return laxNat(len) > 0 && (this.skip(len), true)}

  hasPrefix(pre) {return this.view().startsWith(reqStr(pre))}

  reqNoPrefix(pre) {
    reqValidStr(pre)
    if (this.hasPrefix(pre)) throw this.err(`unexpected ${show(pre)}`)
  }

  reqNoSymAfterNum() {
    const rem = this.view()
    if (this.regIdentChar().test(rem)) {
      throw this.err(`unexpected identifier characters after numeric literal`)
    }
    if (this.regOperChar().test(rem)) {
      throw this.err(`unexpected operator characters after numeric literal`)
    }
  }

  errUnrec(msg) {
    return this.err(`unrecognized syntax` + (msg ? (`; ` + msg) : ``))
  }

  err(msg) {return SyntaxError(joinParagraphs(msg, this.context()))}
}

export const nodeSpans = new WeakMap()
export function nodeSpan(node) {return nodeSpans.get(node)}
export function nodeSpanHas(node) {return nodeSpans.has(node)}

export function nodeSpanSet(node, span) {
  if (isNil(span)) return
  nodeSpans.set(reqComp(node), reqInst(span, Span))
}

// Unused. TODO use or remove.
export function nodeSpanCopy(src, out) {
  if (src === out || !isComp(out)) return
  const val = nodeSpans.get(src)
  if (isNil(val)) return
  nodeSpans.set(out, val)
}

export function nodeContext(src) {
  const span = nodeSpan(src)
  const out = span?.context()
  if (out) return joinParagraphs(`source node context:`, out)
  if (isFun(src)) return joinParagraphs(`source function:`, show(src))
  return joinParagraphs(`source node:`, show(src))
}

/*
TODO: consider also representing the local context object.
May be useful for declaration-related errors.
*/
export function errWithContext(err, src) {
  reqErr(err).message = joinParagraphs(err.message, nodeContext(src))
  return err
}

/*
Takes a UTF-16 position and returns row and col in Unicode characters, with
newlines normalized. The returned row and col are 0-indexed. Callers may want
to increment them when formatting to a string, to match the near-universal
1-indexing convention.

Regular JS strings are encoded as UTF-16. The indexing syntax `str[ind]` and
various string methods such as `.slice` use UTF-16 code points, not Unicode
characters. However, the `for..of` loop iterates Unicode characters, not UTF-16
points, and the chunk length at each iteration can be above 1, when surrogate
pairs are found.
*/
export function rowCol(src, pos) {
  reqStr(src)
  reqNat(pos)

  let off = 0
  let row = 0
  let col = 0

  for (const char of src) {
    if (off >= pos) break
    off += char.length

    if (char === `\r` && (src.length > off + 1) && (src[off] === `\n`)) {
      continue
    }

    if (char === `\r` || char === `\n`) {
      row++
      col = 0
      continue
    }

    col++
  }

  return [row, col]
}

/*
# Macro-related code
*/

export function macroNode(ctx, tar, src) {
  if (Object.is(tar, src)) return tar
  if (isPromise(tar)) return macroNodeAsync(ctx, tar, src)
  if (isFun(tar)) return macroFun(ctx, tar)
  if (isSym(tar)) return macroSym(ctx, tar)
  if (isArr(tar)) return macroList(ctx, tar)
  if (isObj(tar)) return macroObj(ctx, tar)
  return tar
}

async function macroNodeAsync(ctx, tar, src) {
  try {return await macroNode(ctx, (await tar), src)}
  catch (err) {throw errWithContext(err, src)}
}

export function macroFun(ctx, src) {
  try {return macroNode(ctx, src.call(ctx), src)}
  catch (err) {throw errWithContext(err, src)}
}

export function macroSym(ctx, src) {
  try {
    const path = reqSym(src).description
    const val = ctxReqGet(ctx, path)
    if (isNil(val)) return src

    const fun = getDefault(val)
    if (isFun(fun)) return macroNode(ctx, fun.call(ctx, src), src)

    throw Error(`unexpected reference ${show(path)} to value ${show(val)}`)
  }
  catch (err) {throw errWithContext(err, src)}
}

export function macroList(ctx, src) {
  try {
    reqArr(src)
    if (!src.length) return src

    const head = src[0]
    if (isFun(head)) {
      return macroNode(ctx, head.apply(ctx, src.slice(1)), src)
    }

    if (isSym(head)) {
      const val = ctxReqGet(ctx, head.description)
      if (isFun(val)) {
        return macroNode(ctx, val.apply(ctx, src.slice(1)), src)
      }
    }

    return macroNodes(ctxToExpression(ctx), src)
  }
  catch (err) {throw errWithContext(err, src)}
}

export function macroObj(ctx, src) {
  try {
    reqObj(src)
    if (`macro` in src && isFun(src.macro)) {
      return macroNode(ctx, src.macro(ctx), src)
    }
    return src
  }
  catch (err) {throw errWithContext(err, src)}
}

export function macroNodes(ctx, src) {return ctxMapDual(ctx, src, macroNode)}

/*
# Compilation-related code
*/

export function compileNode(src) {
  switch (typeof src) {
    case `undefined`: return `undefined`
    case `boolean`: return String(src)
    case `number`: return Object.is(src, -0) ? `-0` : String(src)
    case `bigint`: return String(src) + `n`
    case `symbol`: return reqStr(src.description)
    case `string`: return JSON.stringify(src)
    case `object`: return isNil(src) ? `null` : compileObj(src)
    default: throw TypeError(`unable to usefully compile ${typeof src} node ${show(src)}`)
  }
}

export function compileObj(src) {
  if (isArr(src)) return compileList(src)
  if (isDict(src)) return compileDict(src)

  try {
    reqObj(src)
    if (`compile` in src && isFun(src.compile)) return reqStr(src.compile())
    throw TypeError(`unable to compile unrecognized object ${show(src)}`)
  }
  catch (err) {throw errWithContext(err, src)}
}

export function compileList(src) {
  try {
    src = compileNodes(src)
    switch (src.length) {
      case 0: return ``
      case 1: return src[0] + `()`
      default: return src[0] + wrapParens(src.slice(1).join(expressionSep))
    }
  }
  catch (err) {throw errWithContext(err, src)}
}

/*
Technical note. This doesn't support symbolic keys because `Symbol` may be
redeclared / masked in the current scope, and compilation doesn't have access
to context.
*/
export function compileDict(src) {
  return wrapParens(compileDictExpr(src))
}

export function compileDictExpr(src) {
  try {
    const buf = []
    for (const key of Object.keys(src)) {
      buf.push(compileNode(key) + dictEntrySep + (compileNode(src[key]) || `undefined`))
    }
    return wrapBraces(buf.join(expressionSep))
  }
  catch (err) {throw errWithContext(err, src)}
}

export function compileNodes(src) {
  const out = []
  for (src of reqArr(src)) if ((src = compileNode(src))) out.push(src)
  return out
}

export function compileBlock(src) {return wrapBracesMultiLine(compileStatements(src))}
export function compileStatements(src) {return joinStatements(compileNodes(src))}
export function compileSequenceExpression(src) {return wrapParens(compileSequence(src))}
export function compileSequence(src) {return compileNodes(src).join(expressionSep)}
export function joinExpressions(src) {return join(src, expressionSep)}
export function joinStatements(src) {return join(src, statementSep)}
export function wrapBraces(src) {return `{` + reqStr(src) + `}`}
export function wrapBracesMultiLine(src) {return reqStr(src) ? `{\n` + reqStr(src) + `\n}` : `{}`}
export function wrapBrackets(src) {return `[` + reqStr(src) + `]`}
export function wrapParens(src) {return `(` + reqStr(src) + `)`}

export const statementSep = `;\n`
export const expressionSep = `, `
export const dictEntrySep = `: `

export class Raw extends String {compile() {return this.valueOf()}}

export function reprNode(src) {return nodeSpan(src)?.view() || show(src)}

/*
# Module-related code

This stuff allows us to determine module dependency relations and relative paths
used by imports, and to implement module caching and reuse.
*/

// Module metadata. Used for dependency tracking, caching, reuse.
export class Module {
  /*
  Short for "source path". Must be absolute; see `reqCanonicalModulePath`.
  In Jisp modules, must end with `.jisp`. In other modules, must be equal
  to the target path.
  */
  srcPath = undefined /* : reqCanonicalModulePath */

  /*
  Short for "target path". Must be absolute; see `reqCanonicalModulePath`.
  In Jisp modules, must end with `.mjs`, and is inited asynchronously;
  callers must use `await .init()` before accessing this field.
  In other modules, must be equal to the source path.
  */
  tarPath = undefined /* : reqCanonicalModulePath */

  /*
  Short for "source dependencies". Must be used for dependencies which are
  imported by the current module's source file (at macro time), but not
  necessarily by its target file (at runtime). The most typical examples
  are imports via the macros `use` and `declare`.
  */
  srcDeps = undefined /* : Set<reqCanonicalModulePath> */

  /*
  Short for "target dependencies". Must be used for dependencies which
  are imported by the current module's target file (at runtime), but not
  necessarily by its source file (at macro time). The most typical example
  is imports via the macro `import`.
  */
  tarDeps = undefined /* : Set<reqCanonicalModulePath> */

  // Short for "primary key".
  pk() {return this.srcPath}

  init() {
    return this.#init ??= (
      this.isJispModule()
      ? this.initJispModule()
      : ((this.tarPath = this.srcPath), this)
    )
  }
  #init = undefined

  async initJispModule() {
    this.tarPath ??= reqValidStr(await srcToTar(this.srcPath))
    const fs = ctxGlobal[symFs]
    const src = await fs?.readOpt(toMetaUrl(this.tarPath))
    if (src) this.fromJSON(JSON.parse(src))
    return this
  }

  ready() {
    return this.#ready ??= this.isJispModule() ? this.readyJispModule() : this
  }
  #ready = undefined

  async readyJispModule() {
    await this.init()
    if (!await this.isUpToDate()) await this.make(ctxGlobal)
    await this.readyDeps()
    return this
  }

  readyDeps() {
    const deps = optToArr(this.tarDeps)
    if (!deps?.length) return undefined
    return Promise.all(deps.map(moduleReady))
  }

  async make(ctx) {
    try {
      const fs = ctxReqFs(ctx)
      await this.write(fs, await this.compile(ctx, await fs.read(reqToUrl(this.srcPath))))
    }
    catch (err) {
      reqErr(err).message = joinParagraphs(err.message, this.context())
      throw err
    }
  }

  get Reader() {return Reader}

  async compile(ctx, src) {
    this.srcDeps = undefined
    this.tarDeps = undefined
    const read = new this.Reader(src, undefined, undefined, this.srcPath)
    src = await macroNodes(ctxWithModule(ctxWithMixin(ctx), this), [...read])
    return joinStatements(compileNodes(src))
  }

  async write(fs, body) {
    const tarUrl = reqToUrl(this.tarPath)
    const metaUrl = toMetaUrl(tarUrl)

    await Promise.all([
      fs.write(tarUrl, body),
      fs.write(metaUrl, JSON.stringify(this, null, 2)),
    ])

    this.tarTime = reqFin(await fs.timestamp(tarUrl))
    return this
  }

  // Semi-placeholder, lacks cycle detection.
  addSrcDep(val) {
    reqCanonicalModulePath(val)
    if (val !== this.pk()) (this.srcDeps ??= new Set()).add(val)
  }

  // Semi-placeholder, lacks cycle detection.
  addTarDep(val) {
    reqCanonicalModulePath(val)
    if (val !== this.pk()) (this.tarDeps ??= new Set()).add(val)
  }

  /*
  A module is up to date when its target file is newer than its source
  dependencies (compile-time dependencies), which includes its source file and
  any files it imports at macro time or compile time, directly or indirectly.

  Updates in target dependencies (runtime dependencies) do not make a module
  outdated. That's because target dependencies don't affect the compiled code
  of the current module, only its eventual runtime behavior. However, updates
  in the target dependencies of source dependencies (runtime dependencies of
  compile-time dependencies) absolutely do make a module outdated, because they
  affect its compiled code.

  Modules which are unreachable on the current FS are assumed to be always up to
  date. This is typical for external libraries imported over the network or via
  implicitly relative paths.

  For modules which have a Jisp source, if their target file doesn't exist,
  their timestamp should be `undefined`, which should be considered outdated,
  and should invalidate the target file of the current module.

  For modules which have no Jisp source, we only care about their target
  timestamp.

  Known issue: we currently don't bother finding runtime dependencies of JS
  files used as dependencies of Jisp files. It would require parsing JS.
  */
  async isUpToDate() {
    if (!this.isJispModule()) return true

    const srcTime = optFin(await this.optSrcTime())
    if (isNil(srcTime)) return true

    const tarTime = optFin(await this.optTarTime())
    if (isNil(tarTime)) return false
    if (!(tarTime > srcTime)) return false

    await this.init()
    const deps = optToArr(this.srcDeps)
    if (!deps?.length) return true

    /*
    Technical note.

    Even though we're looking at source dependencies, we care about their target
    timestamps, not their source timestamps.

    The given target file is invalidated if there is a more recent change in any
    target file among its direct or indirect "source dependencies". Note the
    "indirect" part. It's not enough to check the timestamps of its direct
    dependencies. We also need the largest timestamp from among all transitive
    dependencies.
    */
    const times = await Promise.all(deps.map(moduleTimeMax))

    /*
    If the target timestamps of any direct or indirect dependencies are missing,
    `Math.max` returns `NaN` and the current module's target file is considered
    to be outdated. That's what we want. Missing timestamps mean that their
    target files are either not ready, or not reachable on the current FS. In
    that case, the current module must wait for them to be ready, and recompile
    its own target file.
    */
    return tarTime >= Math.max(...times)
  }

  srcTime = undefined /* : isFin | Promise<isFin> */
  optSrcTime() {
    if (!this.isJispModule()) return undefined
    return this.srcTime ??= this.srcTimeAsync()
  }

  async srcTimeAsync() {
    return this.srcTime = reqFin(await ctxReqFs(ctxGlobal).timestamp(reqToUrl(this.srcPath)))
  }

  tarTime = undefined /* : isFin | Promise<isFin> */
  optTarTime() {return this.tarTime ??= this.tarTimeAsync()}

  async tarTimeAsync() {
    await this.init()
    const tar = reqToUrl(this.tarPath)
    const fs = ctxReqFs(ctxGlobal)
    if (!fs.canReach(tar)) return this.tarTime = 0
    return this.tarTime = optFin(await fs.timestampOpt(tar))
  }

  /*
  We currently don't cache this value because it depends on the state of other
  modules, which may be mutated between calls to this function. However, it may
  actually be cachable. TODO reconsider.
  */
  async timeMax() {
    await this.init()

    return onlyFin(Math.max(...await Promise.all([
      Promise.resolve(this.optSrcTime()).then(laxFin),
      this.optTarTime(),
      ...laxToArr(this.srcDeps).map(moduleTimeMax),
      ...laxToArr(this.tarDeps).map(moduleTimeMax),
    ])))
  }

  isJispModule() {return isJispModulePath(this.srcPath)}

  context() {
    const src = this.srcPath
    return src ? joinParagraphs(`module path:`, src) : ``
  }

  toJSON() {
    return {
      srcPath: this.srcPath,
      tarPath: this.tarPath,
      srcDeps: optToArr(this.srcDeps),
      tarDeps: optToArr(this.tarDeps),
    }
  }

  fromJSON(src) {
    reqDict(src)
    this.srcPath = reqValidStr(src.srcPath)
    this.tarPath = reqValidStr(src.tarPath)
    this.srcDeps = optToSet(src.srcDeps)
    this.tarDeps = optToSet(src.tarDeps)
  }
}

function moduleReady(key) {return ctxReqModules(ctxGlobal).getReady(key)}

async function moduleTimeMax(key) {
  return (await ctxReqModules(ctxGlobal).getInit(key)).timeMax()
}

export class Modules extends Map {
  get Module() {return Module}

  set(key, val) {return super.set(key, reqInst(val, this.Module))}

  getInit(key) {
    if (this.has(key)) return this.get(key)
    const out = this.make(key)
    super.set(key, out)
    return out.init()
  }

  async getReady(key) {return (await this.getInit(key)).ready()}

  make(key) {
    const out = new this.Module()
    out.srcPath = reqCanonicalModulePath(key)
    return out
  }
}

/*
# Context-related code

Contexts represent lexical scopes. They also store other essential information
such as whether we're in module root, whether we're in statement or expression
mode, what's the current module, and so on. Contexts inherit from each other
prototypically, just like native scopes which they represent.

Declared names are stored as regular properties. Internal data is stored using
symbolic properties. There is no collision.

When the value of a declared name is nil, the declaration is runtime-only.
When the value of a declared name is non-nil, it may be used during macroing,
for example by calling it as a function.
*/

/*
These symbolic keys are used for internal data stored in contexts. User-defined
macro code is free to invent its own symbolic keys for its own internal data.
*/
export const symModule = Symbol.for(`jisp.module`)
export const symModules = Symbol.for(`jisp.modules`)
export const symFs = Symbol.for(`jisp.fs`)
export const symTar = Symbol.for(`jisp.tar`)
export const symMain = Symbol.for(`jisp.main`)
export const symStatement = Symbol.for(`jisp.statement`)
export const symMixin = Symbol.for(`jisp.mixin`)

/*
Global context. Used as the prototype of module contexts. User code is free to
add global declarations by mutating this context. In particular, user code
should add the `use` macro from the prelude module. See `run_deno.mjs`.
*/
export const ctxGlobal = Object.create(null)
ctxGlobal[symModules] = new Modules()

export function ctxIsModule(ctx) {return hasOwn(ctx, symModule)}
export function ctxIsStatement(ctx) {return hasOwn(ctx, symStatement)}
export function ctxIsExportable(ctx) {return ctxIsModule(ctx) && ctxIsStatement(ctx)}

export function ctxReqModule(ctx) {
  return ctx[symModule] ?? panic(Error(`missing module in context ${show(ctx)}`))
}

export function ctxReqModules(ctx) {
  return ctx[symModules] ?? panic(Error(`missing modules in context ${show(ctx)}`))
}

export function ctxReqFs(ctx) {
  return ctx[symFs] ?? panic(Error(`missing filesystem in context ${show(ctx)}`))
}

export function ctxReqTar(ctx) {
  return optStr(ctx[symTar]) || panic(Error(`missing target in context ${show(ctx)}`))
}

export function ctxReqGet(ctx, path) {
  reqStr(path)

  let name = strNs(path)
  if (!(isComp(ctx) && name in ctx)) throw Error(`missing declaration of ${show(name)}`)

  let val = ctx[name]
  if (isNil(val)) return val

  while ((path = strWithoutNs(path, name))) {
    name = strNs(path)
    if (!(isComp(val) && name in val)) throw Error(`missing property ${show(name)} in ${show(val)}`)
    val = val[name]
  }

  return val
}

export function ctxDeclare(ctx, key, val) {
  const name = symIdent(key)
  if (hasOwn(ctx, name)) throw Error(`redundant declaration of ${show(name)}`)
  ctx[name] = val
}

export function ctxRedeclare(ctx, key, val) {ctx[symIdent(key)] = val}

export function ctxReqParentMixin(ctx) {
  const out = Object.getPrototypeOf(ctx)
  if (!hasOwn(out, symMixin)) {
    throw Error(`missing mixin namespace in context ${show(ctx)}`)
  }
  return out
}

export function ctxReqStatement(ctx) {
  if (ctxIsStatement(ctx)) return ctx
  throw Error(`expected statement context, got expression context`)
}

export function ctxWithStatement(ctx) {
  ctx = Object.create(ctx)
  ctx[symStatement] = undefined
  return ctx
}

export function ctxToExpression(ctx) {
  return ctxIsStatement(ctx) ? Object.create(ctx) : ctx
}

export function ctxWithMixin(ctx) {
  ctx = Object.create(ctx)
  ctx[symMixin] = undefined
  return ctx
}

export function ctxWithModule(ctx, mod) {
  ctx = Object.create(ctx)
  ctx[symModule] = mod
  ctx[symStatement] = undefined
  return ctx
}

export function ctxImportSrcUrl(ctx, src) {
  reqStr(src)

  if (src.startsWith(schemeJisp)) {
    return reqToUrl(src.slice(schemeJisp.length), import.meta.url)
  }

  if (isStrWithScheme(src)) return reqToUrl(src)

  if (isStrAbsOrRelExplicit(src)) {
    return reqToUrl(src, ctxReqModule(ctx).srcPath)
  }

  throw Error(`unable to resolve ${show(src)} into import URL`)
}

export function ctxCompileExport(ctx) {
  return ctxIsExportable(ctx) ? `export` : ``
}

export function ctxMapDual(ctx, src, fun, ind = 0, out = []) {
  reqArr(src)
  reqFun(fun)
  reqNat(ind)

  while (ind < src.length) {
    const val = fun(ctx, src[ind])
    if (isPromise(val)) return ctxMapAsync(ctx, src, fun, ind, out, val)
    out.push(val)
    ind++
  }
  return out
}

async function ctxMapAsync(ctx, src, fun, ind, out, val) {
  out.push(await val)
  return ctxMapDual(ctx, src, fun, ind + 1, out)
}

/*
# Misc utils
*/

// SYNC[accessor].
const accessor = `.`

const ellipsis = `…`

export function isSymUnqual(val) {return isSym(val) && !val.description.includes(accessor)}
export function isSymAccess(val) {return isSym(val) && val.description.includes(accessor)}
export function symIsUnqual(val) {return !reqSym(val).description.includes(accessor)}
export function symIsAccess(val) {return reqSym(val).description.includes(accessor)}

export function reqSymUnqual(val) {
  if (isSymUnqual(val)) return val
  throw TypeError(`expected unqualified symbol, got ${show(val)}`)
}

export function symIdent(val) {return reqStrIdent(reqSym(val).description)}
export function symIdentLike(val) {return reqStrIdentLike(reqSym(val).description)}

export function reqStrIdent(val) {
  reqStrIdentLike(val)
  reqNotKeyword(val)
  reqNotReservedName(val)
  return val
}

/*
TODO consider removing the regex test for simplicity and performance.
If user code wants to use a weird symbol with spaces and whatnot,
that's their problem. Our parser generates only symbols representing
identifiers and operators.
*/
export function reqStrIdentLike(val) {
  reqValidStr(val)
  if (regIdentFull.test(val)) return val
  throw SyntaxError(`${show(val)} does not represent a valid JS identifier`)
}

// SYNC[ident_unqual].
export const regIdentBegin = /^[A-Za-z_$][\w$]*/
export const regIdentFull  = /^[A-Za-z_$][\w$]*$/

// SYNC[oper_unqual].
export const regOperBegin = /^[\~\!\@\#\%\^\&\*\:\<\>\?\/\\\|\=\+\-]+/
export const regOperFull  = /^[\~\!\@\#\%\^\&\*\:\<\>\?\/\\\|\=\+\-]+$/

export function reqNotKeyword(val) {
  if (!keywordNames.has(val)) return val
  throw SyntaxError(`${show(val)} is a keyword in JS; attempting to use it as a regular identifier would generate invalid JS with a syntax error; please rename`)
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
export const keywordNames = new Set([`await`, `case`, `catch`, `class`, `const`, `continue`, `debugger`, `default`, `delete`, `do`, `else`, `enum`, `export`, `extends`, `finally`, `for`, `function`, `if`, `implements`, `import`, `in`, `instanceof`, `interface`, `let`, `new`, `package`, `private`, `protected`, `public`, `return`, `static`, `switch`, `throw`, `try`, `typeof`, `var`, `void`, `while`, `with`, `yield`])

export function reqNotReservedName(val) {
  if (!reservedNames.has(val)) return val
  throw SyntaxError(`${show(val)} is a reserved name in JS; attempting to redeclare it would generate invalid JS with a syntax error; please rename`)
}

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

  [use `jisp:prelude.mjs` jp]
  [jp.declare jp.globals]

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

For example, `func` contextually declares the macro `ret`, if and only if the
name `ret` is completely missing from the current scope. If the name `ret` is
already declared, then `func` does not declare it. If it does declare `ret`, it
ensures that `ret` can still be redeclared.

As a special case, this set includes `undefined`. At the time of writing,
`undefined` is NOT a reserved name in ES. It's a regular predeclared
identifier. In ES5+, the predeclared `undefined` can't be reassigned or
redeclared in root scope, but can be redeclared in local scope. We forbid its
redeclaration because this allows us to safely use the name `undefined` in
compiled code. We could also use something like `void 0` to safely obtain the
native value of `undefined`, but that's just too easy to forget. Even if we
correctly handle redeclaration of `undefined` in the compiler codebase, user
code could forget. Banning its redeclaration seems like a safer choice.
*/
export const reservedNames = new Set([`arguments`, `eval`, `false`, `null`, `super`, `this`, `true`, `undefined`])

export function symNs(val) {return strNs(reqSym(val).description)}

export function strNs(src) {
  reqStr(src)
  const ind = src.indexOf(accessor)
  if (ind >= 0) return src.slice(0, ind)
  return src
}

function strWithoutNs(src, pre) {
  return reqStr(src).slice(reqStr(pre).length + accessor.length)
}

export function reqArity(len, exp) {
  if (reqNat(len) === reqNat(exp)) return
  throw SyntaxError(`expected ${exp} inputs, got ${len} inputs`)
}

export function reqArityNullary(len) {
  if (len === 0) return
  throw SyntaxError(`expected no inputs, got ${show(len)} inputs`)
}

export function reqArityMin(len, min) {
  if (reqNat(len) >= reqNat(min)) return
  throw SyntaxError(`expected at least ${min} inputs, got ${len} inputs`)
}

export function reqArityMax(len, max) {
  if (reqNat(len) <= reqNat(max)) return
  throw SyntaxError(`expected no more than ${max} inputs, got ${len} inputs`)
}

export function reqArityBetween(len, min, max) {
  reqNat(len)
  reqNat(min)
  reqNat(max)
  if (len >= min && len <= max) return
  throw SyntaxError(`expected between ${min} and ${max} inputs, got ${len} inputs`)
}

export const fileExtJisp = `.jisp`
export const schemeJisp = `jisp:`
export const fileExtJs = `.mjs`

export function toMetaUrl(val) {
  val = reqToUrl(val)
  val.pathname += `.meta.json`
  return val
}

export function isCanonicalModulePath(val) {
  return (
    isValidStr(val)
    && !isStrWithUrlDecorations(val)
    && !isStrAbsOrRelExplicit(val)
    && !val.endsWith(pathPosixSep)
  )
}

export function reqCanonicalModulePath(val) {
  if (isCanonicalModulePath(val)) return val
  throw Error(`expected canonical module path, got ${show(val)}`)
}

export function isJispPath(val) {
  return isStr(val) && val.endsWith(fileExtJisp)
}

export function isJispModulePath(val) {
  return isJispPath(val) && isStrWithScheme(val)
}

export const srcsToTars = Object.create(null)

export function srcToTar(src) {
  if (isJispModulePath(src)) {
    return srcsToTars[src] ??= srcToTarAsync(ctxGlobal, src)
  }
  return reqCanonicalModulePath(src)
}

export async function srcToTarAsync(ctx, src) {
  reqStr(src)

  const tar = pathClean(ctxReqTar(ctx))
  const name = pathFileNameWithoutExt(src) + fileExtJs
  const main = ctx[symMain]
  const srcDir = pathClean(reqToUrl(`.`, src).href)

  if (main && pathClean(main) === srcDir) return pathJoin(tar, name)

  const key = pathsWithoutCommonPrefix(srcDir, tar).map(pathArrJoin).join(`:`)
  const hash = await strHash(key)
  return pathJoin(tar, hash, name)
}

/*
# Generic utils

Generic utility code adapted from `https://github.com/mitranim/js`.
Adapting just the necessary code allows us to keep this project
comapact and dependency-free. Dependencies have a very measurable
impact on startup latency, even on fast machines. We also specialize
some of these utils just for Jisp.
*/

export function hasOwn(val, key) {
  reqKey(key)
  return isComp(val) && Object.prototype.hasOwnProperty.call(val, key)
}

export function isNil(val) {return val == null}
export function isSome(val) {return val != null}

export function isComp(val) {return isObj(val) || isFun(val)}
export function reqComp(val) {return isComp(val) ? val : panic(errFun(val, isComp))}
export function optComp(val) {return isNil(val) ? val : reqComp(val)}

export function isFun(val) {return typeof val === `function`}
export function reqFun(val) {return isFun(val) ? val : panic(errFun(val, isFun))}
export function optFun(val) {return isNil(val) ? val : reqFun(val)}

export function isObj(val) {return isSome(val) && typeof val === `object`}
export function reqObj(val) {return isObj(val) ? val : panic(errFun(val, isObj))}
export function optObj(val) {return isNil(val) ? val : reqObj(val)}

export function isDict(val) {
  if (!isObj(val)) return false
  val = Object.getPrototypeOf(val)
  return isNil(val) || val === Object.prototype
}
export function reqDict(val) {return isDict(val) ? val : panic(errFun(val, isDict))}
export function optDict(val) {return isNil(val) ? val : reqDict(val)}

/*
In this system, only "true" arrays are treated as arrays. Subclasses of `Array`
are considered arbitrary objects.
*/
export function isArr(val) {return Array.isArray(val) && val.constructor === Array}
export function reqArr(val) {return isArr(val) ? val : panic(errFun(val, isArr))}
export function optArr(val) {return isNil(val) ? val : reqArr(val)}
export function laxArr(val) {return isNil(val) ? [] : reqArr(val)}
export function optToArr(val) {return isSome(val) ? [...val] : undefined}
export function laxToArr(val) {return optToArr(val) ?? []}

export function isKey(val) {return isStr(val) || isSym(val)}
export function reqKey(val) {return isKey(val) ? val : panic(errFun(val, isKey))}
export function optKey(val) {return isNil(val) ? val : reqKey(val)}

export function isNum(val) {return typeof val === `number`}
export function reqNum(val) {return isNum(val) ? val : panic(errFun(val, isNum))}
export function optNum(val) {return isNil(val) ? val : reqNum(val)}

export function isFin(val) {return Number.isFinite(val)}
export function reqFin(val) {return isFin(val) ? val : panic(errFun(val, isFin))}
export function optFin(val) {return isNil(val) ? val : reqFin(val)}
export function laxFin(val) {return isNil(val) ? 0 : reqFin(val)}
export function onlyFin(val) {return isFin(val) ? val : undefined}

export function isInt(val) {return Number.isSafeInteger(val)}
export function reqInt(val) {return isInt(val) ? val : panic(errFun(val, isInt))}
export function optInt(val) {return isNil(val) ? val : reqInt(val)}
export function laxInt(val) {return isNil(val) ? 0 : reqInt(val)}

export function isNat(val) {return isInt(val) && val >= 0}
export function reqNat(val) {return isNat(val) ? val : panic(errFun(val, isNat))}
export function optNat(val) {return isNil(val) ? val : reqNat(val)}
export function laxNat(val) {return isNil(val) ? 0 : reqNat(val)}

export function isBigInt(val) {return typeof val === `bigint`}
export function reqBigInt(val) {return isBigInt(val) ? val : panic(errFun(val, isBigInt))}
export function optBigInt(val) {return isNil(val) ? val : reqBigInt(val)}

export function isStr(val) {return typeof val === `string`}
export function reqStr(val) {return isStr(val) ? val : panic(errFun(val, isStr))}
export function optStr(val) {return isNil(val) ? val : reqStr(val)}
export function laxStr(val) {return isNil(val) ? `` : reqStr(val)}

export function isValidStr(val) {return isStr(val) && !!val}
export function reqValidStr(val) {return isValidStr(val) ? val : panic(errFun(val, isValidStr))}
export function optValidStr(val) {return isNil(val) ? val : reqValidStr(val)}

export function isSym(val) {return typeof val === `symbol`}
export function reqSym(val) {return isSym(val) ? val : panic(errFun(val, isSym))}
export function optSym(val) {return isNil(val) ? val : reqSym(val)}
export function isSymWith(val, desc) {return isSym(val) && val.description === desc}

export function isInst(val, cls) {return isObj(val) && val instanceof cls}
export function reqInst(val, cls) {return isInst(val, cls) ? val : panic(errInst(val, cls))}
export function optInst(val, cls) {return isNil(val) ? val : reqInst(val, cls)}

export function isErr(val) {return isInst(val, Error)}
export function reqErr(val) {return isErr(val) ? val : panic(errFun(val, isErr))}
export function optErr(val) {return isNil(val) ? val : reqErr(val)}

export function isReg(val) {return isInst(val, RegExp)}
export function reqReg(val) {return isReg(val) ? val : panic(errFun(val, isReg))}
export function optReg(val) {return isNil(val) ? val : reqReg(val)}

export function isSet(val) {return isInst(val, Set)}
export function reqSet(val) {return isSet(val) ? val : panic(errFun(val, isSet))}
export function optSet(val) {return isNil(val) ? val : reqSet(val)}
export function optToSet(val) {return isSome(val) ? new Set(val) : undefined}

// 99% solution. Performs much better than a "full" solution.
export function isPromise(val) {return isInst(val, Promise)}

export function isScalar(val) {
  if (isComp(val)) {
    if (!(`toString` in val)) return false
    const fun = val.toString
    return isFun(fun) && fun !== Object.prototype.toString && fun !== Array.prototype.toString
  }
  return !(isNil(val) || isSym(val) || isFun(val))
}

export function panic(val) {throw val}

export function renderOpt(val) {
  return isStr(val) ? val : isScalar(val) ? String(val) : undefined
}

export function show(val) {
  if (isStr(val)) return JSON.stringify(val)
  if (isSym(val)) return val.description
  if (isFun(val)) return showFun(val)
  if (isObj(val)) return showObj(val)
  return String(val)
}

function showObj(val) {
  if (isErr(val)) return String(val)
  if (isArr(val)) return showArr(val)

  const con = getCon(val)
  if (!con || con === Object) return showDict(val)

  const name = getName(con)
  if (!name) return String(val)

  return `[object ${name}]`
}

function showArr(src) {return wrapBrackets(src.map(show).join(expressionSep))}

function showDict(src) {
  const buf = []
  for (const key of Object.getOwnPropertySymbols(src)) {
    buf.push(showDictEntry(key, src[key]))
  }
  for (const key of Object.getOwnPropertyNames(src)) {
    buf.push(showDictEntry(key, src[key]))
  }
  return wrapBraces(buf.join(expressionSep))
}

function showDictEntry(key, val) {
  return showDictKey(key) + dictEntrySep + show(val)
}

function showDictKey(val) {
  if (isSym(val)) return wrapBrackets(val.toString())
  return regIdentFull.test(reqStr(val)) ? val : show(val)
}

export function trunc(src, len, suf) {
  src = laxStr(src)
  len = reqNat(len)
  suf = laxStr(suf)

  if (!len) return ``
  if (src.length <= len) return src

  let chars = 0
  let prev = 0
  let ind = 0

  for (const char of src) {
    if ((chars + 1) > len) return src.slice(0, ind - prev) + suf
    chars++
    prev = char.length
    ind += prev
  }

  return src
}

function errFun(val, fun) {return TypeError(msgType(val, showFunName(fun)))}
function msgType(val, msg) {return `expected variant of ${msg}, got ${show(val)}`}
function errInst(val, cls) {return TypeError(msgInst(val, cls))}
function msgInst(val, cls) {return `expected instance of ${showFunName(cls)}, got ${instDesc(getCon(val))}${show(val)}`}
function instDesc(val) {return isFun(val) ? `instance of ${showFunName(val)} ` : ``}
function showFun(val) {return `[function ${val.name || val}]`}
function showFunName(fun) {return fun.name || showFun(fun)}
function getCon(val) {return isComp(val) && `constructor` in val ? val.constructor : undefined}
function getName(val) {return isComp(val) && `name` in val ? val.name : undefined}
function getDefault(val) {return isComp(val) && `default` in val ? val.default : undefined}
function init(src) {return reqArr(src).slice(0, -1)}
function last(src) {return reqArr(src)[src.length - 1]}
function repeat(val, len) {return Array(len).fill(val)}

export function joinDense(...src) {return join(src, ``)}
export function joinSpaced(...src) {return join(src, ` `)}
export function joinLines(...src) {return join(src, `\n`)}
export function joinParagraphs(...src) {return join(src, `\n\n`)}

export function join(src, sep) {
  reqStr(sep)
  let out = ``
  if (isSome(src)) {
    for (src of reqArr(src)) if (optStr(src)) out += (out && sep) + src
  }
  return out
}

/*
Differences from `Object.assign`:

  * Iterates ALL enumerable properties, including inherited properties.
  * Assigns only new properties, ignoring existing properties.
*/
export function patch(tar, src) {
  reqObj(tar)
  for (const key in optObj(src)) if (!(key in tar)) tar[key] = src[key]
  return tar
}

/*
Similar to `patch` but assigns empty values. Intended for cases where we have
access to a dictionary of usable key-values, like an imported module, but want
to only declare names without making those values accessible at compile time.
*/
export function patchDecl(tar, src) {
  reqObj(tar)
  for (const key in optObj(src)) if (!(key in tar)) tar[key] = undefined
  return tar
}

const pathPosixSep = `/`

export function isStrWithScheme(val) {return isStr(val) && /^\w+:/.test(val)}

export function isStrAbsOrRelExplicit(val) {
  return (
    isStr(val) && (val.startsWith(`/`) || val.startsWith(`./`) || val.startsWith(`../`))
  )
}

export function isStrRelImplicit(val) {
  return isStr(val) && !isStrAbsOrRelExplicit(val) && !isStrWithScheme(val)
}

export function isStrWithUrlDecorations(val) {
  return isStr(val) && (val.includes(`?`) || val.includes(`#`))
}

export function optToUrl(src) {
  return isInst(src, URL) ? src : isStrWithScheme(src) ? reqToUrl(src) : undefined
}

/*
Workaround for how an URL fails to be constructed, some JS environments don't
include the arguments into the error message. Including them is helpful for
debugging.
*/
export function reqToUrl(path, base) {
  try {return new URL(...arguments)}
  catch (err) {
    reqErr(err).message += dictEntrySep + show(path) + (base ? ` with base ${show(base)}` : ``)
    throw err
  }
}

export function optUrlRel(src, tar) {
  src = optToUrl(src)
  tar = optToUrl(tar)
  if (!isUrlSameOrigin(src, tar)) return undefined

  ;[src, tar] = pathsWithoutCommonPrefix(src.pathname, tar.pathname)
  const ups = src.length - 1

  /*
  Prepending `./` makes the path explicitly relative. Unnecessary in many
  situations, but necessary for relative imports, which is where this function
  is actually used.
  */
  const pre = ups > 0 ? repeat(`..`, ups) : [`.`]
  return pathArrJoin(pre.concat(tar))
}

function pathsWithoutCommonPrefix(src, tar) {
  src = reqStr(src).split(pathPosixSep).filter(Boolean)
  tar = reqStr(tar).split(pathPosixSep).filter(Boolean)
  let len = -1
  while (++len < src.length && len < tar.length && src[len] === tar[len]) {}
  if (len) {
    src = src.slice(len)
    tar = tar.slice(len)
  }
  return [src, tar]
}

/*
Similar to `one.origin === two.origin`, but also works for URLs such as
`one:two` or `jisp:prelude.mjs`, where `.origin` is `"null"`.
*/
function isUrlSameOrigin(one, two) {
  return (
    true
    && !!one
    && !!two
    && one.protocol === two.protocol
    && one.hostname === two.hostname
    && one.port === two.port
  )
}

export function pathDir(src) {return init(reqStr(src).split(pathPosixSep)).join(pathPosixSep)}
export function pathFileName(src) {return last(reqStr(src).split(pathPosixSep))}
export function pathFileNameWithoutExt(src) {return init(pathFileName(src).split(`.`)).join(`.`)}

// Incomplete: doesn't drop leading `./`.
export function pathClean(src) {
  const len = pathPosixSep.length
  while (reqStr(src).startsWith(pathPosixSep)) src = src.slice(len)
  while (reqStr(src).endsWith(pathPosixSep)) src = src.slice(0, -len)
  return src
}

export function pathArrJoin(src) {
  let out = ``
  for (src of reqArr(src)) {
    src = pathClean(src)
    if (src) out += (out && pathPosixSep) + src
  }
  return out
}

export function pathJoin(...src) {return pathArrJoin(src)}

export async function strHash(src) {
  src = new TextEncoder().encode(reqStr(src))
  src = await crypto.subtle.digest(`sha-256`, src)
  return arrHex(new Uint8Array(src))
}

export function arrHex(src) {
  reqInst(src, Uint8Array)
  let out = ``
  for (src of src) {
    if (src < 0x10) out += `0`
    out += src.toString(16)
  }
  return out
}
