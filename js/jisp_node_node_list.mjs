import * as a from '/Users/m/code/m/js/all.mjs'
import * as ji from './jisp_insp.mjs'
import * as jp from './jisp_parent.mjs'
import * as jn from './jisp_node.mjs'

export class NodeList extends jp.MixParentOneToMany.goc(jn.Node) {
  // Override for `MixParent`.
  reqValidChild(val) {return super.reqValidChild(this.reqInst(val, jn.Node))}

  // Override for `MixOwnSpanned`.
  optSpan() {
    return (
      super.optSpan() ??
      this.Span.optRange(this.optFirstChild()?.optSpan(), this.optLastChild()?.optSpan())
    )
  }

  macroImpl() {return this.macroFrom(0)}

  macroFrom(ind) {
    this.req(ind, a.isNat)
    while (ind < this.childCount()) this.macroAt(ind++)
    return this
  }

  macroAt(ind) {
    this.replaceChildAt(ind, this.constructor.macroNodeSync(this.reqChildAt(ind)))
  }

  reqEveryChildNotCosmetic() {
    let ind = 0
    while (ind < this.childCount()) this.reqChildNotCosmeticAt(ind++)
    return this
  }

  reqChildNotCosmeticAt(ind) {
    const val = this.reqChildAt(ind)
    if (val.isCosmetic()) {
      throw this.err(`unexpected cosmetic child node ${a.show(val)} at index ${a.show(ind)} in parent ${a.show(this)}`)
    }
    return val
  }

  [ji.symInsp](tar) {
    tar = super[ji.symInsp](tar)
    if (this.hasChildren()) return tar.funs(this.reqChildArr)
    return tar
  }
}
