import * as a from '/Users/m/code/m/js/all.mjs'
import * as jnoi from './jisp_node_oper_infix.mjs'

export class Aster extends jnoi.OperInfix {
  compileUnary(src) {
    return `1 * ` + a.reqStr(src.compile())
  }

  compileVariadic(src) {
    return this.reqCodePrinter().mapCompile(src).join(` * `)
  }
}
