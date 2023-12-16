import * as a from '/Users/m/code/m/js/all.mjs'
import * as jc from './jisp_conf.mjs'
import * as je from './jisp_err.mjs'

/*
Provides shortcuts for validating child-to-parent relations. Also see `MixChild`
which is used to actually implement child-to-parent relations.

FIXME rename. This implements only child-to-parent validation.
*/
export class MixParent extends a.DedupMixinCache {
  static make(cls) {
    return class MixParent extends je.MixErrer.goc(cls) {
      toValidChild(val) {
        val.setParent(this)
        if (jc.Conf.main.DEBUG) this.reqValidChild(val)
        return val
      }

      reqValidChild(val) {
        const par = val.ownParent()
        if (this !== par) {
          throw this.err(`parent-child mismatch: expected child ${a.show(val)} to have parent ${a.show(this)}, found ${a.show(par)}`)
        }
        return val
      }
    }
  }
}

/*
FIXME use for `NodeList`, `Root`, and possibly more.
*/
export class MixParentOneToMany extends a.DedupMixinCache {
  static make(cls) {
    return class MixParentOneToMany extends MixParent.goc(cls) {
      #chi = undefined
      #initChildren() {return this.#chi ??= []}

      hasChildren() {return this.childCount() > 0}
      childCount() {return this.#chi?.length ?? 0}
      getFirstChild() {return this.#chi?.[0]}
      getLastChild() {return a.last(this.#chi)}
      childIter() {return this.#initChildren().values()}

      clearChildren() {
        const chi = this.#chi
        if (chi) chi.length = 0
        return this
      }

      setChild(val) {
        this.clearChildren()
        if (a.isSome(val)) this.appendChild(val)
        return this
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
    }
  }
}

export class MixParentOneToOne extends a.DedupMixinCache {
  static make(cls) {
    return class MixParentOneToOne extends MixParent.goc(cls) {
      #chi = undefined
      hasChildren() {return a.isSome(this.#chi)}
      childCount() {return Number(this.hasChildren())}
      getFirstChild() {return this.#chi}
      getLastChild() {return this.#chi}

      // FIXME bench compare
      childIter() {return new jm.OptValIter(this.#chi)}
      // *childIter() {if (a.isSome(this.#chi)) yield this.#chi}

      clearChildren() {
        this.#chi = undefined
        return this
      }

      // FIXME validate child-to-parent.
      setChild(val) {
        this.#chi = val
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

      // FIXME validate child-to-parent.
      appendChild(val) {
        if (this.hasChildren()) throw Error(`unable to append child ${a.show(val)} to single-child parent ${a.show(this)} which already has a child`)
        this.#chi = val
        return this
      }

      appendChildren(...val) {
        for (val of val) this.appendChild(val)
        return this
      }
    }
  }
}
