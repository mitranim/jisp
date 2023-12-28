import * as a from '/Users/m/code/m/js/all.mjs'
import * as jm from './jisp_misc.mjs'
import * as jnom from './jisp_node_oper_macro.mjs'

export class BitXor extends jnom.OperMacro {
  macroImpl() {
    this.reqChildCountMin(3)
    return this.macroFrom(1)
  }

  compileVariadic(src) {
    return this.reqCodePrinter().mapCompile(src).join(` ^ `)
  }
}
