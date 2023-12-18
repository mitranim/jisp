import * as jnm from './jisp_node_macro.mjs'
import * as jniu from './jisp_node_ident_unqual.mjs'

/*
FIXME consider:
  * `optRef` or `ownRef` that returns `IdentUnqual`.
*/
export class Const extends jnm.Macro {
  static getSrcName() {return `const`}

  pk() {return this.reqIdent().reqName()}
  reqIdent() {return this.reqSrcInstAt(1, jniu.IdentUnqual)}
  reqVal() {return this.reqSrcAt(2)}

  // Override for `MixRef`.
  ownDeref() {return this.reqVal()}

  macroImpl() {
    this.reqSrcList().reqEveryChildNotCosmetic().reqChildCount(3)
    this.declareLex()
    this.macroVal()
    return this
  }

  macroVal() {return this.reqSrcNode().macroAt(2)}

  compile() {
    this.reqStatement()
    const name = this.reqIdent().compile()
    const val = this.reqVal().compile()
    return `const ${a.reqStr(name)} = ${a.reqStr(val)}`
  }
}
