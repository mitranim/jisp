import * as a from '/Users/m/code/m/js/all.mjs'
import * as jp from './jisp_parent.mjs'
import * as jns from './jisp_ns.mjs'

export class MixLexNsed extends a.DedupMixinCache {
  static make(cls) {
    return class MixLexNsed extends jp.MixParent.goc(cls) {
      #lexNs = undefined
      setLexNs(val) {return this.#lexNs = this.toValidChild(this.reqInst(val, jns.Ns)), this}
      ownLexNs() {return this.#lexNs ??= this.toValidChild(this.makeLexNs())}
      optLexNs() {return this.#lexNs}
      makeLexNs() {return new jns.Ns()}
    }
  }
}
