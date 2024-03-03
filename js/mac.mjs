import * as c from './core.mjs'

/*
Non-exhaustive list of missing keywords and operators:

  function* (and method analog)
  async*
  yield
  yield*
  for .. in
  do .. while
  switch
  setter functions
*/

/*
Intended for use with the `declare` macro. User code is free to add new globals
to this dictionary. Usage example:

  [use.mac `jisp:prelude.mjs` *]
  [declare globals]

Partial reference:

  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects
*/
export const globals = Object.create(null)

// Built-in constants. Mixture of keywords, reserved names, and predeclareds.
globals.undefined = Symbol.for(`undefined`)
globals.null = Symbol.for(`null`)
globals.false = Symbol.for(`false`)
globals.true = Symbol.for(`true`)
globals.NaN = Symbol.for(`NaN`)
globals.Infinity = Symbol.for(`Infinity`)
globals.this = Symbol.for(`this`)

// Built-in singletons and functions.
globals.globalThis = Symbol.for(`globalThis`)
globals.console = Symbol.for(`console`)
globals.decodeURI = Symbol.for(`decodeURI`)
globals.decodeURIComponent = Symbol.for(`decodeURIComponent`)
globals.encodeURI = Symbol.for(`encodeURI`)
globals.encodeURIComponent = Symbol.for(`encodeURIComponent`)
globals.setTimeout = Symbol.for(`setTimeout`)
globals.clearTimeout = Symbol.for(`clearTimeout`)
globals.setInterval = Symbol.for(`setInterval`)
globals.clearInterval = Symbol.for(`clearInterval`)
globals.fetch = Symbol.for(`fetch`)

// Built-in classes and namespaces.
globals.AbortController = Symbol.for(`AbortController`)
globals.AbortSignal = Symbol.for(`AbortSignal`)
globals.Array = Symbol.for(`Array`)
globals.ArrayBuffer = Symbol.for(`ArrayBuffer`)
globals.AsyncFunction = Symbol.for(`AsyncFunction`)
globals.AsyncGenerator = Symbol.for(`AsyncGenerator`)
globals.AsyncGeneratorFunction = Symbol.for(`AsyncGeneratorFunction`)
globals.AsyncIterator = Symbol.for(`AsyncIterator`)
globals.Atomics = Symbol.for(`Atomics`)
globals.Blob = Symbol.for(`Blob`)
globals.BigInt = Symbol.for(`BigInt`)
globals.BigInt64Array = Symbol.for(`BigInt64Array`)
globals.BigUint64Array = Symbol.for(`BigUint64Array`)
globals.Boolean = Symbol.for(`Boolean`)
globals.DataView = Symbol.for(`DataView`)
globals.Date = Symbol.for(`Date`)
globals.Error = Symbol.for(`Error`)
globals.FinalizationRegistry = Symbol.for(`FinalizationRegistry`)
globals.Float32Array = Symbol.for(`Float32Array`)
globals.Float64Array = Symbol.for(`Float64Array`)
globals.Function = Symbol.for(`Function`)
globals.Generator = Symbol.for(`Generator`)
globals.GeneratorFunction = Symbol.for(`GeneratorFunction`)
globals.Int16Array = Symbol.for(`Int16Array`)
globals.Int32Array = Symbol.for(`Int32Array`)
globals.Int8Array = Symbol.for(`Int8Array`)
globals.Intl = Symbol.for(`Intl`)
globals.Iterator = Symbol.for(`Iterator`)
globals.JSON = Symbol.for(`JSON`)
globals.Map = Symbol.for(`Map`)
globals.Math = Symbol.for(`Math`)
globals.Number = Symbol.for(`Number`)
globals.Object = Symbol.for(`Object`)
globals.Promise = Symbol.for(`Promise`)
globals.Proxy = Symbol.for(`Proxy`)
globals.Reflect = Symbol.for(`Reflect`)
globals.RegExp = Symbol.for(`RegExp`)
globals.Request = Symbol.for(`Request`)
globals.Response = Symbol.for(`Response`)
globals.Set = Symbol.for(`Set`)
globals.SharedArrayBuffer = Symbol.for(`SharedArrayBuffer`)
globals.String = Symbol.for(`String`)
globals.Symbol = Symbol.for(`Symbol`)
globals.SyntaxError = Symbol.for(`SyntaxError`)
globals.TextDecoder = Symbol.for(`TextDecoder`)
globals.TextEncoder = Symbol.for(`TextEncoder`)
globals.TypeError = Symbol.for(`TypeError`)
globals.Uint16Array = Symbol.for(`Uint16Array`)
globals.Uint32Array = Symbol.for(`Uint32Array`)
globals.Uint8Array = Symbol.for(`Uint8Array`)
globals.Uint8ClampedArray = Symbol.for(`Uint8ClampedArray`)
globals.URL = Symbol.for(`URL`)
globals.WeakMap = Symbol.for(`WeakMap`)
globals.WeakRef = Symbol.for(`WeakRef`)
globals.WeakSet = Symbol.for(`WeakSet`)

