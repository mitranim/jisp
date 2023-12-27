import * as a from '/Users/m/code/m/js/all.mjs'
import * as jnom from './jisp_node_oper_macro.mjs'

export class And extends jnom.OperMacro {
  macroImpl() {return this.macroFrom(1)}

  compile() {
    if (this.childCount() <= 1) return `true`
    return super.compile()
  }

  compileUnary(src) {return a.reqStr(src.compile())}

  compileVariadic(src) {
    return this.reqCodePrinter().mapCompile(src).join(` && `)
  }
}
