import * as c from './core.mjs'

/*
Non-exhaustive list of missing keywords and operators:

  Assignments:

    +=   (assign add)
    -=   (assign subtract)
    *=   (assign multiply)
    %=   (assign remainder)
    <<=  (assign left shift)
    >>=  (assign right shift)
    >>>= (assign right shift unsigned)
    &&=  (assign and)
    ||=  (assign or)
    ??=  (assign coalesce)

  Misc:

    function* (and method analog)
    async*
    yield
    yield*
*/

/*
Intended for use with the `declare` macro. User code is free to add new globals
to this dictionary. Usage example:

  [use `jisp:prelude.mjs` *]
  [declare globals]

Partial reference:

  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects
*/
export const globals = Object.create(null)

// Built-in constants. Mixture of keywords, reserved names, and predeclareds.
globals.undefined = undefined
globals.null = undefined
globals.false = undefined
globals.true = undefined
globals.NaN = undefined
globals.Infinity = undefined
globals.this = undefined

// Built-in singletons and functions.
globals.globalThis = undefined
globals.console = undefined
globals.document = undefined // Only in some JS environments.
globals.decodeURI = undefined
globals.decodeURIComponent = undefined
globals.encodeURI = undefined
globals.encodeURIComponent = undefined
globals.setTimeout = undefined
globals.clearTimeout = undefined
globals.setInterval = undefined
globals.clearInterval = undefined

// Built-in classes and namespaces.
globals.Array = undefined
globals.ArrayBuffer = undefined
globals.AsyncFunction = undefined
globals.AsyncGenerator = undefined
globals.AsyncGeneratorFunction = undefined
globals.AsyncIterator = undefined
globals.Atomics = undefined
globals.BigInt = undefined
globals.BigInt64Array = undefined
globals.BigUint64Array = undefined
globals.Boolean = undefined
globals.DataView = undefined
globals.Date = undefined
globals.Error = undefined
globals.FinalizationRegistry = undefined
globals.Float32Array = undefined
globals.Float64Array = undefined
globals.Function = undefined
globals.Generator = undefined
globals.GeneratorFunction = undefined
globals.Int16Array = undefined
globals.Int32Array = undefined
globals.Int8Array = undefined
globals.Intl = undefined
globals.Iterator = undefined
globals.JSON = undefined
globals.Map = undefined
globals.Math = undefined
globals.Number = undefined
globals.Object = undefined
globals.Promise = undefined
globals.Proxy = undefined
globals.Reflect = undefined
globals.RegExp = undefined
globals.Set = undefined
globals.SharedArrayBuffer = undefined
globals.String = undefined
globals.Symbol = undefined
globals.TypeError = undefined
globals.Uint16Array = undefined
globals.Uint32Array = undefined
globals.Uint8Array = undefined
globals.Uint8ClampedArray = undefined
globals.WeakMap = undefined
globals.WeakRef = undefined
globals.WeakSet = undefined

export function comment() {return []}

export const symStar = Symbol.for(`*`)

export function use(src, name) {
  c.ctxReqIsStatement(this)
  c.reqArityBetween(arguments.length, 1, 2)
  if (name === symStar) return useAsMixin.call(this, src)
  if (c.isSome(name)) return useAsNamed.apply(this, arguments)
  return useAsAnon.apply(this, arguments)
}

async function useAsAnon(src) {
  c.reqArity(arguments.length, 1)
  await import(await ctxSrcDepPath(this, src))
  return []
}

async function useAsNamed(src, name) {
  c.reqArity(arguments.length, 2)
  c.ctxDeclare(this, name, await import(await ctxSrcDepPath(this, src)))
  return []
}

async function useAsMixin(src) {
  c.reqArity(arguments.length, 1)
  c.patch(c.ctxReqParentMixin(this), await import(await ctxSrcDepPath(this, src)))
  return []
}

function ctxSrcDepPath(ctx, src) {
  if (c.isStrRelImplicit(src)) return src
  return ctxSrcDepPathFromUrl(ctx, c.ctxImportSrcUrl(ctx, src).href)
}

function ctxTarDepPath(ctx, src) {
  if (c.isStrRelImplicit(src)) return src
  return ctxTarDepPathFromUrl(ctx, c.ctxImportSrcUrl(ctx, src).href)
}

async function ctxSrcDepPathFromUrl(ctx, src) {
  ctx[c.symModule]?.addSrcDep(src)
  if (!c.isJispPath(src)) return src
  return c.reqValidStr((await c.ctxReqModules(ctx).getReady(src)).tarPath)
}

