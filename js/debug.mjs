import * as c from './core.mjs'

export function compiling() {
  c.reqArityNullary(arguments.length)
  c.ctxReqStatement(this)
  console.log(`[debug] compiling:`, c.ctxReqModule(this).pk())
  return []
}

export function inspected(val) {
  c.reqArity(arguments.length, 1)
  const view = c.nodeSpan(val)?.view()
  if (view) console.log(`[debug] source:`, view)
  console.log(`[debug] node:`, c.show(val))
  return val
}

export function inspect() {return inspected.apply(this, arguments), []}
