import * as a from '/Users/m/code/m/js/all.mjs'
import * as jnom from './jisp_node_oper_macro.mjs'

export class Bang extends jnom.OperMacro {
  macroImpl() {
    this.reqChildCount(2)
    return this.macroFrom(1)
  }

  compileUnary(src) {
    return `! ` + a.reqStr(src.compile())
  }
}
