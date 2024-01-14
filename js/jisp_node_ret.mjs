import * as a from '/Users/m/code/m/js/all.mjs'
import * as jn from './jisp_node.mjs'
import * as jnlm from './jisp_node_list_macro.mjs'

// Short for "return". Compiles to the JS `return` statement.
export class Ret extends jnlm.ListMacro {
  macro() {
    this.reqEveryChildNotCosmetic()
    this.reqChildCountBetween(0, 1)
    return this.macroFrom(0)
  }

  compile() {
    this.reqStatement()
    const val = this.optFirstChild()
    if (val) return `return ` + jn.optCompileNode(val)
    return `return`
  }

  static {this.setReprModuleUrl(import.meta.url)}
}
