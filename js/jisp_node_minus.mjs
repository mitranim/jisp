import * as a from '/Users/m/code/m/js/all.mjs'
import * as jnoi from './jisp_node_oper_infix.mjs'

// See `Plus` for some comments and explanations.
export class Minus extends jnoi.OperInfix {
  compileUnary(src) {
    return `- ` + a.reqStr(src.compile())
  }

  compileVariadic(src) {
    return this.reqCodePrinter().mapCompile(src).join(` - `)
  }
}
