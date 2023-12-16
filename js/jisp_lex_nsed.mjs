import * as a from '/Users/m/code/m/js/all.mjs'
import * as jp from './jisp_parent.mjs'
import * as jns from './jisp_ns.mjs'

export class MixLexNsed extends a.DedupMixinCache {
  static make(cls) {
    return class MixLexNsed extends jp.MixParent.goc(cls) {
      get LexNs() {return jns.Ns}
      #lexNs = undefined
      setLexNs(val) {return this.#lexNs = this.reqInst(val, this.LexNs).setParent(this), this}
      ownLexNs() {return this.#lexNs ??= this.makeLexNs().setParent(this)}
      optLexNs() {return this.#lexNs}
      makeLexNs() {return new this.LexNs()}
    }
  }
}
