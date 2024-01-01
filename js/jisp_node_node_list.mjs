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

  /*
  This class should avoid defining `.macro`. It should use `Node`'s default
  implementation that throws an exception. That's because different subclasses
  of this class have different notions of how macroing should work. Having a
  working default implementation would produce unexpected or confusing behavior
  when a subclass doesn't have a sensible override. This is particularly
  notable for subclasses of `ListMacro`.

  macro() {throw this.errMeth(`macro`)}
  */

  /*
  This should run synchronously by default, but automatically switch into async
  mode when a child node's `.macro` method returns a promise. We want
  synchronicity by default because async / await has huge overheads, but we
  must support async macroing because it's unavoidable for some macros,
  starting with `Use`.
  */
  macroFrom(ind) {
    this.req(ind, a.isNat)

    while (ind < this.childCount()) {
      const val = jn.macroNode(this.reqChildAt(ind))
      if (a.isPromise(val)) return this.macroAsyncWith(ind, val)
      this.replaceChildAt(ind, val)
      ind++
    }

    return this
  }

  macroSyncFrom(ind) {
    this.req(ind, a.isNat)
    while (ind < this.childCount()) this.macroSyncAt(ind++)
    return this
  }

  async macroAsyncFrom(ind) {
    this.req(ind, a.isNat)
    while (ind < this.childCount()) await this.macroAsyncAt(ind++)
    return this
  }

  async macroAsyncWith(ind, val) {
    this.replaceChildAt(ind, await val)
    return this.macroAsyncFrom(ind + 1)
  }

  macroAt(ind) {
    const val = jn.macroNode(this.reqChildAt(ind))
    if (a.isPromise(val)) return this.replaceChildAsyncAt(ind, val)
    this.replaceChildAt(ind, val)
    return this
  }

  macroSyncAt(ind) {
    this.replaceChildAt(ind, jn.macroNodeSync(this.reqChildAt(ind)))
    return this
  }

  async macroAsyncAt(ind) {
    this.replaceChildAt(ind, await jn.macroNode(this.reqChildAt(ind)))
    return this
  }

  async replaceChildAsyncAt(ind, val) {return this.replaceChildAt(ind, await val)}

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
