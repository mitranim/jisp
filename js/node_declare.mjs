import * as jns from './ns.mjs'
import * as jnu from './node_use.mjs'

export class Declare extends jnu.Use {
  get NsLive() {return jns.NsLivePseudo}

  async macro() {
    this.reqEveryChildNotCosmetic()
    this.reqChildCount(1)
    await this.reqImport()
    this.reqNsLex().addMixin(await this.reqNsLive())
    return this
  }

  static {this.setReprModuleUrl(import.meta.url)}
}