// Semi-placeholder. Missing a lot of globals.
export const domGlobals = Object.create(null)
domGlobals.customElements = Symbol.for(`customElements`)
domGlobals.document = Symbol.for(`document`)
domGlobals.window = Symbol.for(`window`)
domGlobals.Node = Symbol.for(`Node`)
domGlobals.Text = Symbol.for(`Text`)
domGlobals.Comment = Symbol.for(`Comment`)
domGlobals.Element = Symbol.for(`Element`)
domGlobals.HTMLElement = Symbol.for(`HTMLElement`)
domGlobals.HTMLAnchorElement = Symbol.for(`HTMLAnchorElement`)
domGlobals.HTMLAreaElement = Symbol.for(`HTMLAreaElement`)
domGlobals.HTMLAudioElement = Symbol.for(`HTMLAudioElement`)
domGlobals.HTMLBaseElement = Symbol.for(`HTMLBaseElement`)
domGlobals.HTMLBodyElement = Symbol.for(`HTMLBodyElement`)
domGlobals.HTMLBRElement = Symbol.for(`HTMLBRElement`)
domGlobals.HTMLButtonElement = Symbol.for(`HTMLButtonElement`)
domGlobals.HTMLCanvasElement = Symbol.for(`HTMLCanvasElement`)
domGlobals.HTMLDataElement = Symbol.for(`HTMLDataElement`)
domGlobals.HTMLDataListElement = Symbol.for(`HTMLDataListElement`)
domGlobals.HTMLDetailsElement = Symbol.for(`HTMLDetailsElement`)
domGlobals.HTMLDialogElement = Symbol.for(`HTMLDialogElement`)
domGlobals.HTMLDivElement = Symbol.for(`HTMLDivElement`)
domGlobals.HTMLDListElement = Symbol.for(`HTMLDListElement`)
domGlobals.HTMLEmbedElement = Symbol.for(`HTMLEmbedElement`)
domGlobals.HTMLFieldSetElement = Symbol.for(`HTMLFieldSetElement`)
domGlobals.HTMLFontElement = Symbol.for(`HTMLFontElement`)
domGlobals.HTMLFormElement = Symbol.for(`HTMLFormElement`)
domGlobals.HTMLFrameElement = Symbol.for(`HTMLFrameElement`)
domGlobals.HTMLFrameSetElement = Symbol.for(`HTMLFrameSetElement`)
domGlobals.HTMLHeadElement = Symbol.for(`HTMLHeadElement`)
domGlobals.HTMLHeadingElement = Symbol.for(`HTMLHeadingElement`)
domGlobals.HTMLHRElement = Symbol.for(`HTMLHRElement`)
domGlobals.HTMLHtmlElement = Symbol.for(`HTMLHtmlElement`)
domGlobals.HTMLIFrameElement = Symbol.for(`HTMLIFrameElement`)
domGlobals.HTMLImageElement = Symbol.for(`HTMLImageElement`)
domGlobals.HTMLInputElement = Symbol.for(`HTMLInputElement`)
domGlobals.HTMLLabelElement = Symbol.for(`HTMLLabelElement`)
domGlobals.HTMLLegendElement = Symbol.for(`HTMLLegendElement`)
domGlobals.HTMLLIElement = Symbol.for(`HTMLLIElement`)
domGlobals.HTMLLinkElement = Symbol.for(`HTMLLinkElement`)
domGlobals.HTMLMapElement = Symbol.for(`HTMLMapElement`)
domGlobals.HTMLMarqueeElement = Symbol.for(`HTMLMarqueeElement`)
domGlobals.HTMLMenuElement = Symbol.for(`HTMLMenuElement`)
domGlobals.HTMLMetaElement = Symbol.for(`HTMLMetaElement`)
domGlobals.HTMLMeterElement = Symbol.for(`HTMLMeterElement`)
domGlobals.HTMLModElement = Symbol.for(`HTMLModElement`)
domGlobals.HTMLObjectElement = Symbol.for(`HTMLObjectElement`)
domGlobals.HTMLOListElement = Symbol.for(`HTMLOListElement`)
domGlobals.HTMLOptGroupElement = Symbol.for(`HTMLOptGroupElement`)
domGlobals.HTMLOptionElement = Symbol.for(`HTMLOptionElement`)
domGlobals.HTMLOutputElement = Symbol.for(`HTMLOutputElement`)
domGlobals.HTMLParagraphElement = Symbol.for(`HTMLParagraphElement`)
domGlobals.HTMLParamElement = Symbol.for(`HTMLParamElement`)
domGlobals.HTMLPictureElement = Symbol.for(`HTMLPictureElement`)
domGlobals.HTMLPreElement = Symbol.for(`HTMLPreElement`)
domGlobals.HTMLProgressElement = Symbol.for(`HTMLProgressElement`)
domGlobals.HTMLQuoteElement = Symbol.for(`HTMLQuoteElement`)
domGlobals.HTMLScriptElement = Symbol.for(`HTMLScriptElement`)
domGlobals.HTMLSelectElement = Symbol.for(`HTMLSelectElement`)
domGlobals.HTMLSlotElement = Symbol.for(`HTMLSlotElement`)
domGlobals.HTMLSourceElement = Symbol.for(`HTMLSourceElement`)
domGlobals.HTMLSpanElement = Symbol.for(`HTMLSpanElement`)
domGlobals.HTMLStyleElement = Symbol.for(`HTMLStyleElement`)
domGlobals.HTMLTableCaptionElement = Symbol.for(`HTMLTableCaptionElement`)
domGlobals.HTMLTableCellElement = Symbol.for(`HTMLTableCellElement`)
domGlobals.HTMLTableColElement = Symbol.for(`HTMLTableColElement`)
domGlobals.HTMLTableElement = Symbol.for(`HTMLTableElement`)
domGlobals.HTMLTableRowElement = Symbol.for(`HTMLTableRowElement`)
domGlobals.HTMLTableSectionElement = Symbol.for(`HTMLTableSectionElement`)
domGlobals.HTMLTemplateElement = Symbol.for(`HTMLTemplateElement`)
domGlobals.HTMLTextAreaElement = Symbol.for(`HTMLTextAreaElement`)
domGlobals.HTMLTimeElement = Symbol.for(`HTMLTimeElement`)
domGlobals.HTMLTitleElement = Symbol.for(`HTMLTitleElement`)
domGlobals.HTMLTrackElement = Symbol.for(`HTMLTrackElement`)
domGlobals.HTMLUListElement = Symbol.for(`HTMLUListElement`)
domGlobals.HTMLVideoElement = Symbol.for(`HTMLVideoElement`)
domGlobals.SVGSvgElement = Symbol.for(`SVGSvgElement`)

export const symStar = Symbol.for(`*`)
export const symRest = Symbol.for(`...`)
export const symDo = Symbol.for(`jisp.do`)
export const symLet = Symbol.for(`jisp.let`)
export const symSet = Symbol.for(`jisp.set`)
export const symList = Symbol.for(`jisp.list`)
export const symDict = Symbol.for(`jisp.dict`)
export const symTry = Symbol.for(`jisp.try`)
export const symCatch = Symbol.for(`jisp.catch`)
export const symFinally = Symbol.for(`jisp.finally`)
export const symFunc = Symbol.for(`jisp.func`)
export const symFuncAsync = Symbol.for(`jisp.func.async`)
export const symFuncGet = Symbol.for(`jisp.func.get`)
export const symClassStatic = Symbol.for(`jisp.class.static`)
export const symClassProto = Symbol.for(`jisp.class.proto`)

const symArguments = Symbol.for(`arguments`)
const symSuper = Symbol.for(`super`)

export function comment() {return []}

export function use(src, name) {
  c.ctxReqIsModule(this)
  c.ctxReqIsStatement(this)
  c.reqArityBetween(arguments.length, 1, 2)

  if (name === symStar) return useMixin.call(this, src)
  if (c.isSome(name)) return useNamed.apply(this, arguments)
  return useAnon.call(this, src)
}

use.meta = c.raw(`import.meta`)
use.async = useAsync
use.mac = useMac
use.func = useFunc
use.resolve = useResolve

function useAnon(src) {
  c.reqArity(arguments.length, 1)
  src = importTarDepPath(this, src)
  if (c.isPromise(src)) return useAnonCompileAsync(src)
  return useAnonCompile(src)
}

async function useAnonCompileAsync(src) {return useAnonCompile(await src)}

function useAnonCompile(src) {return c.raw(`import `, c.compileNode(src))}

function useNamed(src, name) {
  c.reqArity(arguments.length, 2)
  c.ctxDeclare(this, name, name)
  src = importTarDepPath(this, src)
  if (c.isPromise(src)) return useNamedCompileAsync(src, name)
  return useNamedCompile(src, name)
}

