import * as a from '/Users/m/code/m/js/all.mjs'
import * as jc from './conf.mjs'
import * as jm from './misc.mjs'
import * as ji from './insp.mjs'
import * as jp from './parent.mjs'
import * as jn from './node.mjs'

/*
This file defines versions of "parent" mixins with specialized features for
`Node` subclasses, most notably with support for macroing and compiling child
nodes.

Macro-related internals have about 3 times more code than they should, because
we support both synchronous and asynchronous modes, automatically switching
between the two. Async is unavoidable for some macros, most notably `Use` and
`Import`. However, async has huge overheads, so sync is the default.

Macroing stops when a node returns itself. This convention is used by all "nop"
macro implementations such as those on primitive literals. It's also used by
macro implementations that perform side effects without replacing the node,
such as those on identifiers.

Recursive macroing could be implemented either with a loop or with recursive
calls. The current implementation uses recursive calls because in case of
accidental infinite recursion, this causes an immediate stack overflow
exception instead of looping forever, at least in synchronous mode.
*/

export class MixParentNodeOneToOne extends a.DedupMixinCache {
  static make(cls) {
    return class MixParentNodeOneToOne extends MixParentNodeCommon.goc(jp.MixParentOneToOne.goc(cls)) {
      macroFirstChild() {
        const next = jn.macroCall(this.optFirstChild())
        if (a.isPromise(next)) return this.macroFirstChildAsync(next)
        return this.replacedFirstChild(next)?.macroFirstChild() ?? this
      }

      macroFirstChildSync() {
        return (
          undefined
          ?? this.replacedFirstChildSync(jn.macroCallSync(this.optFirstChild()))?.macroFirstChildSync()
          ?? this
        )
      }

      async macroFirstChildAsync(next) {
        return this.replacedFirstChild(await next)?.macroFirstChild() ?? this
      }

      /*
      Implements support for macroing in "representation" mode, which is used
      by the macro `Quote`.
      */
      macroRepr() {
        this.macroReprChildren()
        return super.macroRepr()
      }

      macroReprChildren() {
        return (
          undefined
          ?? this.replacedFirstChildSync(jn.macroReprCall(this.optFirstChild()))?.macroReprChildren()
          ?? this
        )
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

      replacedFirstChild(next) {
        if (a.isPromise(next)) return this.replacedFirstChildAsync(next)
        return this.replacedFirstChildSync(next)
      }

      replacedFirstChildSync(next) {
        const prev = this.optFirstChild()
        if (prev === next) return undefined

        next ??= new jn.Empty()
        this.reqInst(next, jn.Node)

        if (prev) next.setSpan(prev.optSpan())
        return this.setChild(next)
      }

      async replacedFirstChildAsync(next) {
        return this.replacedFirstChildSync(await next)
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
    return class MixParentNodeOneToMany extends MixParentNodeCommon.goc(jp.MixParentOneToMany.goc(cls)) {
      // Override for `MixOwnSpanned`.
      optSpan() {
        return (
          super.optSpan() ??
          this.Span.optRange(this.optFirstChild()?.optSpan(), this.optLastChild()?.optSpan())
        )
      }

      macroFrom(ind) {
        this.req(ind, a.isNat)
        while (ind < this.childCount()) {
          const val = this.macroChildAt(ind++)
          if (a.isPromise(val)) return this.macroFromAsync(ind, val)
        }
        return this
      }

      macroFromSync(ind) {
        this.req(ind, a.isNat)
        while (ind < this.childCount()) this.macroChildAtSync(ind++)
        return this
      }

      async macroFromAsync(ind, val) {
        this.req(ind, a.isNat)
        if (a.isPromise(val)) await val
        while (ind < this.childCount()) {
          val = this.macroChildAt(ind)
          if (a.isPromise(val)) await val
          ind++
        }
        return this
      }

      macroChildAt(ind) {
        const next = jn.macroCall(this.reqChildAt(ind))
        if (a.isPromise(next)) return this.macroChildAtAsync(ind, next)
        return this.replacedChildAt(ind, next)?.macroChildAt(ind) ?? this
      }

      macroChildAtSync(ind) {
        return (
          undefined
          ?? this.replacedChildAt(ind, jn.macroCallSync(this.reqChildAt(ind)))?.macroChildAtSync(ind)
          ?? this
        )
      }

      async macroChildAtAsync(ind, next) {
        return this.replacedChildAt(ind, await next)?.macroChildAt(ind) ?? this
      }

      /*
      Implements support for macroing in "representation" mode, which is used
      by the macro `Quote`.
      */
      macroRepr() {
        this.macroReprChildren()
        return super.macroRepr()
      }

      macroReprChildren() {
        let ind = -1
        while (++ind < this.childCount()) this.macroReprChildAt(ind)
        return this
      }

      macroReprChildAt(ind) {
        return (
          undefined
          ?? this.replacedChildAt(ind, jn.macroReprCall(this.reqChildAt(ind)))?.macroReprChildAt(ind)
          ?? this
        )
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

      reqChildInstAt(ind, cls) {
        const out = this.reqChildAt(ind)
        if (a.isInst(out, cls)) return out
        throw out.err(`${a.show(this)} expected the child node at index ${ind} to be an instance of ${a.show(cls)}, found ${a.show(out)}`)
      }

      optChildInstAt(ind, cls) {
        const out = this.optChildAt(ind)
        if (a.isNil(out)) return undefined
        if (a.isInst(out, cls)) return out
        throw out.err(`${a.show(this)} expected the child node at index ${ind} to be either nil or an instance of ${a.show(cls)}, found ${a.show(out)}`)
      }

      replacedChildAt(ind, next) {
        const prev = this.reqChildAt(ind)
        if (prev === next) return undefined

        next ??= new jn.Empty()
        this.reqInst(next, jn.Node)

        if (prev) next.setSpan(prev.optSpan())
        return this.replaceChildAt(ind, next)
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

class MixParentNodeCommon extends a.DedupMixinCache {
  static make(cls) {
    return class MixParentNodeCommon extends cls {
      // Override for `MixParent`.
      reqValidChild(val) {return super.reqValidChild(this.reqInst(val, jn.Node))}

      // Override for `Node..isChildStatement`.
      isChildStatement(val) {
        super.isChildStatement(val)
        if (jc.conf.getDebug()) this.reqParentChildMatch(val)
        return false
      }
    }
  }
}
