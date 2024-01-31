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

export function running() {
  c.reqArityNullary(arguments.length)
  return [c.raw(`console.log`), `[debug] running module:`, c.ctxReqModule(this).pk()]
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
  return c.raw(src)
}

export function compile() {
  return compiled.apply(ctxBranch(this), arguments), []
}

function ctxBranch(ctx) {return Object.assign(Object.create(ctx), ctx)}

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

export function moduleSrcPath() {return c.ctxReqModule(this).srcPath}
