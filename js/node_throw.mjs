import * as jn from './node.mjs'
import * as jnlm from './node_list_macro.mjs'

export class Throw extends jnlm.ListMacro {
  macro() {
    this.reqEveryChildNotCosmetic()
    this.reqChildCount(1)
    return this.macroFrom(0)
  }

  compile() {
    this.reqStatement()
    return `throw ` + jn.reqCompileNode(this.reqFirstChild())
  }

  static {this.setReprModuleUrl(import.meta.url)}
}
