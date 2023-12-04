import * as a from '/Users/m/code/m/js/all.mjs'
import * as je from './jisp_err.mjs'

/*
Useful for nodes that "reference" another node. The most typical use case is an
identifier that must be resolved to a declaration somewhere else.
*/
export class MixRef extends a.DedupMixinCache {
  static make(cls) {
    return class MixRef extends je.MixErrer.goc(cls) {
      /*
      Override in subclass.

      Some `Node` and `Def` types are considered "references", and
      may "dereference" into another object responsible for the value of the
      given node or definition. This allows us to trace from usage sites to
      original definitions or declarations. Rules:

        * Objects without a valid reference must return nil.

        * Objects with a valid reference must return that reference.

        * Objects which don't reference themselves, but MAY be referenced by
          others, must return themselves. This acts as termination signal for
          recursive search.

      Examples:

        * name -> def -> use -> module
        * name -> def -> const -> val
        * name -> def -> class
        * name -> def -> const -> val -> class
        * name -> def -> const -> name -> def -> class
      */
      ownDeref() {return this}

      // Recursive version of `.ownDeref`.
      optDeref() {
        let tar = this
        while (tar) {
          const val = ownDeref(tar)
          if (val === tar) return tar
          tar = val
        }
        return tar
      }

      reqDeref() {
        return (
          this.optDeref() ??
          this.throw(`missing dereference at ${a.show(this)}`)
        )
      }
    }
  }
}

function ownDeref(src) {
  return a.isObj(src) && `ownDeref` in src ? src.ownDeref() : undefined
}
