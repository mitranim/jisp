import * as a from '/Users/m/code/m/js/all.mjs'
import * as jm from './jisp_misc.mjs'
import * as je from './jisp_err.mjs'
import * as jsp from './jisp_span.mjs'

export class MixOwnSpanned extends a.DedupMixinCache {
  static make(cls) {
    return class MixOwnSpanned extends je.MixErrer.goc(cls) {
      get Span() {return jsp.Span}
      #span = undefined
      setSpan(val) {return this.#span = this.reqInst(val, this.Span), this}
      ownSpan() {return this.#span}
      optSpan() {return this.#span}
      reqSpan() {return this.optSpan() ?? this.throw(`missing span at ${a.show(this)}`)}
      initSpan() {return this.#span ??= new this.Span()}
      decompile() {return a.laxStr(this.optSpan()?.decompile())}
    }
  }
}