function ctxTarDepPathFromUrl(ctx, src) {
  const own = ctx[c.symModule]
  own?.addTarDep(src)

  const tar = (
    c.isJispPath(src)
    ? c.reqValidStr(c.ctxReqModules(ctx).getOrMake(src).tarPath)
    : src
  )
  return c.optUrlRel(own?.tarPath, tar) ?? tar
}

export {$import as import}

export function $import() {
  c.reqArityBetween(arguments.length, 1, 2)
  if (c.ctxIsStatement(this)) return importAsStatement.apply(this, arguments)
  return importAsExpression.apply(this, arguments)
}

$import.meta = Symbol.for(`import.meta`)

function importAsExpression(src) {
  c.reqArity(arguments.length, 1)
  if (c.isStr(src)) {
    return c.raw(`import(`, c.compileNode(ctxTarDepPath(this, src)), `)`)
  }
  return c.raw(`import(`, c.compileNode(c.macroNode(this, src)), `)`)
}

function importAsStatement(src, name) {
  c.ctxReqIsModule(this)
  c.ctxReqIsStatement(this)
  c.reqArityBetween(arguments.length, 1, 2)

  if (name === symStar) return importAsStatementAsMixin.call(this, src)
  if (c.isSome(name)) return importAsStatementAsNamed.apply(this, arguments)
  return importAsStatementAsAnon.call(this, src)
}

function importAsStatementAsAnon(src) {
  c.reqArity(arguments.length, 1)
  return c.raw(`import `, c.compileNode(ctxTarDepPath(this, src)))
}

function importAsStatementAsNamed(src, name) {
  c.reqArity(arguments.length, 2)
  c.ctxDeclare(this, name)
  return c.raw(`import * as `, name.description, ` from `, c.compileNode(ctxTarDepPath(this, src)))
}

async function importAsStatementAsMixin(src) {
  c.reqArity(arguments.length, 1)

  let tar = src
  let rel = src
  if (!c.isStrRelImplicit(src)) {
    src = c.ctxImportSrcUrl(this, src).href
    tar = await ctxSrcDepPathFromUrl(this, src)
    rel = ctxTarDepPathFromUrl(this, src)
  }

  const mix = c.ctxReqParentMixin(this)
  const out = new ImportAsMixin(rel)
  for (const key of Object.keys(await import(tar))) {
    if (c.canPatch(mix, key)) mix[key] = new ImportRef(key, out)
  }
  return out
}

class ImportAsMixin extends Set {
  constructor(src) {super().src = src}

  compile() {
    const names = this.size ? c.joinExpressions([...this]) : ``
    const src = c.compileNode(this.src)
    if (names) return `import ${c.wrapBraces(names)} from ${src}`
    return `import ${src}`
  }
}

class ImportRef extends c.Raw {
  constructor(key, tar) {super(key).tar = tar}
  macro() {return this.tar.add(this.valueOf()), this}
}

export function declare(src) {
  c.ctxReqIsStatement(this)
  c.reqArity(arguments.length, 1)
  if (c.isSym(src)) return declareFromSym(this, src.description)
  if (c.isStr(src)) return declareFromStr(this, src)
  throw TypeError(`expected either symbol or string, got ${c.show(src)}`)
}

function declareFromSym(ctx, src) {
  const val = c.ctxReqGet(ctx, src)
  if (c.isDict(val)) {
    c.patchDecl(c.ctxReqParentMixin(ctx), val)
    return []
  }
  throw TypeError(`expected to resolve ${c.show(src)} to plain object, got ${c.show(val)}`)
}

async function declareFromStr(ctx, src) {
  c.patchDecl(
    c.ctxReqParentMixin(ctx),
    await import(await ctxSrcDepPath(ctx, src)),
  )
  return []
}

export {$export as export}

export function $export(name, alias) {
  c.ctxReqIsModule(this)
  c.ctxReqIsStatement(this)
  c.reqArityBetween(arguments.length, 1, 2)

  name = c.symIdent(c.macroNode(this, name))
  if (arguments.length <= 1) return c.raw(`export {`, name, `}`)
  return c.raw(`export {`, name, ` as `, exportAlias(alias), `}`)
}

function exportAlias(src) {
  if (c.isStr(src)) return c.compileNode(src)
  if (c.isSymUnqual(src)) return identOrStr(src.description)
  throw SyntaxError(`export alias must be unqualified identifier or string, got ${c.show(src)}`)
}

function identOrStr(val) {
  c.reqStr(val)
  return c.regIdentFull.test(val) ? val : c.compileNode(val)
}

export {$const as const}

export function $const(tar, src) {
  c.ctxReqIsStatement(this)
  c.reqArity(arguments.length, 2)

  src = c.macroNode(Object.create(this), src)

  return c.raw(c.joinSpaced(
    c.ctxCompileExport(this),
    `const`,
    param.call(this, tar),
    `=`,
    (c.compileNode(src) || `undefined`),
  ))
}

