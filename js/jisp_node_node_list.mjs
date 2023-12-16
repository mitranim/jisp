import * as a from '/Users/m/code/m/js/all.mjs'
import * as jp from './jisp_parent.mjs'
import * as jn from './jisp_node.mjs'

export class NodeList extends jp.MixParentOneToMany.goc(jn.Node) {
  /*
  TODO enable if we want this. Probably not.

  [Symbol.iterator]() {return this.childIter()}

  // Secret interface in `@mitranim/js`.`iter.mjs`.
  toArray() {return this.childArr()}
  */

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
}
