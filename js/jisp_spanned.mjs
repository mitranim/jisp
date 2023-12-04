import * as a from '/Users/m/code/m/js/all.mjs'
import * as je from './jisp_err.mjs'
import * as js from './jisp_span.mjs'

export class MixOwnSpanned extends a.DedupMixinCache {
  static make(cls) {
    return class MixOwnSpanned extends je.MixErrer.goc(cls) {
      #span = undefined
      setSpan(val) {return this.#span = this.reqInst(val, this.Span), this}
      ownSpan() {return this.#span}
      optSpan() {return this.#span}
      reqSpan() {return this.optSpan() ?? this.throw(`missing span at ${a.show(this)}`)}
      initSpan() {return this.#span ??= new this.Span()}

      decompile() {return decompile(this.optSpan())}
      get Span() {return this.constructor.Span}
      static get Span() {return js.Span}
    }
  }
}
