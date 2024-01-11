import * as a from '/Users/m/code/m/js/all.mjs'
import * as jm from './jisp_misc.mjs'
import * as ji from './jisp_insp.mjs'
import * as jp from './jisp_parent.mjs'
import * as jn from './jisp_node.mjs'

export class MixParentNodeOneToOne extends a.DedupMixinCache {
  static make(cls) {
    return class MixParentNodeOneToOne extends jp.MixParentOneToOne.goc(cls) {
      // Override for `MixParent`.
      reqValidChild(val) {return super.reqValidChild(this.reqInst(val, jn.Node))}

      /*
      Implements support for macroing in "representation" mode, which is used
      by the macro `Quote`.
      */
      macroRepr() {
        const chi = this.optFirstChild()
        if (chi) this.setChild(jn.reqMacroReprNode(chi))
        return super.macroRepr()
      }

      /*
      Implements support for compiling in "representation" mode, which is used
      by the macro `Quote`.
      */
      compileRepr() {
        let out = a.reqValidStr(super.compileRepr())
        const chi = this.optFirstChild()
        if (chi) out += `.setChild(${jn.reqCompileReprNode(chi)})`
        return out
      }

      // Override for `Node..mapChildrenDeep`.
      mapChildrenDeep(fun) {
        a.reqFun(fun)
        const chi = this.optFirstChild()
        if (a.isSome(chi)) this.setChild(fun(chi))
        return this
      }

      [ji.symInsp](tar) {
        tar = super[ji.symInsp](tar)
        if (this.hasChildren()) return tar.funs(this.optFirstChild)
        return tar
      }
    }
  }
}

export class MixParentNodeOneToMany extends a.DedupMixinCache {
  static make(cls) {
    return class MixParentNodeOneToMany extends jp.MixParentOneToMany.goc(cls) {
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

      /*
      Implements support for macroing in "representation" mode, which is used
      by the macro `Quote`.
      */
      macroRepr() {
        let ind = -1
        while (++ind < this.childCount()) {
          this.replaceChildAt(ind, jn.reqMacroReprNode(this.reqChildAt(ind)))
        }
        return super.macroRepr()
      }

      /*
      Implements support for compiling in "representation" mode, which is used
      by the macro `Quote`.
      */
      compileRepr() {
        let out = a.reqValidStr(super.compileRepr())
        const val = a.map(this.optChildArr(), jn.reqCompileReprNode).join(`, `)
        if (val) out += `.setChildren(${val})`
        return out
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

      // Override for `Node..mapChildrenDeep`.
      mapChildrenDeep(fun) {return this.mapChildrenDeepFrom(fun, 0)}

      mapChildrenDeepFrom(fun, ind) {
        a.reqFun(fun)
        a.reqNat(ind)
        while (ind < this.childCount()) {
          this.replaceChildAt(ind, fun(this.reqChildAt(ind++)))
        }
        return this
      }

      [ji.symInsp](tar) {
        tar = super[ji.symInsp](tar)
        if (this.hasChildren()) return tar.funs(this.optChildArr)
        return tar
      }
    }
  }
}
