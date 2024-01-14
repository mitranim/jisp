import * as a from '/Users/m/code/m/js/all.mjs'
import * as je from './err.mjs'
import * as jsp from './span.mjs'

export class MixOwnSpanned extends a.DedupMixinCache {
  static make(cls) {
    return class MixOwnSpanned extends je.MixErrer.goc(cls) {
      // Override in subclass.
      get Span() {return jsp.Span}

      #span = undefined
      setSpan(val) {return this.#span = this.reqInst(val, this.Span), this}
      ownSpan() {return this.#span}
      optSpan() {return this.#span}
      initSpan() {return this.#span ??= new this.Span()}
      initSpanWith(...src) {return this.initSpan().init(...src), this}
      initSpanFrom(src) {return this.initSpan().setFrom(src), this}

      /*
      This uses `.optSpan`, not `.ownSpan`, because some of our `Node`
      classes override/extend `.optSpan` to sometimes generate a span
      from a range of other nodes they have access to.
      */
      reqSpan() {return this.optSpan() ?? this.throw(`missing span at ${a.show(this)}`)}
    }
  }
}
