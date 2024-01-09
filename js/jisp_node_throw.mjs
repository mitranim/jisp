import * as a from '/Users/m/code/m/js/all.mjs'
import * as jm from './jisp_misc.mjs'
import * as jns from './jisp_ns.mjs'
import * as jn from './jisp_node.mjs'
import * as jnlm from './jisp_node_list_macro.mjs'

export class Throw extends jnlm.ListMacro {
  reqVal() {return this.optChildAt(1)}

  macro() {
    this.reqEveryChildNotCosmetic()
    this.reqChildCount(2)
    return this.macroFrom(1)
  }

  compile() {
    this.reqStatement()
    return `throw ` + jn.reqCompileNode(this.reqVal())
  }

  static moduleUrl = import.meta.url
}
