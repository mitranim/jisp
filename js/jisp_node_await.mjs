import * as a from '/Users/m/code/m/js/all.mjs'
import * as jnlm from './jisp_node_list_macro.mjs'

export class Await extends jnlm.ListMacro {
  reqVal() {return this.reqChildAt(1)}

  macroImpl() {
    this.reqEveryChildNotCosmetic()
    this.reqChildCount(2)
    return this.macroFrom(1)
  }

  compile() {
    return this.compileStatementOrExpression(
      `await ` + a.reqStr(this.reqVal().compile())
    )
  }
}