async function useNamedCompileAsync(src, name) {
  return useNamedCompile((await src), name)
}

function useNamedCompile(src, name) {
  return c.raw(`import * as `, name.description, ` from `, c.compileNode(src))
}

async function useMixin(src) {
  c.reqArity(arguments.length, 1)

  let tar = src
  let rel = src
  if (!c.isStrRelImplicit(src)) {
    src = c.importSrcUrl(this, src).href
    tar = await importSrcDepPathFromUrl(this, src)
    rel = await importTarDepPathFromUrl(this, src)
  }

  const mix = c.ctxReqParentMixin(this)
  const out = new UseMixin(rel)
  for (const key of Object.keys(await import(tar))) {
    if (c.canPatch(mix, key)) mix[key] = new UseRef(key, out)
  }
  return out
}

class UseMixin extends Set {
  constructor(src) {super().src = src}

  compile() {
    const names = this.size ? c.joinExpressions([...this]) : ``
    const src = c.compileNode(this.src)
    if (names) return `import ${c.wrapBraces(names)} from ${src}`
    return `import ${src}`
  }
}

class UseRef extends c.Raw {
  constructor(key, tar) {super(key).tar = tar}
  macro() {return this.tar.add(this.valueOf()), this}
}

function useAsync(src) {
  c.reqArity(arguments.length, 1)
  src = c.isStr(src) ? importTarDepPath(this, src) : c.macroNode(this, src)
  if (c.isPromise(src)) return useAsyncCompileAsync(src)
  return useAsyncCompile(src)
}

async function useAsyncCompileAsync(src) {return useAsyncCompile(await src)}

function useAsyncCompile(src) {
  return c.raw(`import(`, c.compileNode(src), `)`)
}

export function useMac(src, name) {
  c.ctxReqIsStatement(this)
  c.reqArityBetween(arguments.length, 1, 2)
  if (name === symStar) return useMacMixin.call(this, src)
  if (c.isSome(name)) return useMacNamed.apply(this, arguments)
  return useMacAnon.apply(this, arguments)
}

async function useMacAnon(src) {
  c.reqArity(arguments.length, 1)
  await import(await importSrcDepPath(this, src))
  return []
}

async function useMacNamed(src, name) {
  c.reqArity(arguments.length, 2)
  c.ctxDeclare(this, name, await import(await importSrcDepPath(this, src)))
  return []
}

async function useMacMixin(src) {
  c.reqArity(arguments.length, 1)
  c.patch(c.ctxReqParentMixin(this), await import(await importSrcDepPath(this, src)))
  return []
}

function importSrcDepPath(ctx, src) {
  if (c.isStrRelImplicit(src)) return src
  return importSrcDepPathFromUrl(ctx, c.importSrcUrl(ctx, src).href)
}

function importTarDepPath(ctx, src) {
  if (c.isStrRelImplicit(src)) return src
  return importTarDepPathFromUrl(ctx, c.importSrcUrl(ctx, src).href)
}

async function importSrcDepPathFromUrl(ctx, src) {
  ctx[c.symModule]?.addSrcDep(src)
  const mod = c.ctxReqModules(ctx).getOrMake(src).init(ctx)
  if (!mod.isJispDialect()) return src
  await mod.ready(ctx)
  return mod.reqTarPath()
}

function importTarDepPathFromUrl(ctx, src) {
  let own = ctx[c.symModule]
  own?.addTarDep(src)
  own = own?.tarPath

  let imp = c.ctxReqModules(ctx).getOrMake(src).init(ctx)
  if (!imp.isJispDialect()) return tarPath(own, src)

  const tar = imp.tarPath
  if (tar) return tarPath(own, tar)

  imp = imp.ready(ctx)
  if (c.isPromise(imp)) return tarPathAsync(own, imp)
  return tarPath(own, imp.reqTarPath())
}

async function tarPathAsync(own, imp) {
  return tarPath(own, (await imp).reqTarPath())
}

function tarPath(own, imp) {return c.optUrlRel(own, imp) ?? imp}

export function useFunc(src, name) {
  c.reqArity(arguments.length, 2)
  c.ctxDeclare(this, name, name)
  src = importTarDepPath(this, src)
  if (c.isPromise(src)) return useFuncCompileAsync(src, name)
  return useFuncCompile(src, name)
}

async function useFuncCompileAsync(src, name) {
  useFuncCompile((await src), name)
}

function useFuncCompile(src, name) {
  return c.raw(
    `function `,
    name.description,
    `() {return import(`, c.compileNode(src), `)}`
  )
}

export function useResolve(src) {return importTarDepPath(this, src)}

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
    await import(await importSrcDepPath(ctx, src)),
  )
  return []
}

export {$export as export}

export function $export(name, alias) {
  c.ctxReqIsModule(this)
  c.ctxReqIsStatement(this)
  c.reqArityBetween(arguments.length, 1, 2)

  name = exportSource(c.macroNode(this, name))
  if (arguments.length <= 1) return c.raw(`export {`, name, `}`)
  return c.raw(`export {`, name, ` as `, exportAlias(alias), `}`)
}

function exportSource(src) {
  if (c.isSymUnqual(src)) return c.symIdent(src)
  throw SyntaxError(`export source must be unqualified identifier, got ${c.show(src)}`)
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
    param.call(this, tar) || c.panic(errLhs(tar)),
    `=`,
    (c.compileNode(src) || `undefined`),
  ))
}

$const.mac = constMac

function errLhs(src) {
  return c.errWithNodeContext(SyntaxError(`missing LHS in declaration or assignment`), src)
}

export function constMac(key, val) {
  c.reqArity(arguments.length, 2)
  val = c.macroNode(this, val)
  if (c.isPromise(val)) return constMacAsync(this, key, val)
  c.ctxDeclare(this, key, val)
  return []
}

async function constMacAsync(ctx, key, val) {
  c.ctxDeclare(ctx, key, await val)
  return []
}

export {$let as let}

export function $let(tar, src) {
  if (c.hasOwn(this, symLet)) return this[symLet].apply(this, arguments)
  c.ctxReqIsStatement(this)
  c.reqArityBetween(arguments.length, 1, 2)

  src = arguments.length > 1 ? c.compileNode(c.macroNode(Object.create(this), src)) : ``

  const pre = c.joinSpaced(
    c.ctxCompileExport(this),
    `let`,
    param.call(this, tar) || c.panic(errLhs(tar)),
  )

  if (src) return c.raw(c.joinSpaced(pre, `=`, src))
  return c.raw(pre)
}

export function letForClassStatic(key, val) {
  ctxReqClassStatic(this)
  c.reqArityBetween(arguments.length, 1, 2)
  ctxDeclareStatic(this, key)
  if (!(arguments.length > 1)) return []
  return c.raw(`static ` + letForClassBase(Object.create(this), key, val))
}

