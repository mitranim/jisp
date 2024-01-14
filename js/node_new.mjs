import * as a from '/Users/m/code/m/js/all.mjs'
import * as jnlm from './node_list_macro.mjs'
import * as jnbm from './node_bare_macro.mjs'

export class New extends jnlm.ListMacro {
  static get target() {return NewTarget}

  macro() {
    this.reqEveryChildNotCosmetic()
    this.reqChildCountMin(1)
    return this.macroFrom(0)
  }

  compile() {
    const prn = this.reqPrn()

    return (
      `new `
      + a.reqStr(prn.optCompile(this.reqFirstChild()))
      + a.reqStr(prn.compileParensWithExpressions(this.optChildSlice(1)))
    )
  }

  static {this.setReprModuleUrl(import.meta.url)}
}

export class NewTarget extends jnbm.BareMacro {
  macro() {return this}

  /*
  This should be safe from collisions because in JS, `new` is a keyword, and
  `new.target` is special syntax supported at the parser level.
  */
  compile() {return `new.target`}

  static {this.setReprModuleUrl(import.meta.url)}
}
