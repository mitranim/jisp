import * as a from '/Users/m/code/m/js/all.mjs'
import * as jnom from './jisp_node_oper_macro.mjs'

export class Aster extends jnom.OperMacro {
  compileUnary(src) {
    return a.reqStr(src.compile()) + ` * 1`
  }

  compileVariadic(src) {
    return this.reqCodePrinter().mapCompile(src).join(` * `)
  }
}