export {$let as let}

export function $let(tar, src) {
  c.ctxReqIsStatement(this)
  c.reqArityBetween(arguments.length, 1, 2)

  if (c.isSym(tar) && c.hasOwn(this, tar.description)) {
    return assign.apply(this, arguments)
  }

  src = arguments.length > 1 ? c.compileNode(c.macroNode(Object.create(this), src)) : ``

  const pre = c.joinSpaced(
    c.ctxCompileExport(this),
    `let`,
    param.call(this, tar),
  )

  if (src) return c.raw(c.joinSpaced(pre, `=`, src))
  return c.raw(pre)
}

export {$if as if}

export function $if() {
  if (c.ctxIsStatement(this)) return ifAsStatement.apply(this, arguments)
  return ifAsExpression.apply(this, arguments)
}

export function ifAsStatement(predicate, branchThen, branchElse) {
  c.ctxReqIsStatement(this)
  c.reqArityMax(arguments.length, 3)
  if (!arguments.length) return []

  const ctx = Object.create(this)
  predicate = c.macroNode(Object.create(this), predicate)
  ctx[c.symStatement] = undefined
  branchThen = c.macroNode(ctx, branchThen)
  branchElse = c.macroNode(ctx, branchElse)

  predicate = c.compileNode(predicate)
  branchThen = c.isSome(branchThen) ? c.compileNode(branchThen) : ``
  branchElse = c.isSome(branchElse) ? c.compileNode(branchElse) : ``

  if (!predicate && !branchThen && !branchElse) return []

  return c.raw(c.joinLines(
    c.joinSpaced(
      `if`,
      c.wrapParens(predicate || `undefined`),
      (branchThen || `{}`),
    ),
    (branchElse && (`else ` + branchElse)),
  ))
}

export function ifAsExpression(predicate, branchThen, branchElse) {
  c.reqArityMax(arguments.length, 3)
  if (!arguments.length) return undefined

  predicate = c.macroNode(this, predicate)
  if (arguments.length === 1) return predicate

  branchThen = c.macroNode(this, branchThen)
  branchElse = c.macroNode(this, branchElse)

  return c.raw(c.wrapParens(c.joinSpaced(
    (c.compileNode(predicate) || `undefined`),
    `?`,
    (c.compileNode(branchThen) || `undefined`),
    `:`,
    (c.compileNode(branchElse) || `undefined`),
  )))
}

export function when(cond, ...body) {
  switch (arguments.length) {
    case 0: return ctxVoid(this)
    case 1: return [$void, cond]
    default: return [$if, cond, [$do, ...body]]
  }
}

export {$do as do}

export function $do() {
  if (c.ctxIsStatement(this)) return doAsStatement.apply(this, arguments)
  return doAsExpression.apply(this, arguments)
}

export function doAsStatement(...src) {
  src = c.macroNodes(c.ctxWithStatement(c.ctxReqIsStatement(this)), src)
  src = c.compileNodes(src).join(c.statementSep)
  return src ? c.raw(c.wrapBracesMultiLine(src)) : []
}

export function doAsExpression(...src) {
  src = c.compileNodes(c.macroNodes(c.ctxToExpression(this), src))
  switch (src.length) {
    case 0: return undefined
    case 1: return c.raw(src[0])
    default: return c.raw(c.wrapParens(src.join(c.expressionSep)))
  }
}

export {$void as void}

export function $void() {
  let out = doAsExpression.apply(this, arguments)
  if (!out) return ctxVoid(this)
  out = `void ` + out
  return c.raw(c.ctxIsStatement(this) ? out : c.wrapParens(out))
}

$void.macro = ctxVoid

export function ctxVoid(ctx) {return c.ctxIsStatement(ctx) ? [] : undefined}

export function ret(...src) {
  c.ctxReqIsStatement(this)
  switch (src.length) {
    case 0: return c.raw(`return`)
    case 1: return c.raw(retStatements(this, src))
    default: return c.raw(c.wrapBracesMultiLine(retStatements(c.ctxWithStatement(this), src)))
  }
}

ret.macro = selfStatement
ret.compile = () => `return`

export function retStatements(ctx, src) {return retStatementsOpt(ctx, src) || `return`}

export function retStatementsOpt(ctx, src) {
  return c.joinStatements(c.reqArr(src).map(retStatement, ctx))
}

export function retStatement(val, ind, src) {
  if (ind < src.length - 1) return c.compileNode(c.macroNode(this, val))
  return c.joinSpaced(`return`, c.compileNode(c.macroNode(Object.create(this), val)))
}