export function letForClassProto(key, val) {
  ctxReqClassProto(this)
  c.reqArityBetween(arguments.length, 1, 2)
  ctxDeclareProto(this, key)
  if (!(arguments.length > 1)) return []
  return c.raw(letForClassBase(Object.create(this), key, val))
}

function ctxDeclareStatic(ctx, key) {
  key = c.reqSymUnqual(key).description
  c.ctxReqNotDeclared(ctx, key)
  ctx[key] = new ThisScopedKeyStatic(key, ctx.this)
}

function ctxDeclareProto(ctx, key) {
  key = c.reqSymUnqual(key).description
  c.ctxReqNotDeclared(ctx, key)
  ctx[key] = new ThisScopedKeyProto(key, ctx.this)
}

function letForClassBase(ctx, key, val) {
  key = identOrStr(c.reqSym(key).description)
  val = c.compileNode(c.macroNode(ctx, val))
  if (val) return key + ` = ` + val
  return key
}

class ThisScopedKeyBase extends String {
  constructor(key, self) {super(c.reqStr(key)).this = self}
}

class ThisScopedKeyStatic extends ThisScopedKeyBase {
  macro(ctx) {
    if (c.isComp(ctx)) {
      if (ctx.this === this.this) return this
      if (ctx[symClassProto] === ctx.this && ctx[symClassStatic] === this.this) {
        return new ThisScopedKeyCon(this.valueOf(), ctx.this)
      }
    }
    throw errThisScoped(this.valueOf())
  }

  compile() {return `this` + c.compileAccess(this.valueOf())}
}

class ThisScopedKeyProto extends ThisScopedKeyBase {
  macro(ctx) {
    if (ctx?.this === this.this) return this
    throw errThisScoped(this.valueOf())
  }

  compile() {return `this` + c.compileAccess(this.valueOf())}
}

class ThisScopedKeyCon extends ThisScopedKeyProto {
  compile() {return `this.constructor` + c.compileAccess(this.valueOf())}
}

function errThisScoped(src) {
  throw Error(`property ${c.show(src)} unavailable in current context`)
}

export {$if as if}

export function $if() {
  if (c.ctxIsStatement(this)) return ifStatement.apply(this, arguments)
  return ifExpression.apply(this, arguments)
}

export function ifStatement(predicate, branchThen, branchElse) {
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

export function ifExpression(predicate, branchThen, branchElse) {
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
  if (c.hasOwn(this, symDo)) return this[symDo].apply(this, arguments)
  if (c.ctxIsStatement(this)) return doStatement.apply(this, arguments)
  return doExpression.apply(this, arguments)
}

export function doStatement(...src) {
  src = c.macroNodes(c.ctxWithStatement(c.ctxReqIsStatement(this)), src)
  src = c.compileStatements(src)
  return src ? c.raw(c.wrapBracesMultiLine(src)) : []
}

export function doExpression(...src) {
  src = c.compileNodes(c.macroNodes(c.ctxToExpression(this), src))
  switch (src.length) {
    case 0: return undefined
    case 1: return c.raw(src[0])
    default: return c.raw(c.wrapParens(src.join(c.expressionSep)))
  }
}

export function doForClassStatic(...src) {
  src = c.macroNodes(c.ctxWithStatement(ctxReqClassStatic(this)), src)
  src = c.compileStatements(src)
  return src ? c.raw(`static `, c.wrapBracesMultiLine(src)) : []
}

export function statements(...src) {
  c.ctxReqIsStatement(this)
  src = c.macroNodes(c.ctxReqIsStatement(this), src)
  src = c.compileStatements(src)
  return src ? c.raw(src) : []
}

export {$try as try}

export function $try(...src) {
  const ctx = c.ctxWithStatement(ctxMixinTry(c.ctxWithMixin(c.ctxReqIsStatement(this))))
  ctx[symTry] = undefined

  const main = c.compileBlockOpt(c.macroNodes(ctx, src))
  const cat = c.hasOwn(ctx, symCatch) ? c.optStr(ctx[symCatch]) : undefined
  const fin = c.hasOwn(ctx, symFinally) ? c.optStr(ctx[symFinally]) : undefined

  if (cat || fin) return c.raw(c.joinLines((`try ` + (main || `{}`)), cat, fin))
  if (main) return c.raw(main)
  return []
}

function ctxMixinTry(ctx) {
  if (!(`catch` in ctx)) ctx.catch = $catch
  if (!(`finally` in ctx)) ctx.finally = $finally
  return ctx
}

export function ctxIsTry(ctx) {return c.hasOwn(ctx, symTry)}

export function ctxReqTry(ctx) {
  if (ctxIsTry(ctx)) return ctx
  throw Error(`unexpected non-try context ${c.show(ctx)}`)
}

export {$catch as catch}

export function $catch(name, ...src) {
  const ctx = ctxReqTry(this)
  if (c.hasOwn(ctx, symCatch)) throw SyntaxError(`unexpected redundant "catch"`)

  switch (arguments.length) {
    case 0:
      ctx[symCatch] = `catch {}`
      return []

    case 1:
      ctx[symCatch] = `catch (` + c.symIdent(name) + `) {}`
      return []

    default: {
      const sub = c.ctxWithStatement(ctx)
      c.ctxDeclare(sub, name, name)
      ctx[symCatch] = `catch (` + name.description + `) ` + block(sub, src)
      return []
    }
  }
}

export {$finally as finally}

export function $finally(...src) {
  const ctx = ctxReqTry(this)
  if (c.hasOwn(ctx, symFinally)) throw SyntaxError(`unexpected redundant "finally"`)

  src = c.compileBlockOpt(c.macroNodes(c.ctxWithStatement(ctx), src))
  ctx[symFinally] = src ? (`finally ` + src) : ``
  return []
}

function block(ctx, src) {return c.compileBlock(c.macroNodes(ctx, src))}

export function loop(...src) {
  c.ctxReqIsStatement(this)
  return c.raw(`for (;;) `, block(loopCtx(this), src))
}

loop.while = loopWhile
loop.iter = loopIter

function loopCtx(ctx) {return c.ctxWithStatement(ctxMixinLoop(c.ctxWithMixin(ctx)))}

// SYNC[loop_mixin].
function ctxMixinLoop(ctx) {
  if (!(`break` in ctx)) ctx.break = $break
  if (!(`continue` in ctx)) ctx.continue = $continue
  return ctx
}

export {$break as break}

export function $break() {
  c.reqArityNullary(arguments.length)
  return $break
}

$break.macro = selfStatement
$break.compile = () => `break`

export {$continue as continue}

export function $continue() {
  c.reqArityNullary(arguments.length)
  return $continue
}

$continue.macro = selfStatement
$continue.compile = () => `continue`

export function loopWhile(cond, ...body) {
  c.ctxReqIsStatement(this)
  c.reqArityMin(arguments.length, 1)

  return c.raw(c.joinSpaced(
    `while`,
    c.wrapParens(c.compileNode(c.macroNode(Object.create(this), cond)) || `undefined`),
    block(loopCtx(this), body),
  ))
}

export function loopIter() {
  return c.raw(`for `, loopIterBase.apply(this, arguments))
}

loopIter.await = loopIterAwait

export function loopIterAwait() {
  return c.raw(`for await `, loopIterBase.apply(this, arguments))
}

export function loopIterBase(tar, ...body) {
  c.ctxReqIsStatement(this)
  c.reqArityMin(arguments.length, 1)

  const ctx = loopCtx(this)

  return c.joinSpaced(
    c.wrapParens(c.compileNode(macroListWith.call(ctx, loopIterHeadCtx, tar))),
    block(ctx, body),
  )
}

export const loopIterHeadCtx = Object.create(null)
loopIterHeadCtx.const = loopIterConst
loopIterHeadCtx.let = loopIterLet
loopIterHeadCtx.set = loopIterSet

export function loopIterConst() {
  return c.raw(`const `, loopIterDecl.apply(this, arguments))
}

export function loopIterLet() {
  return c.raw(`let `, loopIterDecl.apply(this, arguments))
}

export function loopIterSet(tar, src) {
  c.reqArity(arguments.length, 2)
  tar = c.compileNode(c.macroNode(this, tar)) || c.panic(errLhs(tar))
  src = loopIterSrc(this, src)
  return c.raw(tar + ` of ` + src)
}

export function loopIterDecl(tar, src) {
  c.reqArity(arguments.length, 2)
  src = loopIterSrc(this, src)
  tar = param.call(this, tar) || c.panic(errLhs(tar))
  return tar + ` of ` + src
}

function loopIterSrc(ctx, src) {
  src = c.macroNode(Object.create(ctx), src)
  if (c.isNil(src)) return `[]`

  src = c.compileNode(src)
  if (!src) return `[]`

  return src + ` ?? []`
}

/*
Specialized version of `macroList` that requires the first element to be a
symbol declared in the provided context. The context is expected to contain
only macro functions. Intended for closed-set special cases like loop variable
declarations. TODO better name and better approach.
*/
export function macroListWith(ctx, src) {
  if (c.isArr(src)) {
    const head = src[0]
    if (c.isSymUnqual(head)) {
      const key = head.description
      if (key in ctx) {
        try {return c.macroNode(ctx, ctx[key].apply(this, src.slice(1)), src)}
        catch (err) {throw c.errWithNodeContext(err, src)}
      }
    }
  }

  throw c.errWithNodeContext(SyntaxError(
    `expected list that begins with one of: ${keysIn(ctx).join(c.expressionSep)}; got ${c.show(src)}`,
  ), src)
}

function keysIn(src) {
  const out = []
  for (const key in src) if (c.isStr(key)) out.push(key)
  return out
}

export {$void as void}

export function $void() {
  let out = doExpression.apply(this, arguments)
  if (!out) return ctxVoid(this)
  out = `void ` + out.compile()
  return c.raw(c.ctxIsStatement(this) ? out : c.wrapParens(out))
}

$void.macro = function voidBare() {}

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
  if (c.hasOwn(this, symFunc)) return this[symFunc].apply(this, arguments)

  return c.raw(c.joinSpaced(
    c.ctxCompileExport(this),
    `function`,
    funcBase.apply(this, arguments),
  ))
}

