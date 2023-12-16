import * as a from '/Users/m/code/m/js/all.mjs'
import * as ji from './jisp_insp.mjs'
import * as jp from './jisp_parent.mjs'
import * as jn from './jisp_node.mjs'

export class NodeList extends jp.MixParentOneToMany.goc(jn.Node) {
  // Override for `MixParent`.
  reqValidChild(val) {return super.reqValidChild(this.reqInst(val, jn.Node))}

  optSpan() {
    return (
      super.optSpan() ??
      this.Span.optRange(this.optFirstChild()?.optSpan(), this.optLastChild()?.optSpan())
    )
  }

  macroFrom(ind) {
    this.req(ind, a.isNat)
    while (ind < this.childCount()) this.macroAt(ind++)
    return this
  }

  macroAt(ind) {
    this.replaceChildAt(ind, jn.Node.macroNode(this.reqChildAt(ind)))
  }

  [ji.symInsp](tar) {
    tar = super[ji.symInsp](tar)
    if (this.hasChildren()) return tar.funs(this.childArr)
    return tar
  }
}
