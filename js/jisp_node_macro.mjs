import * as a from '/Users/m/code/m/js/all.mjs'
import * as jco from './jisp_call_opt.mjs'
import * as jnp from './jisp_node_predef.mjs'
import * as jnnl from './jisp_node_node_list.mjs'

/*
Base class for `Node` subclasses that are intended to replace other nodes during
compile-time macroing, typically as a result of being referenced via `Ident`.
*/
export class Macro extends jnp.Predef {
  static decl() {return super.decl().setCallStyle(jco.CallStyle.list)}

  reqSrcInst(cls) {
    const src = this.optSrcNode()
    if (a.isInst(src, cls)) return src
    throw this.err(`macro ${a.show(this)} requires the source node to be an instance of ${a.show(cls)}, got ${a.show(src)}`)
  }

  reqStatement() {
    if (this.isExpression()) {
      throw this.err(`macro ${a.show(this)} can only be used as a statement due to JS syntax limitations`)
    }
    return this
  }
}
