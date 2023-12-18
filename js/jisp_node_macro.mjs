import * as a from '/Users/m/code/m/js/all.mjs'
import * as jn from './jisp_node.mjs'

/*
Base class for `Node` subclasses that are intended to replace other nodes during
compile-time macroing, typically as a result of being referenced via `Ident`.
*/
export class Macro extends jn.Node {
  // TODO consider automatically using `Node.macroSrcCls`, which is overridden
  // by some "macro" node classes.
  reqSrcInst(cls) {
    const src = this.optSrcNode()
    if (a.isInst(src, cls)) return src
    throw this.err(`macro ${a.show(this)} requires the source node to be an instance of ${a.show(cls)}, got ${a.show(src)}`)
  }

  reqStatement() {
    if (this.isExpression()) {
      throw this.err(`macro ${a.show(this)} can only be used as a statement`)
    }
    return this
  }
}
