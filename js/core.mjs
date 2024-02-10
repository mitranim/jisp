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
    this.pos = laxNat(pos)
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

/*
Every sequence of these characters must be parsed as a symbol, with the
exception of numeric literals, which take priority. Some sequences may
be considered invalid.

SYNC[sym].
SYNC[ident].
SYNC[oper].
*/
export const regSymCharsBegin = /^(?:[.]|[\w$]|[\~\!\@\#\%\^\&\*\:\<\>\?\/\\\|\=\+\-])+/
export const regSymCharsFull  = /^(?:[.]|[\w$]|[\~\!\@\#\%\^\&\*\:\<\>\?\/\\\|\=\+\-])+$/

// SYNC[ident].
export const regIdentBegin = /^#?[A-Za-z_$][\w$]*/
export const regIdentFull  = /^#?[A-Za-z_$][\w$]*$/

// SYNC[oper].
export const regOperBegin = /^[\~\!\@\#\%\^\&\*\:\<\>\?\/\\\|\=\+\-]+/
export const regOperFull  = /^[\~\!\@\#\%\^\&\*\:\<\>\?\/\\\|\=\+\-]+$/

export const regSpace       = /^\s+/
export const regComment     = /^(;{2,})(?!;)([^]*?)\1/
export const regBigInt      = /^(-?\d+(?:_\d+)*)n/
export const regFloat       = /^-?\d+(?:_\d+)*(?:[.]\d+(?:_\d+)*)?/
export const regStrBacktick = /^(?:``(?!`)|(`+)(?!`)([^]*?)\1)/
export const regStrDouble   = /^(?:""(?!")|("+)(?!")((?:\\[^]|[^])*?)\1)/
export const regFieldKey    = /^(\d+|[A-Za-z_$][\w$]*)$/

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

  /*
  SYNC[delim].

  TODO consider an additional restriction: an opening delimiter must be
  preceded by either a general delimiter or another opening delimiter.
  */
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
    const mat = this.view().match(regBigInt)
    if (!mat) return undefined

    const out = BigInt(mat[1])
    this.skip(mat[0].length)
    this.reqDelim()
    return out
  }

  readFloat() {
    const mat = this.view().match(regFloat)
    if (!mat) return undefined

    const src = reqStr(mat[0])
    const out = reqFin(Number.parseFloat(src.replace(/_/g, ``)))
    this.skip(src.length)
    this.reqDelim()
    return out
  }

  readStrBacktick() {
    const mat = this.view().match(regStrBacktick)
    if (!mat) return undefined

    const out = laxStr(mat[2])
    this.skip(mat[0].length)
    this.reqDelim()
    return out
  }

  readStrDouble() {
    const mat = this.view().match(regStrDouble)
    if (!mat) return undefined

    let out
    try {out = this.strDecode(laxStr(mat[2]))}
    catch (err) {
      reqErr(err).message = joinParagraphs(err.message, this.context())
      throw err
    }

    this.skip(mat[0].length)
    this.reqDelim()
    return out
  }

  strDecode(src) {return strDecode(src)}

  readSym() {
    const mat = laxStr(this.view().match(regSymCharsBegin)?.[0])
    if (!mat) return undefined

    this.skip(mat.length)
    this.reqDelim()
    return Symbol.for(mat)
  }

  spanSince(ind) {
    reqNat(ind)
    return new Span(this.src, ind, this.pos, this.path)
  }

  skippedCosmetic() {
    const pos = this.pos
    while (this.skippedSpace() || this.skippedComment()) {}
    return this.pos > pos
  }

  skippedComment() {return this.skippedReg(regComment) && (this.reqDelim(), true)}
  skippedSpace() {return this.skippedReg(regSpace)}

  // Assumes that the regex starts with `^`.
  skippedReg(reg) {return this.skipped(this.view().match(reqReg(reg))?.[0].length)}
  skipped(len) {return laxNat(len) > 0 && (this.skip(len), true)}
  skippedPrefix(pre) {return this.hasPrefix(pre) && this.skipped(pre.length)}
  hasPrefix(pre) {return this.view().startsWith(reqStr(pre))}

  reqNoPrefix(pre) {
    reqValidStr(pre)
    if (this.hasPrefix(pre)) throw this.err(`unexpected ${show(pre)}`)
  }

  errUnrec(msg) {
    return this.err(`unrecognized syntax` + (msg ? (`; ` + msg) : ``))
  }

  err(msg) {return SyntaxError(joinParagraphs(msg, this.context()))}
}

export const nodeSpans = new WeakMap()
export function nodeSpan(node) {return nodeSpans.get(node)}
export function nodeSpanHas(node) {return nodeSpans.has(node)}
export function nodeSpanSet(node, span) {nodeSpans.set(reqComp(node), reqInst(span, Span))}

export function nodeWithSpan(node, span) {
  if (isComp(node) && isSome(span)) nodeSpanSet(node, span)
  return node
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
Takes a UTF-16 character position and returns row and col counted in Unicode
characters, with newlines normalized. The returned row and col are 0-indexed.
Callers may want to increment them when formatting to a string, to match the
near-universal 1-indexing convention.
*/
export function rowCol(src, pos) {
  reqStr(src)
  reqNat(pos)

  let off = 0
  let row = 0
  let col = 0

  // This iterates Unicode characters, not UTF-16 code points.
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
  if (isSym(tar)) return macroSym(ctx, tar)
  if (isArr(tar)) return macroList(ctx, tar)
  if (canMacro(tar)) {
    try {return macroNode(ctx, tar.macro(ctx), tar)}
    catch (err) {throw errWithContext(err, tar)}
  }
  return tar
}

async function macroNodeAsync(ctx, tar, src) {
  try {return await macroNode(ctx, (await tar), src)}
  catch (err) {throw errWithContext(err, src)}
}

export function macroSym(ctx, src) {
  try {return macroNode(ctx, macroSymDeref(ctx, reqSym(src).description), src)}
  catch (err) {throw errWithContext(err, src)}
}

function macroSymDeref(ctx, path) {
  path = reqStr(path).split(accessor)

  const key = path[0]
  if (!(isComp(ctx) && key in ctx)) throw errDecl(key)

  let val = ctx
  for (const key of path) val = macroSymGet(ctx, val, key)
  return val
}

// SYNC[sym_get].
function macroSymGet(ctx, src, key) {
  if (isSym(src)) return Symbol.for(src.description + accessor + key)
  if (!isComp(src)) return new KeyRef(src, key)
  if (canMacro(src)) return new KeyRef(macroNode(ctx, src.macro(ctx), src), key)
  if (canCompile(src)) return new KeyRef(src, key)
  if (!(isComp(src) && key in src)) throw errProp(key, src)
  return src[key]
}

// SYNC[sym_get].
function symGetOpt(src, key) {
  if (!isComp(src)) return undefined
  if (canMacro(src)) return undefined
  if (canCompile(src)) return undefined
  if (key in src) return src[key]
  return undefined
}

export class KeyRef {
  constructor(src, key) {
    this.src = src
    this.key = key
  }
  compile() {return compileNode(this.src) + compileAccess(this.key)}
}

export function macroList(ctx, src) {
  try {
    reqArr(src)
    if (!src.length) return src

    let val = src[0]
    if (isSym(val)) val = optGet(ctx, val.description)
    if (isFun(val)) return macroNode(ctx, val.apply(ctx, src.slice(1)), src)

    return macroNodes(ctxToExpression(ctx), src)
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
    case `symbol`: return compileSym(src)
    case `string`: return JSON.stringify(src)
    case `object`: return isNil(src) ? `null` : compileObj(src)
    default: return compileFallback(src)
  }
}

export function compileFallback(src) {
  try {if (canCompile(src)) return reqStr(src.compile())}
  catch (err) {throw errWithContext(err, src)}
  throw TypeError(msgCompile(src))
}

function msgCompile(src) {
  return joinParagraphs(
    `unable to usefully compile ${typeof src} ${show(src)}; hint: arbitrary nodes can compile by implementing the method ".compile"`,
    nodeContext(src),
  )
}

export function compileSym(src) {return compileSymWith(src, compileAccess)}

export function compileSymWith(src, fun) {
  src = reqSym(src).description
  reqFun(fun)
  if (!src) return ``

  const path = src.split(accessor)
  let out = reqStr(path[0])
  if (!out) throw SyntaxError(`unexpected leading accessor in ${show(src)}`)
  reqStrIdentLike(out)

  try {
    let ind = 0
    while (++ind < path.length) out += reqStr(fun(path[ind]))
    return out
  }
  catch (err) {
    reqErr(err).message = `unable to compile ${show(src)} to valid JS: ` + err.message
    throw err
  }
}

export function compileAccess(src) {
  reqNonEmptyKey(src)
  if (/^\d+$/.test(src)) return wrapBrackets(src)
  if (regIdentFull.test(src)) return accessor + src
  return wrapBrackets(JSON.stringify(src))
}

export function compileAccessOpt(src) {
  reqNonEmptyKey(src)
  if (/^\d+$/.test(src)) return accessorOpt + wrapBrackets(src)
  if (regIdentFull.test(src)) return accessorOpt + src
  return accessorOpt + wrapBrackets(JSON.stringify(src))
}

export function reqNonEmptyKey(src) {
  if (reqStr(src)) return src
  throw SyntaxError(`unexpected empty key`)
}

export function compileObj(src) {
  if (isArr(src)) return compileList(src)
  if (isInst(src, RegExp)) return reqStr(src.toString())

  try {if (canCompile(src)) return reqStr(src.compile())}
  catch (err) {throw errWithContext(err, src)}

  if (isDict(src)) return compileDict(src)
  throw TypeError(msgCompile(src))
}

export function compileList(src) {
  try {
    src = compileNodes(src)
    switch (src.length) {
      case 0: return ``
      case 1: return src[0] + `()`
      case 2: return src[0] + wrapParens(src[1])
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
export function compileDict(src) {return wrapParens(compileDictExpr(src))}

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
export function compileBlockOpt(src) {return wrapBracesMultiLineOpt(compileStatements(src))}
export function compileStatements(src) {return compileNodes(src).join(statementSep)}
export function compileExpressions(src) {return compileNodes(src).join(expressionSep)}
export function compileExpressionsInParens(src) {return wrapParens(compileExpressions(src))}
export function compileExpressionsInBraces(src) {return wrapBraces(compileExpressions(src))}
export function joinExpressions(src) {return join(src, expressionSep)}
export function joinStatements(src) {return join(src, statementSep)}
export function wrapBraces(src) {return `{` + reqStr(src) + `}`}
export function wrapBracesOpt(src) {return reqStr(src) && wrapBraces(src)}
export function wrapBracesMultiLine(src) {return reqStr(src) ? `{\n` + reqStr(src) + `\n}` : `{}`}
export function wrapBracesMultiLineOpt(src) {return reqStr(src) && wrapBracesMultiLine(src)}
export function wrapBrackets(src) {return `[` + reqStr(src) + `]`}
export function wrapBracketsOpt(src) {return reqStr(src) && wrapBrackets(src)}
export function wrapParens(src) {return `(` + reqStr(src) + `)`}
export function wrapParensOpt(src) {return reqStr(src) && wrapParens(src)}

export const statementSep = `;\n`
export const expressionSep = `, `
export const dictEntrySep = `: `

export class Raw extends String {compile() {return this.valueOf()}}

export function raw(...src) {return new Raw(join(src, ``))}

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
  In Jisp modules, must end with `.mjs` and be located in the target directory
  configured via `ctx[symTar]`. In other modules, must be equal to the source
  path.
  */
  tarPath = undefined /* : reqCanonicalModulePath */

  /*
  Short for "source dependencies". Must be used for dependencies which are
  imported by the current module's source file (at macro time), but not
  necessarily by its target file (at runtime). The most typical examples
  are imports via the macros `use.mac` and `declare`.
  */
  srcDeps = undefined /* : Set<reqCanonicalModulePath> */

  /*
  Short for "target dependencies". Must be used for dependencies which
  are imported by the current module's target file (at runtime), but not
  necessarily by its source file (at macro time). The most typical example
  is imports via the macro `use`.
  */
  tarDeps = undefined /* : Set<reqCanonicalModulePath> */

  // Short for "target". Stores compiled code.
  tar = undefined /* : string */

  // Short for "primary key".
  pk() {return this.srcPath}

  reqTarPath() {return this.tarPath ?? panic(Error(`missing target path in module ${show(this.srcPath || this)}`))}

  init(ctx) {
    this.tarPath ||= ctxSrcToTar(ctx, this.srcPath)
    return this
  }

  initAsync(ctx) {
    return this.#init ??= this.isJispModule() ? this.initJispModule(ctx) : this.init(ctx)
  }
  #init = undefined

  async initJispModule(ctx) {
    this.init(ctx)
    const src = await ctx[symFs]?.readOpt?.(toMetaUrl(optToUrl(this.tarPath)))
    if (src) this.fromJSON(JSON.parse(src))
    return this
  }

  ready(ctx) {
    return this.#ready ??= this.isJispModule() ? this.readyJispModule(ctx) : this
  }
  #ready = undefined

  async readyJispModule(ctx) {
    await this.initAsync(ctx)
    if (!await this.isUpToDate(ctx)) await this.make(ctx)
    await this.readyDeps(ctx)
    return this
  }

  readyDeps(ctx) {
    const deps = optToArr(this.tarDeps)
    if (!deps?.length) return undefined
    return Promise.all(deps.map(moduleReady, ctx))
  }

  async make(ctx) {
    try {
      const src = await ctxReqFs(ctx).read(reqToUrl(this.srcPath))
      const out = await this.readMacroCompile(ctx, src)
      await this.commit(ctx, out)
    }
    catch (err) {
      reqErr(err).message = joinParagraphs(err.message, this.context())
      await this.commitErr(ctx, err)
      throw err
    }
  }

  get Reader() {return Reader}

  async readMacroCompile(ctx, src) {
    this.srcDeps = undefined
    this.tarDeps = undefined
    src = [...new this.Reader(src, undefined, undefined, this.srcPath)]
    src = await macroNodes(ctxWithModule(ctxWithMixin(ctxReqRoot(ctx)), this), src)
    return joinStatements(compileNodes(src))
  }

  commit(ctx, body) {
    this.tar = body
    if (ctx?.[symTar]) return this.write(ctx, body)
    this.tarPath ||= blobUrl(body)
    return undefined
  }

  async write(ctx, body) {
    const fs = ctxReqFs(ctx)
    const tarUrl = reqToUrl(this.reqTarPath())
    const metaUrl = toMetaUrl(tarUrl)

    await Promise.all([
      fs.write(tarUrl, body),
      fs.write(metaUrl, JSON.stringify(this, null, 2)),
    ])
    this.tarTime = reqFin(await fs.timestamp(tarUrl))
  }

  commitErr(ctx, err) {
    if (!(
      true
      && isSome(err)
      && isComp(ctx)
      && symErrors in ctx
      && symFs in ctx
      && this.tarPath
    )) return undefined

    return ctx[symFs]?.write?.(
      reqToUrl(this.reqTarPath()),
      (`throw Error(` + JSON.stringify((isErr(err) && err.stack) || err) + `)`),
    )?.catch?.(console.error)
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
  async isUpToDate(ctx) {
    if (!this.isJispModule()) return true

    const srcTime = optFin(await this.optSrcTime(ctx))
    if (isNil(srcTime)) return false

    const tarTime = optFin(await this.optTarTime(ctx))
    if (isNil(tarTime) || !(tarTime > srcTime)) return false

    await this.initAsync(ctx)
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
    const times = await Promise.all(deps.map(moduleTimeMax, ctx))

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
  optSrcTime(ctx) {
    if (!this.isJispModule()) return undefined
    return this.srcTime ??= this.srcTimeAsync(ctx)
  }

  async srcTimeAsync(ctx) {
    return this.srcTime = ctx?.[symFs]?.timestamp?.(optToUrl(this.srcPath))
  }

  tarTime = undefined /* : isFin | Promise<isFin> */
  optTarTime(ctx) {return this.tarTime ??= this.tarTimeAsync(ctx)}

  async tarTimeAsync(ctx) {
    const out = await ctx?.[symFs]?.timestampOpt?.(optToUrl(this.tarPath))
    if (this.isJispModule()) return optFin(out)
    return laxFin(out)
  }

  /*
  We currently don't cache this value because it depends on the state of other
  modules, which may be mutated between calls to this function. However, it may
  actually be cachable. TODO reconsider.
  */
  async timeMax(ctx) {
    // May obtain dependency information from metadata file.
    await this.initAsync(ctx)

    return onlyFin(Math.max(...await Promise.all([
      Promise.resolve(this.optSrcTime(ctx)).then(laxFin),
      this.optTarTime(ctx),
      ...laxToArr(this.srcDeps).map(moduleTimeMax, ctx),
      ...laxToArr(this.tarDeps).map(moduleTimeMax, ctx),
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

function moduleReady(key) {return ctxReqModules(this).getOrMake(key).ready(this)}
function moduleTimeMax(key) {return ctxReqModules(this).getOrMake(key).timeMax(this)}

export class Modules extends Map {
  get Module() {return Module}

  set(key, val) {return super.set(key, reqInst(val, this.Module))}

  getOrMake(key) {
    if (this.has(key)) return this.get(key)
    const out = this.make(key)
    super.set(key, out)
    return out
  }

  make(key) {
    const tar = new this.Module()
    tar.srcPath = reqCanonicalModulePath(key)
    return tar
  }
}

export function blobUrl(...src) {
  return URL.createObjectURL(new Blob(src, {type: `application/javascript`}))
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

// For usage examples, see CLI modules such as `cli_deno.mjs`.
export function rootCtx() {
  const ctx = Object.create(null)
  ctx[symRoot] = undefined
  ctx[symModules] = new Modules()
  return ctx
}

/*
These symbolic keys are used for internal data stored in contexts. User-defined
macro code is free to invent its own symbolic keys for its own internal data.
*/
export const symRoot = Symbol.for(`jisp.root`)
export const symModule = Symbol.for(`jisp.module`)
export const symModules = Symbol.for(`jisp.modules`)
export const symFs = Symbol.for(`jisp.fs`)
export const symTar = Symbol.for(`jisp.tar`)
export const symMain = Symbol.for(`jisp.main`)
export const symStatement = Symbol.for(`jisp.statement`)
export const symMixin = Symbol.for(`jisp.mixin`)
export const symExport = Symbol.for(`jisp.export`)
export const symErrors = Symbol.for(`jisp.errors`)

export function ctxRoot(ctx) {
  while (isComp(ctx)) {
    if (hasOwn(ctx, symRoot)) return ctx
    ctx = Object.getPrototypeOf(ctx)
  }
  return undefined
}

export function ctxReqRoot(src) {
  const out = ctxRoot(src)
  if (out) return out
  throw Error(`missing root in context ${show(src)}`)
}

export function ctxIsModule(ctx) {return hasOwn(ctx, symModule)}

export function ctxReqModule(ctx) {
  return ctx[symModule] ?? panic(Error(`missing module in context ${show(ctx)}`))
}

export function ctxReqIsModule(ctx) {
  if (ctxIsModule(ctx)) return ctx
  throw Error(`expected module context`)
}

export function ctxWithModule(ctx, mod) {
  ctx = Object.create(ctx)
  ctx[symModule] = mod
  ctx[symStatement] = undefined
  ctx[symExport] = undefined
  return ctx
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
  const name = ctxReqDeclared(ctx, path)
  return reqGet(ctx[name], strWithoutNs(path, name))
}

export function ctxReqDeclared(ctx, path) {
  const name = strNs(path)
  if (!(isComp(ctx) && name in ctx)) throw errDecl(name)
  return name
}

export function reqGet(src, path) {
  while (reqStr(path)) {
    const name = strNs(path)
    if (!(isComp(src) && name in src)) throw errProp(name, src)
    src = src[name]
    path = strWithoutNs(path, name)
  }
  return src
}

export function optGet(src, path) {
  return reqStr(path).split(accessor).reduce(symGetOpt, src)
}

export function ctxDeclare(ctx, key, val) {
  key = symIdent(key)
  ctxReqNotDeclared(ctx, key)
  ctx[key] = val
}

export function ctxReqNotDeclared(ctx, key) {
  if (hasOwn(ctx, reqStr(key))) throw Error(`redundant declaration of ${show(key)}`)
}

export function ctxRedeclare(ctx, key, val) {ctx[symIdent(key)] = val}

export function ctxReqParentMixin(ctx) {
  const out = Object.getPrototypeOf(ctx)
  if (!hasOwn(out, symMixin)) {
    throw Error(`missing mixin namespace in context ${show(ctx)}`)
  }
  return out
}

export function ctxIsStatement(ctx) {return hasOwn(ctx, symStatement)}

export function ctxReqIsStatement(ctx) {
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

export function importSrcUrl(ctx, src) {
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

export function ctxIsExportable(ctx) {return hasOwn(ctx, symExport)}

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

export const accessor = `.`
export const accessorOpt = `?.`
export const ellipsis = `…`

export function isStrUnqual(val) {return isStr(val) && !!val && !val.includes(accessor)}
export function isStrQual(val) {return isStr(val) && val.includes(accessor)}

export function isSymUnqual(val) {return isSym(val) && isStrUnqual(val.description)}
export function isSymQual(val) {return isSym(val) && isStrQual(val.description)}

export function isStrKey(val) {return isStr(val) && val[0] === accessor}
export function isStrKeyUnqual(val) {return isStr(val) && val.lastIndexOf(accessor) === 0}
export function isStrKeyQual(val) {return isStrKey(val) && val.lastIndexOf(accessor) > 0}

export function isSymKey(val) {return isSym(val) && isStrKey(val.description)}
export function isSymKeyUnqual(val) {return isSym(val) && isStrKeyUnqual(val.description)}
export function isSymKeyQual(val) {return isSym(val) && isStrKeyQual(val.description)}

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
  reqStr(val)
  if (regIdentFull.test(val)) return val
  throw SyntaxError(`${show(val)} does not represent a valid JS identifier`)
}

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
export const keywordNames = new Set([`await`, `break`, `case`, `catch`, `class`, `const`, `continue`, `debugger`, `default`, `delete`, `do`, `else`, `enum`, `export`, `extends`, `finally`, `for`, `function`, `if`, `implements`, `import`, `in`, `instanceof`, `interface`, `let`, `new`, `package`, `private`, `protected`, `public`, `return`, `static`, `switch`, `throw`, `try`, `typeof`, `var`, `void`, `while`, `with`, `yield`])

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

  [use.mac `jisp:prelude.mjs` jp]
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
  if (isNil(val)) return undefined
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

export function ctxSrcToTar(ctx, src) {
  reqStr(src)
  if (!isJispModulePath(src)) return src

  const tar = ctx[symTar]
  if (!tar) return undefined

  return srcToTar(src, tar, ctx[symMain])
}

export function srcToTar(src, tar, main) {
  reqCanonicalModulePath(src)
  reqValidStr(tar)
  optStr(main)

  const srcPath = pathSplit(src)
  const tarName = init(last(srcPath).split(pathExtSep)).join(pathExtSep) + fileExtJs
  const rel = pathSplit(main ? reqValidStr(main) : tar)
  const pre = commonPrefixLen(init(srcPath), rel)
  const ups = rel.length - pre

  return pathJoin(
    tar,
    String(ups || ``),
    ...srcPath.slice(pre, -1),
    tarName,
  )
}

function canMacro(val) {return isComp(val) && `macro` in val && isFun(val.macro)}
function canCompile(val) {return isComp(val) && `compile` in val && isFun(val.compile)}
function errDecl(key) {return Error(`missing declaration of ${show(key)}`)}
function errProp(key, val) {return Error(`missing property ${show(key)} in ${show(val)}`)}

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
export function reqNil(val) {return isNil(val) ? val : panic(errFun(val, isNil))}

export function isSome(val) {return val != null}
export function reqSome(val) {return isSome(val) ? val : panic(errFun(val, isSome))}

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
  if (!con || con === Object) return showDictOpt(val) || `{}`

  const name = getName(con)
  if (isInst(val, Boolean)) return `[${name || `Boolean`}: ${show(val.valueOf())}]`
  if (isInst(val, Number)) return `[${name || `Number`}: ${show(val.valueOf())}]`
  if (isInst(val, BigInt)) return `[${name || `BigInt`}: ${show(val.valueOf())}n]`
  if (isInst(val, String)) return `[${name || `String`}: ${show(val.valueOf())}]`
  if (isInst(val, Symbol)) return `[${name || `Symbol`}: ${show(val.valueOf())}]`

  const dict = showDictOpt(val)
  if (!name) return dict || `{}`
  return `[object ${name}${dict && `: `}${dict}]`
}

function showArr(src) {return wrapBrackets(src.map(show).join(expressionSep))}

function showDictOpt(src) {
  const buf = []
  for (const key of Object.getOwnPropertySymbols(src)) {
    buf.push(showDictEntry(key, src[key]))
  }
  for (const key of Object.getOwnPropertyNames(src)) {
    buf.push(showDictEntry(key, src[key]))
  }
  return wrapBracesOpt(buf.join(expressionSep))
}

function showDictEntry(key, val) {
  return showDictKey(key) + dictEntrySep + show(val)
}

function showDictKey(val) {
  if (isSym(val)) return wrapBrackets(val.toString())
  return regFieldKey.test(reqStr(val)) ? val : show(val)
}

/*
A bit slower than a custom parsing loop written in JS, but significantly shorter
and simpler.
*/
export function strDecode(src) {
  return JSON.parse(`"` + reqStr(src).replace(/\\\\|\\"|"|\n|\r/g, strEscape) + `"`)
}

function strEscape(src) {
  switch (src) {
    case `\\\\`: return `\\\\`
    case `\\"`: return `\\"`
    case `"`: return `\\"`
    case `\n`: return `\\n`
    case `\r`: return `\\r`
    default: return src
  }
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
function init(src) {return reqArr(src).slice(0, -1)}
function last(src) {return reqArr(src)[src.length - 1]}

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
  * Does not reassign inherited properties.
*/
export function patch(tar, src) {
  reqObj(tar)
  for (const key in optObj(src)) if (canPatch(tar, key)) tar[key] = src[key]
  return tar
}

export function canPatch(tar, key) {
  reqObj(tar)
  return hasOwn(tar, key) || !(key in tar)
}

/*
Similar to `patch` but skips ALL pre-existing properties. Intended for cases
such as the `declare` macro, where the goal is to bring the names into scope
without replacing any existing declarations.
*/
export function patchDecl(tar, src) {
  reqObj(tar)
  for (const key in optObj(src)) if (!(key in tar)) tar[key] = src[key]
  return tar
}

export const pathExtSep = `.`
export const pathPosixSep = `/`

export function isStrWithScheme(val) {return isStr(val) && /^\w+:/.test(val)}

export function isStrAbsOrRelExplicit(val) {
  return isStr(val) && (
    val.startsWith(pathPosixSep) || val.startsWith(`./`) || val.startsWith(`../`)
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

/*
More or less the inverse of the `URL` constructor. Should be built-in, but
isn't. Prepending `./` isn't necessary for `URL` roundtrips, but necessary
for relative imports, which is where this function is actually used.
*/
export function optUrlRel(src, tar) {
  src = optToUrl(src)
  tar = optToUrl(tar)
  if (!isUrlSameOrigin(src, tar)) return undefined

  src = src.pathname.split(pathPosixSep)
  tar = tar.pathname.split(pathPosixSep)

  const srcMax = src.length - 1
  const tarMax = tar.length - 1

  // Not equivalent to `commonPrefixLen`.
  let ind = 0
  while (ind < srcMax && ind < tarMax && src[ind] === tar[ind]) ind++

  const ups = srcMax - ind
  const rem = tar.slice(ind).join(pathPosixSep)

  if (rem) {
    if (ups > 0) return `../`.repeat(ups) + rem
    return `./` + rem
  }
  if (ups > 0) return Array(ups).fill(`..`).join(pathPosixSep)
  return `.`
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

// Incomplete: doesn't drop leading `./`.
export function pathClean(src) {
  const len = pathPosixSep.length
  while (reqStr(src).startsWith(pathPosixSep)) src = src.slice(len)
  while (reqStr(src).endsWith(pathPosixSep)) src = src.slice(0, -len)
  return src
}

export function pathJoin(...src) {return pathJoinArr(src)}

export function pathJoinArr(src) {
  let out = ``
  for (src of reqArr(src)) {
    src = reqStr(src)
    if (out && src && !out.endsWith(pathPosixSep) && !src.startsWith(pathPosixSep)) {
      out += pathPosixSep
    }
    out += src
  }
  return out
}

export function pathSplit(src) {return reqStr(src).split(pathPosixSep).filter(Boolean)}
export function pathDir(src) {return init(pathSplit(src)).join(pathPosixSep)}
export function pathDirLike(src) {return pathJoin(pathClean(src), pathPosixSep)}

function commonPrefixLen(one, two) {
  reqArr(one)
  reqArr(two)
  let len = -1
  while (++len < one.length && len < two.length && Object.is(one[len], two[len])) {}
  return len
}
