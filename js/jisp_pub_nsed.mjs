import * as a from '/Users/m/code/m/js/all.mjs'
import * as jp from './jisp_parent.mjs'
import * as jns from './jisp_ns.mjs'

export class MixPubNsed extends a.DedupMixinCache {
  static make(cls) {
    return class MixPubNsed extends jp.MixParent.goc(cls) {
      #pubNs = undefined
      setPubNs(val) {return this.#pubNs = this.toValidChild(this.reqInst(val, jns.Ns)), this}
      ownPubNs() {return this.#pubNs ??= this.toValidChild(this.makePubNs())}
      optPubNs() {return this.#pubNs}
      makePubNs() {return new jns.Ns()}
    }
  }
}
