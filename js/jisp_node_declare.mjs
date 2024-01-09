import * as jns from './jisp_ns.mjs'
import * as jnu from './jisp_node_use.mjs'

export class Declare extends jnu.Use {
  get NsLive() {return jns.NsLivePseudo}

  async macro() {
    this.reqEveryChildNotCosmetic()
    this.reqChildCount(2)
    await this.reqImport()
    this.reqNsLex().addMixin(await this.reqNsLive())
    return this
  }

  static moduleUrl = import.meta.url
}