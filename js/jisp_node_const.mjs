import * as a from '/Users/m/code/m/js/all.mjs'
import * as jn from './jisp_node.mjs'
import * as jnlm from './jisp_node_list_macro.mjs'
import * as jniu from './jisp_node_ident_unqual.mjs'

export class Const extends jnlm.ListMacro {
  // Used by `a.pk` and `a.Coll`.
  pk() {return this.reqIdent().reqName()}
  reqIdent() {return this.reqChildInstAt(0, jniu.IdentUnqual)}
  reqVal() {return this.reqChildAt(1)}

  macro() {
    this.reqEveryChildNotCosmetic()
    this.reqChildCount(2)
    this.reqDeclareLex()
    return this.macroFrom(1)
  }

  compile() {
    this.reqStatement()

    return a.spaced(
      a.reqStr(this.compileExportPrefix()),
      a.reqStr(this.compilePrefix()),
      a.reqStr(this.compileName()),
      a.reqStr(this.compileInfix()),
      a.reqStr(this.compileVal()),
    )
  }

  compileExportPrefix() {return this.isExportable() ? `export` : ``}
  compilePrefix() {return `const`}
  compileName() {return jn.optCompileNode(this.reqIdent())}
  compileInfix() {return `=`}
  compileVal() {return jn.optCompileNode(this.reqVal())}

  reqDeclareLex() {
    this.reqIdent().reqCanDeclare()
    return super.reqDeclareLex()
  }

  static {this.setReprModuleUrl(import.meta.url)}
}
