import * as a from '/Users/m/code/m/js/all.mjs'
import * as jnlm from './jisp_node_list_macro.mjs'
import * as jniu from './jisp_node_ident_unqual.mjs'

/*
FIXME consider:
  * `optRef` or `ownRef` that returns `IdentUnqual`.
*/
export class Const extends jnlm.ListMacro {
  pk() {return this.reqIdent().reqName()}
  reqIdent() {return this.reqChildInstAt(1, jniu.IdentUnqual)}
  reqVal() {return this.reqChildAt(2)}

  macroImpl() {
    this.reqEveryChildNotCosmetic()
    this.reqChildCount(3)
    this.declareLex()
    return this.macroFrom(2)
  }

  macroVal() {return this.macroAt(2)}

  compile() {
    this.reqStatement()
    const name = this.reqIdent().compile()
    const val = this.reqVal().compile()
    return `const ${a.reqStr(name)} = ${a.reqStr(val)}`
  }
}
