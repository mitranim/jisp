import * as a from '/Users/m/code/m/js/all.mjs'
import * as jm from './jisp_misc.mjs'
import * as jv from './jisp_valued.mjs'
import * as jmo from './jisp_module.mjs'
import * as jnm from './jisp_node_macro.mjs'
import * as jnst from './jisp_node_str.mjs'
import * as jnun from './jisp_node_unqual_name.mjs'

/*
Somewhat similar to `Use`, but for runtime-only imports, rather than for
compile-time evaluation.

FIXME move to prelude.
*/
export class Import extends jv.MixOwnValued.goc(jnm.Macro) {
  static getSrcName() {return `import`}
  static getTarName() {return this.getSrcName()}

  pk() {return a.pk(this.reqDest())}
  reqAddr() {return this.reqSrcInstAt(1, jnst.Str)}
  optDest() {return this.optSrcInstAt(2, jnun.UnqualName)}
  reqDest() {return this.reqSrcInstAt(2, jnun.UnqualName)}

  macroImpl() {
    if (this.isExpression()) {
      this.reqSrcList().reqEveryChildNotCosmetic().reqChildCount(2)
      this.reqAddr()
    }
    else {
      this.reqSrcList().reqEveryChildNotCosmetic().reqChildCountBetween(2, 3)
      this.reqAddr()
      this.defineLex()
    }
    return this
  }

  compile() {
    if (this.isExpression()) return this.compileExpression()
    return this.compileStatement()
  }

  compileExpression() {
    const prn = this.reqCodePrinter()
    return `import(${prn.compile(this.reqAddr())})`
  }

  compileStatement() {
    const prn = this.reqCodePrinter()
    const name = this.optDest()

    /*
    Normalize quotes for compatibility with the native import statement syntax,
    which currently allows only single and double quotes, but not backtick
    quotes.
    */
    const addr = JSON.stringify(a.reqStr(this.reqAddr().reqVal()))

    if (name) return `import * as ${prn.compile(name)} from ${addr}`
    return `import ${addr}`
  }
}
