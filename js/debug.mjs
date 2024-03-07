import * as c from './core.mjs'

/*
Similar to `comment` in prelude. Sometimes convenient when messing around and
enabling / disabling debug expressions.
*/
export function comment() {return []}

/*
Sometimes convenient when messing around and enabling / disabling debug
expressions.
*/
export function id(val) {
  c.reqArity(arguments.length, 1)
  return val
}

export function compiling() {
  c.reqArityNullary(arguments.length)
  console.log(`[debug] compiling module:`, c.ctxReqModule(this).pk())
  return []
}

export function compiledString(...src) {
  return c.compileStatements(c.macroNodes(ctxBranch(this), src))
}

export function compiled(...src) {
  src = c.compileStatements(c.macroNodes(this, src))
  if (src) {
    console.log(`[debug] compiled:`)
    console.log(src)
  }
  return src ? c.raw(src) : []
}

function ctxBranch(ctx) {return Object.assign(Object.create(ctx), ctx)}

export function running() {
  c.reqArityNullary(arguments.length)
  return [c.raw(`console.log`), `[debug] running module:`, c.ctxReqModule(this).pk()]
}

export function inspected(val) {
  c.reqArity(arguments.length, 1)
  inspectNode(this, val)
  return val
}

export function inspect(...src) {
  for (src of src) inspectNode(this, src)
  return []
}

function inspectNode(ctx, val) {
  const show = c.show(val)
  console.log(`[debug] node:`, show)
  console.log(`[debug] type:`, typeof val)

  const view = c.nodeSpan(val)?.view()
  if (view && view !== show) console.log(`[debug] source:`, view)

  if (c.isSym(val)) inspectSym(ctx, val)
}

function inspectSym(ctx, src) {
  for (const key of src.description.split(c.accessor)) {
    if (c.isComp(ctx) && key in ctx) ctx = ctx[key]
    else return
  }
  console.log(`[debug] value:`, ctx)
}

export function ctx() {
  console.log(`[debug] context:`, this)
  return []
}

export function mixin() {
  console.log(`[debug] mixin context:`, c.ctxReqParentMixin(this))
  return []
}

export function moduleSrcPath() {return c.ctxReqModule(this).srcPath}

export function module(src) {
  c.reqArityMax(arguments.length, 1)
  if (!arguments.length) return c.ctxReqModule(this)
  return c.ctxReqModules(this).getOrMake(c.importSrcUrl(this, src).href).init(this)
}

export function prn(src) {
  c.reqArity(arguments.length, 1)
  return [
    c.raw(`console.log`),
    `[debug] ` + c.reprNode(src).trim() + `:`,
    src,
  ]
}

export function timed(...src) {
  if (!src.length) return []

  const time0 = performance.now()
  src = c.macroNodes(this, src)
  const time1 = performance.now()
  src = c.compileStatements(src)
  const time2 = performance.now()

  console.log(`[debug] macro time:`, time1 - time0, `ms`)
  console.log(`[debug] compile time:`, time2 - time1, `ms`)
  console.log(`[debug] total time:`, time2 - time0, `ms`)
  return src ? c.raw(src) : []
}
