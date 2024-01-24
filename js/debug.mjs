import * as c from './core.mjs'

export function compiling() {
  c.reqArityNullary(arguments.length)
  c.ctxReqIsStatement(this)
  console.log(`[debug] compiling module:`, c.ctxReqModule(this).pk())
  return []
}

export function compile(...src) {
  c.ctxReqIsStatement(this)
  for (src of src) {
    console.log(`[debug] compiled:`, c.compileNode(c.macroNode(ctxBranch(this), src)))
  }
  return []
}

function ctxBranch(ctx) {return Object.assign(Object.create(ctx), ctx)}

export function inspected(val) {
  c.reqArity(arguments.length, 1)
  inspectNode(this, val)
  return val
}

export function inspect(...src) {
  c.ctxReqIsStatement(this)
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
