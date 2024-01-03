import * as a from '/Users/m/code/m/js/all.mjs'
import * as jn from './jisp_node.mjs'
import * as jnlm from './jisp_node_list_macro.mjs'
import * as jniu from './jisp_node_ident_unqual.mjs'

export class Const extends jnlm.ListMacro {
  // Used by `a.pk` and `a.Coll`.
  pk() {return this.reqIdent().reqCanDeclare().reqName()}
  reqIdent() {return this.reqChildInstAt(1, jniu.IdentUnqual)}
  reqVal() {return this.reqChildAt(2)}

  macro() {
    this.reqStatement()
    this.reqEveryChildNotCosmetic()
    this.reqChildCount(3)
    this.reqDeclareLex()
    return this.macroFrom(2)
  }

  compile() {
    return a.spaced(
      a.reqStr(this.compilePrefix()),
      a.reqStr(this.compileName()),
      a.reqStr(this.compileInfix()),
      a.reqStr(this.compileVal()),
    )
  }

  compilePrefix() {return `const`}
  compileName() {return jn.compileNode(this.reqIdent())}
  compileInfix() {return `=`}
  compileVal() {return jn.compileNode(this.reqVal())}
}