export function selfStatement(ctx) {return c.ctxReqIsStatement(ctx), this}

export function guard(cond, ...body) {
  if (body.length) return [$if, cond, [ret, ...body]]
  return [$if, cond, ret]
}

export function func() {
  return c.raw(c.joinSpaced(
    c.ctxCompileExport(this),
    `function`,
    funcBase.apply(this, arguments),
  ))
}

func.async = funcAsync

export function funcAsync() {
  return c.raw(c.joinSpaced(
    c.ctxCompileExport(this),
    `async function`,
    funcBase.apply(this, arguments),
  ))
}

export const funcMixin = Object.create(null)
funcMixin.ret = ret
funcMixin.guard = guard
funcMixin.arguments = undefined
funcMixin.this = undefined

export const symRest = Symbol.for(`&`)

// For internal use.
export function funcBase(name, param, ...body) {
  c.reqArityMin(arguments.length, 1)
  const ctx = ctxWithFuncDecl(this, name, funcMixin)
  ctx[c.symStatement] = undefined
  return funcCompile(name, funcParam.call(ctx, param), retStatementsOpt(ctx, body))
}

export function funcParam(src) {
  if (c.isNil(src)) return `()`
  if (c.isSym(src)) return c.ctxDeclare(this, src), c.wrapParens(`...` + src.description)
  if (c.isArr(src)) return c.wrapParens(paramDeconstruction.call(this, src))
  throw SyntaxError(`function parameters must be either nil, a symbol, or a list deconstruction, got ${c.show(src)}`)
}

export function param(src) {
  if (c.isSym(src)) return c.ctxDeclare(this, src), c.reqStr(src.description)
  if (c.isArr(src)) return c.wrapBrackets(paramDeconstruction.call(this, src))
  throw SyntaxError(`in a list deconstruction, every element must be a symbol or a list, got ${c.show(src)}`)
}

export function paramDeconstruction(src) {
  c.reqArr(src)
  let out = ``
  let ind = -1

  while (++ind < src.length) {
    const val = src[ind]
    if (out) out += c.expressionSep
    if (val === symRest) return out + restParam(this, src, ind + 1)
    out += param.call(this, val)
  }
  return out
}

function restParam(ctx, src, ind) {
  const more = c.reqArr(src).length - c.reqNat(ind)
  if (more !== 1) {
    throw SyntaxError(`rest symbol ${c.show(symRest)} must be followed by exactly one node, found ${more} nodes`)
  }
  src = src[ind]
  c.ctxDeclare(ctx, src)
  return `...` + src.description
}

function funcCompile(name, param, body) {
  return c.joinSpaced(c.compileNode(name), param, c.wrapBracesMultiLine(body))
}

/*
Should be used for function and class declarations, where statement and
expression mode have slightly different scoping rules.
*/
function ctxWithFuncDecl(ctx, name, src) {
  const statement = c.ctxIsStatement(ctx)
  if (statement) c.ctxDeclare(ctx, name)

  ctx = c.patch(c.ctxWithMixin(ctx), src)
  if (!statement) c.ctxRedeclare(ctx, name)

  return Object.create(ctx)
}

export function fn() {
  return c.raw(c.wrapParens(fnBase.apply(this, arguments)))
}

fn.async = fnAsync

export function fnAsync() {
  return c.raw(c.wrapParens(`async ` + fnBase.apply(this, arguments)))
}

const fnMixin = Object.create(null)
fnMixin.ret = ret
fnMixin.guard = guard

// For internal use.
export function fnBase() {
  switch (arguments.length) {
    case 0: return `() => {}`
    case 1: return fnExpr.apply(this, arguments)
    default: return fnBlock.apply(this, arguments)
  }
}

export function fnExpr(src) {
  const han = new FnOrdHan()
  src = c.macroNode(new Proxy(Object.create(this), han), src)
  return compileFn(han.arity, c.compileNode(src))
}

export function fnBlock(...src) {
  const han = new FnOrdHan()
  const ctx = new Proxy(c.ctxWithStatement(c.patch(c.ctxWithMixin(this), fnMixin)), han)
  src = c.wrapBracesMultiLine(retStatementsOpt(ctx, src))
  return compileFn(han.arity, src)
}

function compileFn(arity, body) {
  c.reqInt(arity)
  c.reqStr(body)

  let out = `(`
  let ind = -1
  while (++ind < arity) out += (ind > 0 ? c.expressionSep : ``) + `$` + ind
  out += `) => `
  out += body || `{}`
  return out
}

class FnOrdHan {
  arity = 0

  has(tar, key) {return isOrdKey(key) || key in tar}

  get(tar, key) {
    if (!isOrdKey(key)) return tar[key]
    this.arity = Math.max(this.arity, 1 + (key.slice(1) | 0))
    return undefined
  }
}