func.async = funcAsync
func.get = funcGet

// SYNC[func_mixin].
function ctxMixinFunc(ctx) {
  ctx = ctxMixinFn(ctx)
  if (!(`arguments` in ctx)) ctx.arguments = symArguments
  return ctx
}

export function funcBase(param, ...body) {
  c.reqArityMin(arguments.length, 1)

  const name = c.reqSym(paramHead(param))
  const ctx = ctxDeclFunc(this, ctxMixinFunc(c.ctxWithMixin(this)), name)

  ctx[c.symStatement] = undefined
  ctx.this = Symbol(`this`)

  param = paramTail(param)
  return funcMacroCompile(ctx, c.compileNode(name), param, body)
}

export function funcForClassStatic() {
  return c.raw(`static ` + funcBaseForClassStatic.apply(this, arguments))
}

export function funcForClassProto() {
  return c.raw(funcBaseForClassProto.apply(this, arguments))
}

export function funcBaseForClassStatic(param, ...body) {
  ctxReqClassStatic(this)
  c.reqArityMin(arguments.length, 1)
  const name = paramHead(param)
  ctxDeclareStatic(this, name)
  return funcBaseForClass(this, name, paramTail(param), body)
}

export function funcBaseForClassProto(param, ...body) {
  ctxReqClassProto(this)
  c.reqArityMin(arguments.length, 1)
  const name = paramHead(param)
  ctxDeclareProto(this, name)
  return funcBaseForClass(this, name, paramTail(param), body)
}

export function funcBaseForClass(ctx, name, param, body) {
  c.reqArityMin(arguments.length, 1)
  ctx = Object.create(ctxMixinFunc(c.ctxWithMixin(ctx)))
  ctx[c.symStatement] = undefined
  name = identOrStr(c.reqSym(name).description)
  return funcMacroCompile(ctx, name, param, body)
}

export function funcAsync() {
  if (c.hasOwn(this, symFuncAsync)) return this[symFuncAsync].apply(this, arguments)

  return c.raw(c.joinSpaced(
    c.ctxCompileExport(this),
    `async function`,
    funcBase.apply(this, arguments),
  ))
}

export function funcAsyncForClassStatic() {
  return c.raw(`static async ` + funcBaseForClassStatic.apply(this, arguments))
}

export function funcAsyncForClassProto() {
  return c.raw(`async ` + funcBaseForClassProto.apply(this, arguments))
}

export function funcGet() {
  if (c.hasOwn(this, symFuncGet)) return this[symFuncGet].apply(this, arguments)
  throw Error(`missing override for getter function`)
}

export function funcGetForClassStatic() {
  return c.raw(`static get ` + funcBaseForClassStatic.apply(this, arguments))
}

export function funcGetForClassProto() {
  return c.raw(`get ` + funcBaseForClassProto.apply(this, arguments))
}

// Must be called with the "tail" of the function parameter list.
export function funcParamList(ctx, src) {
  return c.wrapParens(listDeconstructionInner(ctx, src))
}

export function param(src) {
  if (c.isSym(src)) {
    c.ctxDeclare(this, src, src)
    return c.reqStr(src.description)
  }

  // Assume that the list represents a macro call suitable for use in parameter
  // lists, typically a list deconstruction.
  if (c.isArr(src)) {
    const keys = Object.getOwnPropertySymbols(paramOverride)
    for (const key of keys) this[key] = paramOverride[key]
    try {return c.compileNode(c.macroNode(this, src))}
    finally {for (const key of keys) delete this[key]}
  }

  throw SyntaxError(`every parameter must be a symbol or a list, got ${c.show(src)}`)
}

