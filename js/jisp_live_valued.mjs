import * as a from '/Users/m/code/m/js/all.mjs'
import * as jm from './jisp_misc.mjs'

/*
Unused, TODO drop.

For contextual access such as supported by the orphan form of `IdentAccess`, we
use `MixLiveValuedInner` instead of this, because the method `.optLiveVal` of
this mixin results in an interface collision. When this mixin is used by nodes
that also create declarations, such as `Const` or `Func`, the resulting
declarations are automatically considered "live", and any attempts to use
dot-access with identifiers referring to such declarations are treated as
attempts to use live values, making it impossible to represent runtime
dot-access on those values.
*/
export class MixLiveValued extends a.DedupMixinCache {
  static make(cls) {
    return class MixLiveValued extends cls {
      #liveVal = undefined
      optLiveVal() {return this.initLiveVal() ?? this.constructor.optLiveVal()}
      initLiveVal() {return this.#liveVal ??= this.makeLiveVal?.()}

      static optLiveVal() {return this.initLiveVal()}

      static initLiveVal() {
        jm.own(this, `liveVal`)
        return this.liveVal ??= this.makeLiveVal?.()
      }
    }
  }
}

export class MixLiveValuedInner extends a.DedupMixinCache {
  static make(cls) {
    return class MixLiveValuedInner extends cls {
      #liveValInner = undefined
      optLiveValInner() {return this.initLiveValInner() ?? this.constructor.optLiveValInner()}
      initLiveValInner() {return this.#liveValInner ??= this.makeLiveValInner?.()}

      static optLiveValInner() {return this.initLiveValInner()}

      static initLiveValInner() {
        jm.own(this, `liveValInner`)
        return this.liveValInner ??= this.makeLiveValInner?.()
      }
    }
  }
}
