import * as a from '/Users/m/code/m/js/all.mjs'
import * as je from './jisp_err.mjs'

/*
Semi-placeholder. Meant for nodes that "reference" another node.

Examples:

  * name -> decl -> use -> module
  * name -> decl -> const -> val
  * name -> decl -> class
  * name -> decl -> const -> val -> class
  * name -> decl -> const -> name -> decl -> class

FIXME either use this consistently, or rip this out. If we use this, the
behavior must be consolidated with the namespace-resolving behavior of `Ident`
and other similar cases. The point of this is to make it possible to track
"aliased" references. For example:

  [use `jisp:prelude` jp]
  [const prelude jp]
  prelude.nil

In this example, we should be able to resolve the `Ident` `prelude` to the
corresponding `Const`, resolve the `Const` to its source expression which is
`Ident` `jp`, and then treat `prelude` exactly like `jp`, meaning that it would
resolve to a "live" value. This aliasing is a simplistic example that doesn't
provide convincing motivation for the feature. However, in the future, we may
detect other use cases.
*/
export class MixRef extends a.DedupMixinCache {
  static make(cls) {
    return class MixRef extends je.MixErrer.goc(cls) {
      /*
      Override in subclass to actually implement referencing. Rules:

        * Objects without a valid reference must return nil.

        * Objects with a valid reference must return that reference.

        * Objects which don't reference themselves, but MAY be referenced by
          others, must return themselves. This acts as termination signal for
          recursive search.
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