/*
Allows some existing macros to be referenced in parameter deconstructions, with
a different behavior, specialized for parameter / variable declarations. This
allows symmetry between declaration and usage. Works particularly well for list
construction / deconstruction.
*/
export const paramOverride = Object.create(null)
paramOverride[symList] = listDeconstruction

function restParam(ctx, src, ind) {
  const more = c.reqArr(src).length - c.reqNat(ind)
  if (more !== 1) {
    throw SyntaxError(`rest symbol ${c.show(symRest.description)} must be followed by exactly one node, found ${more} nodes`)
  }
  src = src[ind]
  c.ctxDeclare(ctx, src, src)
  return `...` + src.description
}

function funcMacroCompile(ctx, name, param, body) {
  return c.joinSpaced(
    name,
    funcParamList(ctx, param),
    c.wrapBracesMultiLine(retStatementsOpt(ctx, body)),
  )
}

function paramHead(src) {
  if (c.isSymUnqual(src)) return src
  if (c.isArr(src) && c.isSymUnqual(src[0])) return src[0]

  throw c.errWithNodeContext(SyntaxError(
    `expected an unqualified symbol or a list that begins with an unqualified symbol`,
  ), src)
}

function paramTail(src) {
  if (c.isArr(src) && src.length > 1) return src.slice(1)
  return undefined
}

/*
For function and class declarations, where statement and
expression mode have slightly different declaration rules.
*/
function ctxDeclFunc(sup, sub, name) {
  if (c.ctxIsStatement(sup)) c.ctxDeclare(sup, name, name)
  else c.ctxRedeclare(sub, name, name)
  return Object.create(sub)
}

export function fn() {
  return c.raw(c.wrapParens(fnBase.apply(this, arguments)))
}

fn.async = fnAsync

export function fnAsync() {
  return c.raw(c.wrapParens(`async ` + fnBase.apply(this, arguments)))
}

function ctxMixinFn(ctx) {
  if (!(`ret` in ctx)) ctx.ret = ret
  if (!(`guard` in ctx)) ctx.guard = guard
  return ctx
}

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
  const ctx = new Proxy(c.ctxWithStatement(ctxMixinFn(c.ctxWithMixin(this))), han)
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
    return Symbol.for(key)
  }
}

function isOrdKey(val) {return c.isStr(val) && ordKeyReg.test(val)}

const ordKeyReg = /^[$]\d+$/

export {$class as class}

export function $class(param, ...body) {
  c.reqArityMin(arguments.length, 1)

  const name = c.reqSym(paramHead(param))

  /*
  References to the super-class and class mixins, if any, should be macroed
  in the current context, before we declare any new names such as the class
  we're defining.
  */
  let extend = paramTail(param)
  if (c.isSome(extend)) extend = c.macroNodes(this, extend)

  let ctx = c.ctxWithMixin(this)
  ctx = ctxMixinClass(ctx)
  ctx = ctxDeclFunc(this, ctx, name)
  ctx = ctxOverrideClassStatic(ctx)
  ctx.this = ctx[symClassStatic] = Symbol(`this`)

  body = c.macroNodes(ctx, body)

  const out = c.joinSpaced(
    `class`,
    c.compileNode(name),
    compileClassExtend(extend),
    c.compileBlock(body),
  )

  if (!c.ctxIsStatement(this)) return c.raw(c.wrapParens(out))
  return c.raw(c.joinSpaced(c.ctxCompileExport(this), out))
}

// SYNC[class_mixin].
function ctxMixinClass(ctx) {
  if (!(`prototype` in ctx)) ctx.prototype = classPrototype
  if (!(`super` in ctx)) ctx.super = symSuper
  return ctx
}

// SYNC[class_override_static].
function ctxOverrideClassStatic(ctx) {
  ctx[symDo] = doForClassStatic
  ctx[symSet] = setForClassStatic
  ctx[symLet] = letForClassStatic
  ctx[symFunc] = funcForClassStatic
  ctx[symFuncAsync] = funcAsyncForClassStatic
  ctx[symFuncGet] = funcGetForClassStatic
  return ctx
}

export function ctxIsClassStatic(ctx) {return c.hasOwn(ctx, symClassStatic)}

export function ctxReqClassStatic(ctx) {
  if (ctxIsClassStatic(ctx)) return ctx
  throw Error(`expected class static context, got ${c.show(ctx)}`)
}

export function ctxIsClassProto(ctx) {return c.hasOwn(ctx, symClassProto)}

export function ctxReqClassProto(ctx) {
  if (ctxIsClassProto(ctx)) return ctx
  throw Error(`expected class prototype context, got ${c.show(ctx)}`)
}

export function classPrototype(...src) {
  ctxReqClassStatic(this)
  if (!src.length) return []

  const ctx = ctxOverrideClassProto(Object.create(this))
  ctx.this = ctx[symClassProto] = Symbol(`this`)

  return c.raw(c.compileStatements(c.macroNodes(ctx, src)))
}

// SYNC[class_override_proto].
function ctxOverrideClassProto(ctx) {
  ctx[symSet] = setForClassProto
  ctx[symLet] = letForClassProto
  ctx[symFunc] = funcForClassProto
  ctx[symFuncAsync] = funcAsyncForClassProto
  ctx[symFuncGet] = funcGetForClassProto
  return ctx
}

function compileClassExtend(src) {
  if (c.isNil(src)) return ``
  const out = src.reduce(appendCompileClassExtend, ``, this)
  return out && (`extends ` + out)
}

