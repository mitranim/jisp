import * as a from '/Users/m/code/m/js/all.mjs'
import * as jnlm from './jisp_node_list_macro.mjs'
import * as jniu from './jisp_node_ident_unqual.mjs'

// FIXME missing feature: `new.target`.
export class New extends jnlm.ListMacro {
  macroImpl() {
    this.reqEveryChildNotCosmetic()
    this.reqChildCountMin(2)
    return this.macroFrom(1)
  }

  compile() {
    return (
      `new `
      + a.reqStr(this.reqChildAt(1).compile())
      + a.reqStr(this.reqCodePrinter().compileParensWithExpressions(this.optChildSlice(2)))
    )
  }
}
