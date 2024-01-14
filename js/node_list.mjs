import * as a from '/Users/m/code/m/js/all.mjs'
import * as jnlm from './node_list_macro.mjs'

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
