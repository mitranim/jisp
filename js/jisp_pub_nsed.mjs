import * as a from '/Users/m/code/m/js/all.mjs'
import * as jp from './jisp_parent.mjs'
import * as jns from './jisp_ns.mjs'

export class MixPubNsed extends a.DedupMixinCache {
  static make(cls) {
    return class MixPubNsed extends jp.MixParent.goc(cls) {
      get PubNs() {return jns.Ns}
      #pubNs = undefined
      setPubNs(val) {return this.#pubNs = this.reqInst(val, this.PubNs).setParent(this), this}
      ownPubNs() {return this.#pubNs ??= this.makePubNs().setParent(this)}
      optPubNs() {return this.#pubNs}
      makePubNs() {return new this.PubNs()}
    }
  }
}
