import * as a from '/Users/m/code/m/js/all.mjs'
import * as jnlm from './jisp_node_list_macro.mjs'

/*
Short for "return". Compiles to the JS `return` statement. Should be available
in the lexical namespace of every `Fn`, and nowhere else.
*/
export class Ret extends jnlm.ListMacro {
  optVal() {return this.optChildAt(1)}
  reqVal() {return this.reqChildAt(1)}

  macroImpl() {
    this.reqEveryChildNotCosmetic()
    this.reqChildCountBetween(1, 2)
    return this.macroFrom(1)
  }

  compile() {
    this.reqStatement()
    const val = this.optVal()
    if (val) return `return ` + a.reqStr(val.compile())
    return `return`
  }
}
