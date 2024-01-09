import * as a from '/Users/m/code/m/js/all.mjs'
import * as jnlm from './jisp_node_list_macro.mjs'
import * as jniu from './jisp_node_ident_unqual.mjs'
import * as jnbm from './jisp_node_bare_macro.mjs'

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
      + a.reqStr(prn.optCompile(this.reqChildAt(1)))
      + a.reqStr(prn.compileParensWithExpressions(this.optChildSlice(2)))
    )
  }

  static moduleUrl = import.meta.url
}

export class NewTarget extends jnbm.BareMacro {
  /*
  This should be safe from collisions because in JS, `new` is a keyword, and
  `new.target` is special syntax supported at the parser level.
  */
  compile() {return `new.target`}

  static moduleUrl = import.meta.url
}
