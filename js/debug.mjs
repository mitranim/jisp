import * as c from './core.mjs'

/*
Same as `comment` in prelude. Sometimes convenient when messing around and
enabling / disabling debug expressions.
*/
export function comment() {}

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

export function compiled(src) {
  c.reqArity(arguments.length, 1)
  console.log(`[debug] compiled:`, c.compileNode(c.macroNode(ctxBranch(this), src)))
  return src
}

export function compile(...src) {
  console.log(`[debug] compiled:`, c.compileStatements(c.macroNodes(ctxBranch(this), src)))
  return []
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
