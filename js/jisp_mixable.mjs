import * as a from '/Users/m/code/m/js/all.mjs'
import * as jc from './jisp_conf.mjs'
import * as je from './jisp_err.mjs'

/*
Used for stacking namespaces via star-imports. When a file uses multiple
star-imports, then to resolve any given unqualified name, we must search for
that name in every star-imported namespace. This base class implements storage
and some utility methods for such a feature, in a somewhat generalized form
that could also be used for other similar concepts.
*/
export class MixMixable extends a.DedupMixinCache {
  static make(cls) {
    return class MixMixable extends je.MixErrer.goc(cls) {
      #mixins = undefined
      ownMixins() {return this.#mixins ??= []}
      optMixins() {return this.#mixins}
      hasMixins() {return !!this.#mixins?.length}
      setMixins(val) {return this.#mixins = this.req(val, a.isTrueArr), this}
      hasMixin(val) {return !!this.#mixins?.includes(val)}

      addMixin(val) {
        this.validMixin(val)
        if (this.hasMixin(val)) return this
        this.ownMixins().push(val)
        return this
      }

      // Override in subclass.
      // Known limitation: shallow, doesn't check mixins of mixins.
      validMixin(val) {
        if (!jc.Conf.main.DEBUG) return val

        if (val === this) {
          throw this.err(`${a.show(this)} is not allowed to be its own mixin`)
        }
        if (this.hasMixin(val)) {
          throw this.err(`${a.show(this)} already has mixin ${a.show(val)}`)
        }
        return val
      }
    }
  }
}