function isOrdKey(val) {return c.isStr(val) && ordKeyReg.test(val)}

const ordKeyReg = /^[$]\d+$/

export {$class as class}

export function $class(name, ...rest) {
  c.reqArityMin(arguments.length, 1)

  const ctx = ctxWithFuncDecl(this, name, classMixin)
  ctx[symClass] = undefined
  rest = c.reqArr(c.macroNodes(ctx, rest))

  return c.raw(c.joinSpaced(
    c.ctxCompileExport(this),
    `class`,
    c.compileNode(name),
    compileClassExtend.apply(ctx, ctx[symClassExtend]),
    c.compileBlock(rest),
  ))
}

export const classMixin = Object.create(null)
classMixin.static = $static
classMixin.extend = extend
classMixin.field = field
classMixin.meth = meth
classMixin.super = undefined

export const symClass = Symbol.for(`jisp.class`)
export const symClassExtend = Symbol.for(`jisp.class.extend`)

export function ctxIsClass(ctx) {return c.hasOwn(ctx, symClass)}

export function ctxReqClass(ctx) {
  if (ctxIsClass(ctx)) return ctx
  throw Error(`unexpected non-class context ${c.show(ctx)}`)
}

function compileClassExtend(...src) {
  const out = src.reduce(appendCompileClassExtend, ``, this)
  return out && (`extends ` + out)
}

function appendCompileClassExtend(prev, next) {
  return c.compileNode(next) + (prev && c.wrapParens(prev))
}

export function extend(...src) {
  ctxReqClass(this)[symClassExtend] = c.reqArr(c.macroNodes(this, src))
  return []
}

/*
Known limitation: this doesn't support arbitrary expressions in the name
position. JS has some valid use cases such as `[Symbol.iterator]`.
*/
export function meth(name, param, ...body) {
  c.reqArityMin(arguments.length, 1)
  reqFieldName(name)
  const ctx = Object.create(c.patch(c.ctxWithMixin(this), methMixin))
  ctx[c.symStatement] = undefined
  return c.raw(funcCompile(name, funcParam.call(ctx, param), retStatementsOpt(ctx, body)))
}

export const methMixin = Object.create(funcMixin)
methMixin.super = undefined

/*
Known limitation: this doesn't support arbitrary expressions in the name
position. JS has some valid use cases such as `[Symbol.toStringTag]`.
*/
export function field(tar, src) {
  c.reqArityBetween(arguments.length, 1, 2)
  reqFieldName(tar)
  src = c.macroNode(c.ctxToExpression(this), src)
  if (arguments.length <= 1) return c.raw(c.compileNode(tar))
  return c.raw(c.joinSpaced(c.compileNode(tar), `=`, c.compileNode(src)))
}

/*
TODO: consider how to support arbitrary expressions as field names,
which should compile to the square bracket syntax.
*/
export function reqFieldName(val) {
  if (c.isSym(val)) {
    c.reqStrIdentLike(val.description)
    return val
  }
  if (c.isStr(val)) return val
  throw Error(`field name must be a symbol representing an identifier, or a string; got ${c.show(val)}`)
}

export function $static(...src) {
  src = c.compileStatements(c.macroNodes(c.ctxWithStatement(ctxReqClass(this)), src))
  if (!src) return []
  return c.raw(`static `, c.wrapBracesMultiLine(src))
}

$static.meth = classStaticMeth
$static.field = classStaticField

export function classStaticMeth() {
  return c.raw(`static `, meth.apply(this, arguments).compile())
}

export function classStaticField() {
  return c.raw(`static `, field.apply(this, arguments).compile())
}

export {$throw as throw}

export function $throw(val) {
  c.reqArity(arguments.length, 1)

  val = c.compileNode(c.macroNode(c.ctxToExpression(this), val))
  if (!val) throw errEmpty()

  if (c.ctxIsStatement(this)) return c.raw(`throw `, val)
  return c.raw(`(err => {throw err})(`, val, `)`)
}

function errEmpty() {return SyntaxError(`unexpected empty input`)}

export {$new as new}

export function $new(...src) {
  c.reqArityMin(arguments.length, 1)

  const head = src[0]
  if (c.isFun(head)) return new head(...src.slice(1))

  if (c.isSym(head)) {
    const val = c.optGet(this, head.description)
    if (c.isFun(val)) return new val(...src.slice(1))
  }

  src = c.compileList(c.macroNodes(c.ctxToExpression(this), src))
  if (src) return c.raw(`new `, src)
  throw errEmpty()
}

$new.target = Symbol.for(`new.target`)

export {$typeof as typeof}