function appendCompileClassExtend(prev, next) {
  return c.compileNode(next) + (prev && c.wrapParens(prev))
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

$new.target = c.raw(`new.target`)

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

export function $in(val, key) {
  c.reqArity(arguments.length, 2)
  return binaryInfix(this, key, `in`, val)
}

$in.compile = () => `((a, b) => b in a)`

/*
Only valid if the declaration of `Object` in the current scope refers to the
global `Object`. TODO reconsider. TODO consider variadic form.
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

export function spread(src) {
  c.reqArity(arguments.length, 1)
  src = c.compileNode(c.macroNode(c.ctxToExpression(this), src))
  return src ? c.raw(`...(${src} ?? [])`) : []
}

/*
Exported by the prelude module under the empty string key.
Allows the following syntax to work:

  [. src key]
  [.? src key]
  [... someList]
*/
export const empty = Object.create(null)
empty[``] = emptyGet
empty[`?`] = getOpt

function emptyGet() {return get.apply(this, arguments)}
emptyGet[``] = Object.create(null)
emptyGet[``][``] = spread

export function list(...src) {
  if (c.hasOwn(this, symList)) return this[symList].apply(this, arguments)
  return c.raw(c.wrapBrackets(macroCompileExprs(this, src).join(c.expressionSep)))
}

/*
Should be suitable for deconstructions in variable declarations and in function
parameter declarations. Not suitable for the top level of function parameters,
which must compile to parens, not brackets.
*/
export function listDeconstruction(...src) {
  return c.raw(c.wrapBrackets(listDeconstructionInner(this, src)))
}

// Must be called with the "tail" of a list deconstruction.
function listDeconstructionInner(ctx, src) {
  if (c.isNil(src) || !c.reqArr(src).length) return ``

  const buf = []
  let ind = -1

  while (++ind < src.length) {
    let val = src[ind]

    if (val === symRest) {
      buf.push(restParam(ctx, src, ind + 1))
      break
    }

    val = param.call(ctx, val)
    if (val) buf.push(val)
  }
  return c.joinExpressions(buf)
}

export function dict(...src) {
  if (c.hasOwn(this, symDict)) return this[symDict].apply(this, arguments)

  const sta = c.ctxIsStatement(this)
  const len = src.length
  if (!len) return c.raw(sta ? `({})` : `{}`)
  if (len % 2) throw SyntaxError(`expected an even number of inputs, got ${len} inputs`)

  const ctx = sta ? Object.create(this) : this
  const buf = []
  let ind = 0
  while (ind < len) buf.push(dictEntry.call(ctx, src[ind++], src[ind++]))

  const out = c.wrapBraces(c.join(buf, c.expressionSep))
  return c.raw(sta ? c.wrapParens(out) : out)
}

export function dictEntry(key, val) {
  key = key === symRest ? key : fieldName(this, key)
  val = c.compileNode(c.macroNode(this, val))

  if (key === symRest) return val && (`...` + val)
  if (key) return key + `: ` + (val || `undefined`)
  if (!val) return ``
  throw errEntryLhs(val)
}

export function fieldName(ctx, key) {
  if (c.isNil(key)) return ``
  if (c.isNat(key)) return String(key)
  if (c.isNum(key)) return `"` + String(key) + `"`
  if (c.isBigInt(key)) return String(key)
  if (c.isStr(key)) return c.compileNode(key)
  if (c.isSymKeyUnqual(key)) return identOrStr(key.description.slice(c.accessor.length))
  return c.wrapBracketsOpt(c.compileNode(c.macroNode(ctx, key)))
}

function errEntryLhs(val) {
  throw SyntaxError(`unable to compile entry with empty left-hand side and value ${c.show(val)}`)
}

export function get(src, ...path) {
  c.reqArityMin(arguments.length, 1)
  const ctx = c.ctxToExpression(this)
  src = c.compileNode(c.macroNode(ctx, src))
  src += getPathBase(ctx, path, c.compileAccess, accessBracketed)
  return src ? c.raw(src) : undefined
}

function accessBracketed(ctx, src) {
  src = c.compileNode(c.macroNode(ctx, src))
  return src && c.wrapBrackets(src)
}

export function getOpt(src, ...path) {
  c.reqArityMin(arguments.length, 1)

  const ctx = c.ctxToExpression(this)

  src = c.macroNode(ctx, src)
  src = c.isSym(src)
    ? c.compileSymWith(src, c.compileAccessOpt)
    : c.compileNode(src)

  src += getPathBase(ctx, path, c.compileAccessOpt, accessBracketedOpt)
  return src ? c.raw(src) : undefined
}

function accessBracketedOpt(ctx, src) {
  src = c.compileNode(c.macroNode(ctx, src))
  return src && (c.accessorOpt + c.wrapBrackets(src))
}

function getPathBase(ctx, src, keyFun, exprFun) {
  let out = ``

  for (src of c.reqArr(src)) {
    if (c.isSym(src) && src.description.startsWith(c.accessor)) {
      for (src of src.description.slice(c.accessor.length).split(c.accessor)) {
        out += keyFun(src)
      }
    }
    else {
      out += exprFun(ctx, src)
    }
  }
  return out
}

export function set(tar, src) {
  if (c.hasOwn(this, symSet)) return this[symSet].apply(this, arguments)
  c.reqArity(arguments.length, 2)
  return assign.call(this, tar, `=`, src)
}

export function setForClassStatic(key, val) {
  ctxReqClassStatic(this)
  c.reqArity(arguments.length, 2)
  const out = fieldMacroCompile(Object.create(this), key, val)
  return out ? c.raw(`static ` + out) : []
}

export function setForClassProto(key, val) {
  ctxReqClassProto(this)
  c.reqArity(arguments.length, 2)
  const out = fieldMacroCompile(Object.create(this), key, val)
  return out ? c.raw(out) : []
}

export function fieldMacroCompile(ctx, key, val) {
  key = fieldName(ctx, key)
  val = c.compileNode(c.macroNode(ctx, val))
  if (key && val) return key + ` = ` + val
  if (key) return key
  if (!val) return ``
  throw errEntryLhs(val)
}

export function assign(tar, inf, src) {
  [tar, src] = assignMacroCompile(c.ctxToExpression(this), tar, src)
  const out = c.joinSpaced(tar, inf, src || `undefined`)
  return c.raw(c.ctxIsStatement(this) ? out : c.wrapParens(out))
}

function assignMacroCompile(ctx, tar, src) {
  tar = c.macroNode(ctx, tar)
  src = c.macroNode(ctx, src)

  tar = c.compileNode(tar)
  src = c.compileNode(src)

  if (tar) return [tar, src]
  throw errEntryLhs(src)
}

export {$delete as delete}

export function $delete() {
  c.reqArityMin(arguments.length, 1)

  let out = get.apply(this, arguments)
  if (!out) return []

  out = `delete ` + out
  return c.raw(c.ctxIsStatement(this) ? out : c.wrapParens(out))
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

export function assignAnd(one, two) {
  c.reqArity(arguments.length, 2)
  return assign.call(this, one, `&&=`, two)
}

export function or(...src) {
  src = macroCompileExprs(this, src)
  switch (src.length) {
    case 0: return undefined
    case 1: return c.raw(src[0])
    default: return c.raw(c.wrapParens(src.join(` || `)))
  }
}

or.compile = () => `((a, b) => a || b)`

export function assignOr(one, two) {
  c.reqArity(arguments.length, 2)
  return assign.call(this, one, `||=`, two)
}

export function coalesce(...src) {
  src = macroCompileExprs(this, src)
  switch (src.length) {
    case 0: return undefined
    case 1: return c.raw(src[0])
    default: return c.raw(c.wrapParens(src.join(` ?? `)))
  }
}

coalesce.compile = () => `((a, b) => a ?? b)`

export function assignCoalesce(one, two) {
  c.reqArity(arguments.length, 2)
  return assign.call(this, one, `??=`, two)
}

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

// TODO consider variadic form.
export function eq(one, two) {
  c.reqArity(arguments.length, 2)
  return binaryInfix(this, one, `===`, two)
}

eq.compile = () => `((a, b) => a === b)`

// TODO consider variadic form.
export function neq(one, two) {
  c.reqArity(arguments.length, 2)
  return binaryInfix(this, one, `!==`, two)
}

neq.compile = () => `((a, b) => a !== b)`

// TODO consider variadic form.
export function gt(one, two) {
  c.reqArity(arguments.length, 2)
  return binaryInfix(this, one, `>`, two)
}

gt.compile = () => `((a, b) => a > b)`

// TODO consider variadic form.
export function lt(one, two) {
  c.reqArity(arguments.length, 2)
  return binaryInfix(this, one, `<`, two)
}

lt.compile = () => `((a, b) => a < b)`

// TODO consider variadic form.
export function gte(one, two) {
  c.reqArity(arguments.length, 2)
  return binaryInfix(this, one, `>=`, two)
}

gte.compile = () => `((a, b) => a >= b)`

// TODO consider variadic form.
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

export function assignAdd(one, two) {
  c.reqArity(arguments.length, 2)
  return assign.call(this, one, `+= `, two)
}

export function subtract(...src) {
  src = macroCompileExprs(this, src)
  switch (src.length) {
    case 0: return undefined
    case 1: return c.raw(c.wrapParens(`- ` + src[0]))
    default: return c.raw(c.wrapParens(src.join(` - `)))
  }
}

subtract.compile = () => `((a, b) => a - b)`

export function assignSubtract(one, two) {
  c.reqArity(arguments.length, 2)
  return assign.call(this, one, `-= `, two)
}

export function divide(...src) {
  src = macroCompileExprs(this, src)
  switch (src.length) {
    case 0: return undefined
    case 1: return c.raw(src[0])
    default: return c.raw(c.wrapParens(src.join(` / `)))
  }
}

divide.compile = () => `((a, b) => a / b)`

export function assignDivide(one, two) {
  c.reqArity(arguments.length, 2)
  return assign.call(this, one, `/=`, two)
}

export function multiply(...src) {
  src = macroCompileExprs(this, src)
  switch (src.length) {
    case 0: return undefined
    case 1: return c.raw(c.wrapParens(`1 * ` + src[0]))
    default: return c.raw(c.wrapParens(src.join(` * `)))
  }
}

multiply.compile = () => `((a, b) => a * b)`

export function assignMultiply(one, two) {
  c.reqArity(arguments.length, 2)
  return assign.call(this, one, `*= `, two)
}

export function exponentiate(...src) {
  src = macroCompileExprs(this, src)
  switch (src.length) {
    case 0: return undefined
    case 1: return c.raw(c.wrapParens(src[0] + ` ** 1`))
    default: return c.raw(c.wrapParens(src.join(` ** `)))
  }
}

exponentiate.compile = () => `((a, b) => a ** b)`

export function assignExponentiate(one, two) {
  c.reqArity(arguments.length, 2)
  return assign.call(this, one, `**= `, two)
}

export function remainder(...src) {
  src = macroCompileExprs(this, src)
  switch (src.length) {
    case 0: return undefined
    case 1: return c.raw(src[0])
    default: return c.raw(c.wrapParens(src.join(` % `)))
  }
}

remainder.compile = () => `((a, b) => a % b)`

export function assignRemainder(one, two) {
  c.reqArity(arguments.length, 2)
  return assign.call(this, one, `%= `, two)
}

export function bitAnd(...src) {
  src = macroCompileExprs(this, src)
  switch (src.length) {
    case 0: return 0
    case 1: return c.raw(c.wrapParens(src[0] + ` & 0`))
    default: return c.raw(c.wrapParens(src.join(` & `)))
  }
}

bitAnd.compile = () => `((a, b) => a & b)`

export function assignBitAnd(one, two) {
  c.reqArity(arguments.length, 2)
  return assign.call(this, one, `&=`, two)
}

export function bitOr(...src) {
  src = macroCompileExprs(this, src)
  switch (src.length) {
    case 0: return 0
    case 1: return c.raw(c.wrapParens(src[0] + ` | 0`))
    default: return c.raw(c.wrapParens(src.join(` | `)))
  }
}

bitOr.compile = () => `((a, b) => a | b)`

export function assignBitOr(one, two) {
  c.reqArity(arguments.length, 2)
  return assign.call(this, one, `|=`, two)
}

export function bitXor(...src) {
  src = macroCompileExprs(this, src)
  switch (src.length) {
    case 0: return 0
    case 1: return c.raw(c.wrapParens(src[0] + ` ^ 0`))
    default: return c.raw(c.wrapParens(src.join(` ^ `)))
  }
}

bitXor.compile = () => `((a, b) => a ^ b)`

export function assignBitXor(one, two) {
  c.reqArity(arguments.length, 2)
  return assign.call(this, one, `^=`, two)
}

export function bitShiftLeft(...src) {
  src = macroCompileExprs(this, src)
  switch (src.length) {
    case 0: return 0
    case 1: return c.raw(c.wrapParens(src[0] + ` << 0`))
    default: return c.raw(c.wrapParens(src.join(` << `)))
  }
}

bitShiftLeft.compile = () => `((a, b) => a << b)`

export function assignBitShiftLeft(one, two) {
  c.reqArity(arguments.length, 2)
  return assign.call(this, one, `<<=`, two)
}

export function bitShiftRight(...src) {
  src = macroCompileExprs(this, src)
  switch (src.length) {
    case 0: return 0
    case 1: return c.raw(c.wrapParens(src[0] + ` >> 0`))
    default: return c.raw(c.wrapParens(src.join(` >> `)))
  }
}

bitShiftRight.compile = () => `((a, b) => a >> b)`

export function assignBitShiftRight(one, two) {
  c.reqArity(arguments.length, 2)
  return assign.call(this, one, `>>=`, two)
}

export function bitShiftRightUnsigned(...src) {
  src = macroCompileExprs(this, src)
  switch (src.length) {
    case 0: return 0
    case 1: return c.raw(c.wrapParens(src[0] + ` >>> 0`))
    default: return c.raw(c.wrapParens(src.join(` >>> `)))
  }
}

bitShiftRightUnsigned.compile = () => `((a, b) => a >>> b)`

export function assignBitShiftRightUnsigned(one, two) {
  c.reqArity(arguments.length, 2)
  return assign.call(this, one, `>>>=`, two)
}

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

export function pipe(name, ...exprs) {
  c.reqSymUnqual(name)
  if (!exprs.length) return name
  return [$do, ...exprs.map(setWith, name), name]
}

function setWith(val) {return [set, this, val]}

export {$private as private}

export function $private(src) {
  c.reqArity(arguments.length, 1)
  if (!c.hasOwn(this, c.symExport)) return src
  return c.macroNode(new Proxy(this, exportHidingProxyHandler), src)
}

const exportHidingProxyHandler = Object.create(null)

exportHidingProxyHandler.getOwnPropertyDescriptor = function getOwnPropertyDescriptor(tar, key) {
  if (key === c.symExport) return undefined
  return Object.getOwnPropertyDescriptor(tar, key)
}
