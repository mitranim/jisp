import * as a from '/Users/m/code/m/js/all.mjs'
import * as jnom from './jisp_node_oper_macro.mjs'

// See `Plus` for some comments and explanations.
export class Minus extends jnom.OperMacro {
  compileUnary(src) {
    return `- ` + a.reqStr(src.compile())
  }

  compileVariadic(src) {
    return this.reqCodePrinter().mapCompile(src).join(` - `)
  }
}
