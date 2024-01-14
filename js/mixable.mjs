import * as a from '/Users/m/code/m/js/all.mjs'
import * as jc from './conf.mjs'
import * as je from './err.mjs'

/*
Used for combining namespaces. See `NsLex`. This tool implements some relevant
shortcuts in a somewhat generalized form.
*/
export class MixMixable extends a.DedupMixinCache {
  static make(cls) {
    return class MixMixable extends je.MixErrer.goc(cls) {
      #mixins = undefined
      initMixins() {return this.#mixins ??= new Set()}
      optMixins() {return this.#mixins}
      hasMixins() {return this.#mixins?.size > 0}
      hasMixin(val) {return !!this.#mixins?.has(val)}

      addMixin(val) {
        if (this.hasMixin(val)) return this
        this.initMixins().add(this.reqValidMixin(val))
        return this
      }

      // Override in subclass.
      // Known limitation: shallow, doesn't check mixins of mixins.
      reqValidMixin(val) {
        if (!jc.conf.getDebug()) return val
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