export function $typeof(val) {
  c.reqArity(arguments.length, 1)
  return unaryPrefix(this, `typeof`, val)
}

export function oftype(typ, val) {
  c.reqArity(arguments.length, 2)
  if (!c.isStr(typ)) {
    throw SyntaxError(`the first input must be a hardcoded string, got ${c.show(typ)}`)
  }
  val = c.compileNode(c.macroNode(c.ctxToExpression(this), val))
  if (!val) return undefined
  return c.raw(c.wrapParens(c.compileNode(typ) + ` === typeof ` + val))
}

function macroCompileExprs(ctx, src) {
  return c.compileNodes(c.macroNodes(c.ctxToExpression(ctx), src))
}

export {$await as await}

export function $await(val) {
  c.reqArity(arguments.length, 1)
  return unaryPrefix(this, `await`, val)
}

function unaryPrefix(ctx, pre, val) {
  c.reqStr(pre)
  return c.raw(c.wrapParens(c.joinSpaced(
    pre,
    c.compileNode(c.macroNode(c.ctxToExpression(ctx), val)) || `undefined`,
  )))
}

function binaryInfix(ctx, one, inf, two) {
  ctx = c.ctxToExpression(ctx)
  one = c.macroNode(ctx, one)
  two = c.macroNode(ctx, two)

  return c.raw(c.wrapParens(c.joinSpaced(
    c.compileNode(one) || `undefined`,
    inf,
    c.compileNode(two) || `undefined`,
  )))
}

export function instof(val, cls) {
  c.reqArity(arguments.length, 2)
  return binaryInfix(this, val, `instanceof`, cls)
}

instof.compile = () => `((a, b) => a instanceof b)`

export {$in as in}

// TODO consider inverting argument order for consistency with `get` and `set`.
export function $in(key, val) {
  c.reqArity(arguments.length, 2)
  return binaryInfix(this, key, `in`, val)
}

$in.compile = () => `((a, b) => a in b)`

/*
Only valid if the declaration of `Object` in the current scope refers to the
global `Object`. TODO reconsider.
*/
export const is = Symbol.for(`Object.is`)

/*
This is the only half-decent use of the `==` operator. We provide this
as a special case to avoid providing `==` which is too easy to misuse.
*/
export function isNil(val) {
  c.reqArity(arguments.length, 1)
  return c.isNil(val) || c.raw(
    `(null == `,
    (c.compileNode(c.macroNode(c.ctxToExpression(this), val)) || `undefined`),
    `)`,
  )
}

isNil.compile = () => `(a => a == null)`

/*
This is the only half-decent use of the `!=` operator. We provide this
as a special case to avoid providing `!=` which is too easy to misuse.
*/
export function isSome(val) {
  c.reqArity(arguments.length, 1)
  return c.isSome(val) && c.raw(
    `(null != `,
    (c.compileNode(c.macroNode(c.ctxToExpression(this), val)) || `undefined`),
    `)`,
  )
}

isSome.compile = () => `(a => a != null)`

export function list(...src) {
  return c.raw(c.wrapBrackets(macroCompileExprs(this, src).join(c.expressionSep)))
}

list.compile = () => `((...a) => a)`

export function dict(...src) {
  const sta = c.ctxIsStatement(this)
  const len = src.length
  if (!len) return c.raw(sta ? `({})` : `{}`)
  if (len % 2) throw SyntaxError(`expected an even number of inputs, got ${len} inputs`)

  const ctx = sta ? Object.create(this) : this
  const buf = []
  let ind = 0
  while (ind < len) buf.push(dictEntry(ctx, src[ind++], src[ind++]))
  const out = c.wrapBraces(buf.join(c.expressionSep))
  return c.raw(sta ? c.wrapParens(out) : out)
}

function dictEntry(ctx, key, val) {
  return (
    dictKey(key)
    + `: `
    + (c.compileNode(c.macroNode(ctx, val)) || `undefined`)
  )
}

function dictKey(val) {
  if (c.isFin(val)) return `"` + val + `"`
  if (c.isBigInt(val)) return `"` + val + `"`
  if (c.isStr(val)) return c.compileNode(val)
  if (c.isSym(val)) return identOrStr(val.description)
  throw SyntaxError(`dict keys must be identifiers, strings, or numbers; got ${c.show(val)}`)
}

export function get(...src) {
  src = macroCompileExprs(this, src).map(bracketedOpt).join(`?.`)
  return src ? c.raw(src) : undefined
}

function bracketedOpt(val, ind) {return ind ? c.wrapBrackets(val) : val}

