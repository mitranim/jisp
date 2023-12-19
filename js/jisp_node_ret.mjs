import * as a from '/Users/m/code/m/js/all.mjs'
import * as jnlm from './jisp_node_list_macro.mjs'

/*
Short for "return". Compiles to the JS `return` statement. Should be available
in the lexical namespace of every `Fn`, and nowhere else.
*/
export class Ret extends jnlm.ListMacro {
  optVal() {return this.optSrcAt(1)}
  reqVal() {return this.reqSrcAt(1)}

  macroImpl() {
    this
      .reqSrcList()
      .reqEveryChildNotCosmetic()
      .reqChildCountBetween(1, 2)
      .macroFrom(1)
    return this
  }

  compile() {
    this.reqStatement()
    const val = this.optVal()
    if (val) return `return ` + a.reqStr(val.compile())
    return `return`
  }
}
