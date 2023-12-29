import * as a from '/Users/m/code/m/js/all.mjs'
import * as jc from './jisp_conf.mjs'
import * as je from './jisp_err.mjs'

/*
Provides shortcuts for validating child-to-parent relations. Also see
`MixParentOneToMany` and `MixParentOneToOne` which actually implement
parent-to-child relations. Also see `MixChild` which implements
child-to-parent relations.
*/
export class MixParent extends a.DedupMixinCache {
  static make(cls) {
    return class MixParent extends je.MixErrer.goc(cls) {
      toValidChild(val) {
        val.setParent(this)
        this.reqValidChild(val)
        return val
      }

      reqValidChild(val) {
        if (jc.conf.getDebug()) return this.reqChildParentMatch(val)
        return val
      }

      reqChildParentMatch(val) {
        const par = val.ownParent()
        if (par !== this) {
          throw this.err(`parent-child mismatch: expected child ${a.show(val)} to have parent ${a.show(this)}, found ${a.show(par)}`)
        }
        return val
      }
    }
  }
}

/*
FIXME use for `NodeList`, `Root`, and possibly more.

TODO consider support for splicing, like `DocumentFragment`.

Known issue: unlike the DOM API, this does not ensure that a child only ever
belongs to one parent. This parent may even contain multiple references to the
same child. For now, it's unclear whether we care.
*/
export class MixParentOneToMany extends a.DedupMixinCache {
  static make(cls) {
    return class MixParentOneToMany extends MixParentCommon.goc(MixParent.goc(cls)) {
      #chi = undefined
      #initChildren() {return this.#chi ??= []}

      hasChildren() {return this.childCount() > 0}
      childCount() {return this.#chi?.length ?? 0}
      childIter() {return this.#initChildren().values()}

      hasOnlyChild(val) {
        const tar = this.#chi
        return !!tar && tar.length === 1 && tar[0] === val
      }

      optChildAt(ind) {return this.#chi?.[this.req(ind, a.isInt)]}
      optFirstChild() {return this.#chi?.[0]}
      optLastChild() {return a.last(this.#chi)}

      clearChildren() {
        const chi = this.#chi
        if (chi) chi.length = 0
        return this
      }

      setChild(val) {
        if (this.hasOnlyChild(val)) return this
        return this.clearChildren().appendChild(val)
      }

      setChildren(...val) {
        val.forEach(this.toValidChild, this)
        this.#chi = val
        return this
      }

      appendChild(val) {
        this.toValidChild(val)
        this.#initChildren().push(val)
        return this
      }

      appendChildren(...val) {
        val.forEach(this.toValidChild, this)

        const tar = this.#chi
        if (tar) tar.push(...val)
        else this.#chi = val

        return this
      }

      replaceChildAt(ind, val) {
        this.req(ind, a.isInt)
        this.toValidChild(val)

        const tar = this.#chi
        if (!tar || a.isNil(tar[ind])) {
          throw this.err(`unable to replace child at index ${a.show(ind)} in parent ${a.show(this)}: no existing child at this index`)
        }

        tar[ind] = val
      }

      /*
      Blatant abstraction leak. Allows callers to perform array-specific
      operations on children, or to iterate more efficiently. If we cared more
      about safety against errant callers, this would make a shallow copy of
      the original array, but that would also penalize performance elsewhere.
      */
      reqChildArr() {return this.#initChildren()}
      optChildArr() {return this.#chi}

      setChildArr(val) {
        this.#chi = this.opt(val, a.isTrueArr)
        if (val) for (val of val) this.toValidChild(val)
        return this
      }

      /*
      This has "opt" in the name because we could also define a method
      `.reqChildSlice` which would validate that the exact start and next
      indexes are actually present in the child list, producing a return value
      with the length equal to `next - start`. This name doesn't mean that the
      output could be nil; the output is always an array.
      */
      optChildSlice(start, next) {
        this.opt(start, a.isNat)
        this.opt(next, a.isNat)
        return this.#chi?.slice(...arguments) ?? []
      }
    }
  }
}

export class MixParentOneToOne extends a.DedupMixinCache {
  static make(cls) {
    return class MixParentOneToOne extends MixParentCommon.goc(MixParent.goc(cls)) {
      #chi = undefined

      hasChildren() {return this.childCount() > 0}
      childCount() {return a.isSome(this.#chi) ? 1 : 0}

      *childIter() {
        const val = this.#chi
        if (a.isSome(val)) yield val
      }

      hasOnlyChild(val) {return a.isSome(val) && this.#chi === val}

      optChildAt(ind) {
        this.req(ind, a.isInt)
        return ind === 0 ? this.#chi : undefined
      }

      optFirstChild() {return this.#chi}
      optLastChild() {return this.#chi}

      clearChildren() {
        this.#chi = undefined
        return this
      }

      setChild(val) {
        this.#chi = this.toValidChild(val)
        return this
      }

      setChildren(...val) {
        const len = val.length
        switch (len) {
          case 0: return this.clearChildren()
          case 1: return this.setChild(val)
          default: throw Error(`unable to set ${a.show(len)} children at single-child parent ${a.show(this)}`)
        }
      }

      appendChild(val) {
        if (this.hasChildren()) throw Error(`unable to append child ${a.show(val)} to single-child parent ${a.show(this)} which already has a child`)
        return this.setChild(val)
      }

      appendChildren(...val) {
        for (val of val) this.appendChild(val)
        return this
      }

      replaceChildAt(ind, next) {
        const prev = this.optChildAt(ind)

        if (a.isNil(prev)) {
          throw this.err(`unable to replace child at index ${a.show(ind)} in parent ${a.show(this)}: no existing child at this index`)
        }

        if (prev === next) return
        this.setChild(next)
      }
    }
  }
}

/*
For internal use. This is private because we apply mixins in the "wrong" order.
From the perspective of static typing, this mixin is invalid because it's trying
to use methods which are not defined on its superclass.
*/
class MixParentCommon extends a.DedupMixinCache {
  static make(cls) {
    return class MixParentCommon extends cls {
      hasChildAt(ind) {return a.isSome(this.optChildAt(ind))}

      reqChildAt(ind) {
        return (
          this.optChildAt(ind) ??
          this.throw(`missing child at index ${a.show(ind)} in parent ${a.show(this)}`)
        )
      }

      reqFirstChild() {
        return (
          this.optFirstChild() ??
          this.throw(`missing first child in parent ${a.show(this)}`)
        )
      }

      reqLastChild() {
        return (
          this.optLastChild() ??
          this.throw(`missing last child in parent ${a.show(this)}`)
        )
      }

      setChildOpt(val) {
        if (a.isNil(val)) return this.clearChildren()
        return this.setChild(val)
      }

      reqChildCount(exp) {
        this.req(exp, a.isNat)
        const len = this.childCount()
        if (exp !== len) {
          throw this.err(`${a.show(this)} expected exactly ${exp} children, got ${len} children`)
        }
        return this
      }

      reqChildCountMin(exp) {
        this.req(exp, a.isNat)
        const len = this.childCount()
        if (!(exp <= len)) {
          throw this.err(`${a.show(this)} expected at least ${exp} children, got ${len} children`)
        }
        return this
      }

      reqChildCountMax(exp) {
        this.req(exp, a.isNat)
        const len = this.childCount()
        if (!(len <= exp)) {
          throw this.err(`${a.show(this)} expected no more than ${exp} children, got ${len} children`)
        }
        return this
      }

      reqChildCountBetween(min, max) {
        this.req(min, a.isNat)
        this.req(max, a.isNat)
        const len = this.childCount()
        if (!(min <= len) || !(len <= max)) {
          throw this.err(`${a.show(this)} expected between ${min} and ${max} children, got ${len} children`)
        }
        return this
      }
    }
  }
}