export function set(src, key, val) {
  c.reqArity(arguments.length, 3)

  const sta = c.ctxIsStatement(this)
  const ctx = sta ? Object.create(this) : this
  src = c.macroNode(ctx, src)
  key = c.macroNode(ctx, key)
  val = c.macroNode(ctx, val)

  src = c.compileNode(src)
  key = c.compileNode(key)
  val = c.compileNode(val) || `undefined`
  if (!key) throw SyntaxError(`unexpected empty key`)

  const out = src + c.wrapBrackets(key) + ` = ` + val
  return c.raw(sta ? out : c.wrapParens(out))
}

/*
TODO consider supporting deconstructions. In JS, the LHS of assignment
expressions supports both list and dict deconstructions.
*/
export function assign(one, two) {
  c.reqArity(arguments.length, 2)

  const sta = c.ctxIsStatement(this)
  one = c.reqSym(c.macroNode(this, one))
  two = c.macroNode((sta ? Object.create(this) : this), two)

  const out = c.joinSpaced(c.compileNode(one), `=`, (c.compileNode(two) || `undefined`))
  return c.raw(sta ? out : c.wrapParens(out))
}

export function and(...src) {
  src = macroCompileExprs(this, src)
  switch (src.length) {
    case 0: return undefined
    case 1: return c.raw(src[0])
    default: return c.raw(c.wrapParens(src.join(` && `)))
  }
}

and.compile = () => `((a, b) => a && b)`

export function or(...src) {
  src = macroCompileExprs(this, src)
  switch (src.length) {
    case 0: return undefined
    case 1: return c.raw(src[0])
    default: return c.raw(c.wrapParens(src.join(` || `)))
  }
}

or.compile = () => `((a, b) => a || b)`

export function coalesce(...src) {
  src = macroCompileExprs(this, src)
  switch (src.length) {
    case 0: return undefined
    case 1: return c.raw(src[0])
    default: return c.raw(c.wrapParens(src.join(` ?? `)))
  }
}

coalesce.compile = () => `((a, b) => a ?? b)`

export function not(val) {
  c.reqArity(arguments.length, 1)
  return unaryPrefix(this, `!`, val)
}

not.compile = () => `(a => !a)`

export function yes(val) {
  c.reqArity(arguments.length, 1)
  return unaryPrefix(this, `!!`, val)
}

yes.compile = () => `(a => !!a)`

export function bitNot(val) {
  c.reqArity(arguments.length, 1)
  return unaryPrefix(this, `~`, val)
}

bitNot.compile = () => `(a => ~a)`

export function eq(one, two) {
  c.reqArity(arguments.length, 2)
  return binaryInfix(this, one, `===`, two)
}

eq.compile = () => `((a, b) => a === b)`

export function neq(one, two) {
  c.reqArity(arguments.length, 2)
  return binaryInfix(this, one, `!==`, two)
}

neq.compile = () => `((a, b) => a !== b)`

export function gt(one, two) {
  c.reqArity(arguments.length, 2)
  return binaryInfix(this, one, `>`, two)
}

gt.compile = () => `((a, b) => a > b)`

export function lt(one, two) {
  c.reqArity(arguments.length, 2)
  return binaryInfix(this, one, `<`, two)
}

lt.compile = () => `((a, b) => a < b)`

export function gte(one, two) {
  c.reqArity(arguments.length, 2)
  return binaryInfix(this, one, `>=`, two)
}

gte.compile = () => `((a, b) => a >= b)`

export function lte(one, two) {
  c.reqArity(arguments.length, 2)
  return binaryInfix(this, one, `<=`, two)
}

lte.compile = () => `((a, b) => a <= b)`

// Fallback value is nil due to type ambiguity.
export function add(...src) {
  src = macroCompileExprs(this, src)
  switch (src.length) {
    case 0: return undefined
    case 1: return c.raw(c.wrapParens(`+ ` + src[0]))
    default: return c.raw(c.wrapParens(src.join(` + `)))
  }
}

add.compile = () => `((a, b) => a + b)`

export function subtract(...src) {
  src = macroCompileExprs(this, src)
  switch (src.length) {
    case 0: return undefined
    case 1: return c.raw(c.wrapParens(`- ` + src[0]))
    default: return c.raw(c.wrapParens(src.join(` - `)))
  }
}

subtract.compile = () => `((a, b) => a - b)`

export function divide(...src) {
  src = macroCompileExprs(this, src)
  switch (src.length) {
    case 0: return undefined
    case 1: return c.raw(src[0])
    default: return c.raw(c.wrapParens(src.join(` / `)))
  }
}

divide.compile = () => `((a, b) => a / b)`

export function multiply(...src) {
  src = macroCompileExprs(this, src)
  switch (src.length) {
    case 0: return undefined
    case 1: return c.raw(c.wrapParens(`1 * ` + src[0]))
    default: return c.raw(c.wrapParens(src.join(` * `)))
  }
}

