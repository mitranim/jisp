import * as jn from './node.mjs'
import * as jnlm from './node_list_macro.mjs'

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
