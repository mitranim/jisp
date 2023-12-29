import * as a from '/Users/m/code/m/js/all.mjs'
import * as jm from './jisp_misc.mjs'
import * as jns from './jisp_ns.mjs'
import * as jnlm from './jisp_node_list_macro.mjs'

export class Throw extends jnlm.ListMacro {
  reqVal() {return this.optChildAt(1)}

  macroImpl() {
    this.reqStatement()
    this.reqEveryChildNotCosmetic()
    this.reqChildCount(2)
    return this.macroFrom(1)
  }

  compile() {
    return `throw ` + a.reqStr(this.reqVal().compile())
  }
}