multiply.compile = () => `((a, b) => a * b)`

export function exponentiate(...src) {
  src = macroCompileExprs(this, src)
  switch (src.length) {
    case 0: return undefined
    case 1: return c.raw(c.wrapParens(src[0] + ` ** 1`))
    default: return c.raw(c.wrapParens(src.join(` ** `)))
  }
}

exponentiate.compile = () => `((a, b) => a ** b)`

export function remainder(...src) {
  src = macroCompileExprs(this, src)
  switch (src.length) {
    case 0: return undefined
    case 1: return c.raw(src[0])
    default: return c.raw(c.wrapParens(src.join(` % `)))
  }
}

remainder.compile = () => `((a, b) => a % b)`

export function bitAnd(...src) {
  src = macroCompileExprs(this, src)
  switch (src.length) {
    case 0: return 0
    case 1: return c.raw(c.wrapParens(src[0] + ` & 0`))
    default: return c.raw(c.wrapParens(src.join(` & `)))
  }
}

bitAnd.compile = () => `((a, b) => a & b)`

export function bitOr(...src) {
  src = macroCompileExprs(this, src)
  switch (src.length) {
    case 0: return 0
    case 1: return c.raw(c.wrapParens(src[0] + ` | 0`))
    default: return c.raw(c.wrapParens(src.join(` | `)))
  }
}

bitOr.compile = () => `((a, b) => a | b)`

export function bitXor(...src) {
  src = macroCompileExprs(this, src)
  switch (src.length) {
    case 0: return 0
    case 1: return c.raw(c.wrapParens(src[0] + ` ^ 0`))
    default: return c.raw(c.wrapParens(src.join(` ^ `)))
  }
}

bitXor.compile = () => `((a, b) => a ^ b)`

export function bitShiftLeft(...src) {
  src = macroCompileExprs(this, src)
  switch (src.length) {
    case 0: return 0
    case 1: return c.raw(c.wrapParens(src[0] + ` << 0`))
    default: return c.raw(c.wrapParens(src.join(` << `)))
  }
}

bitShiftLeft.compile = () => `((a, b) => a << b)`

export function bitShiftRight(...src) {
  src = macroCompileExprs(this, src)
  switch (src.length) {
    case 0: return 0
    case 1: return c.raw(c.wrapParens(src[0] + ` >> 0`))
    default: return c.raw(c.wrapParens(src.join(` >> `)))
  }
}

bitShiftRight.compile = () => `((a, b) => a >> b)`

export function bitShiftRightUnsigned(...src) {
  src = macroCompileExprs(this, src)
  switch (src.length) {
    case 0: return 0
    case 1: return c.raw(c.wrapParens(src[0] + ` >>> 0`))
    default: return c.raw(c.wrapParens(src.join(` >>> `)))
  }
}

bitShiftRightUnsigned.compile = () => `((a, b) => a >>> b)`

export function assignIncrement(val) {
  c.reqArity(arguments.length, 1)
  return unaryPrefix(this, `++`, val)
}

export function assignDecrement(val) {
  c.reqArity(arguments.length, 1)
  return unaryPrefix(this, `--`, val)
}

/*
Note: storing a regexp in the AST works fine because when compiling nodes, we
convert regexps into their JS representations.
*/
export function regexp(src, flags) {
  c.reqArityBetween(arguments.length, 1, 2)
  return new RegExp(c.reqStr(src), c.optStr(flags))
}

export {$while as while}

export function $while(cond, ...body) {
  c.ctxReqIsStatement(this)
  c.reqArityMin(arguments.length, 1)

  return c.raw(c.joinSpaced(
    `while`,
    c.wrapParens(c.compileNode(c.macroNode(Object.create(this), cond)) || `undefined`),
    body.length
    ? c.compileBlock(c.macroNodes(c.ctxWithStatement(c.patch(c.ctxWithMixin(this), loopMixin)), body))
    : `{}`
  ))
}

export const loopMixin = Object.create(null)
loopMixin.break = $break
loopMixin.continue = $continue

export {$break as break}

export function $break() {
  throw SyntaxError(`"break" must be mentioned, not called; loop labels are not currently supported`)
}

$break.macro = selfStatement
$break.compile = () => `break`

export {$continue as continue}

export function $continue() {
  throw SyntaxError(`"continue" must be mentioned, not called; loop labels are not currently supported`)
}

$continue.macro = selfStatement
$continue.compile = () => `continue`

export function pipe(name, ...exprs) {
  c.reqSymUnqual(name)
  if (!exprs.length) return name
  return [$do, ...exprs.map(assignWith, name), name]
}

function assignWith(val) {return [assign, this, val]}
