import * as a from '/Users/m/code/m/js/all.mjs'
import * as jm from './jisp_misc.mjs'
import * as jns from './jisp_ns.mjs'
import * as jnlm from './jisp_node_list_macro.mjs'

export class List extends jnlm.ListMacro {
  macro() {return this.macroFrom(0)}

  compile() {
    return (
      ``
      + `[`
      + a.reqStr(this.reqPrn().compileExpressions(this.optChildArr()))
      + `]`
    )
  }

  static {this.setReprModuleUrl(import.meta.url)}
}
