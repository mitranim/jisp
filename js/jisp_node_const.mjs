import * as a from '/Users/m/code/m/js/all.mjs'
import * as jnlm from './jisp_node_list_macro.mjs'
import * as jniu from './jisp_node_ident_unqual.mjs'

export class Const extends jnlm.ListMacro {
  pk() {return this.reqIdent().reqCanDeclare().reqName()}
  reqIdent() {return this.reqChildInstAt(1, jniu.IdentUnqual)}
  reqVal() {return this.reqChildAt(2)}

  macroImpl() {
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
  compileName() {return this.reqIdent().compile()}
  compileInfix() {return `=`}
  compileVal() {return this.reqVal().compile()}
}
