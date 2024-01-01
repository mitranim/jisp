import * as a from '/Users/m/code/m/js/all.mjs'
import * as jm from './jisp_misc.mjs'

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
