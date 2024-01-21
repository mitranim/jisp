import * as c from './core.mjs'

export function compiling() {
  c.reqArityNullary(arguments.length)
  c.ctxReqStatement(this)
  console.log(`[debug] compiling:`, c.ctxReqModule(this).pk())
  return []
}
