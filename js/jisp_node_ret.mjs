import * as a from '/Users/m/code/m/js/all.mjs'
import * as jn from './jisp_node.mjs'
import * as jnlm from './jisp_node_list_macro.mjs'

// Short for "return". Compiles to the JS `return` statement.
export class Ret extends jnlm.ListMacro {
  optVal() {return this.optChildAt(1)}
  reqVal() {return this.reqChildAt(1)}

  macro() {
    this.reqEveryChildNotCosmetic()
    this.reqChildCountBetween(1, 2)
    return this.macroFrom(1)
  }

  compile() {
    this.reqStatement()
    return this.compileStatementReturn()
  }

  /*
  Optional interface used by `Func` for implicit returns. The macro `Ret` is a
  degenerate case where implicit and explicit return is exactly the same.
  */
  compileStatementReturn() {
    const val = this.optVal()
    if (val) return `return ` + jn.optCompileNode(val)
    return `return`
  }
}
