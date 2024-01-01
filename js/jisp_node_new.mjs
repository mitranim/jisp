import * as a from '/Users/m/code/m/js/all.mjs'
import * as jnlm from './jisp_node_list_macro.mjs'
import * as jniu from './jisp_node_ident_unqual.mjs'
import * as jnp from './jisp_node_predecl.mjs'

export class New extends jnlm.ListMacro {
  static get target() {return NewTarget}

  macro() {
    this.reqEveryChildNotCosmetic()
    this.reqChildCountMin(2)
    return this.macroFrom(1)
  }

  compile() {
    const prn = this.reqPrn()

    return (
      `new `
      + a.reqStr(prn.compile(this.reqChildAt(1)))
      + a.reqStr(prn.compileParensWithExpressions(this.optChildSlice(2)))
    )
  }
}

export class NewTarget extends jnp.Predecl {
  getCompiledName() {return `new.target`}
}
