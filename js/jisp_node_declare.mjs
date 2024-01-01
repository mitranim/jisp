import * as jns from './jisp_ns.mjs'
import * as jnu from './jisp_node_use.mjs'
import * as jnib from './jisp_node_import_base.mjs'

export class Declare extends jnib.ImportBase {
  get NsLive() {return jns.NsLivePseudo}

  async macro() {
    this.reqStatement()
    this.reqEveryChildNotCosmetic()
    this.reqChildCount(2)
    await this.reqImport()
    this.reqNsLex().addMixin(await this.reqNsLive())
    return this
  }

  compile() {return jnu.Use.prototype.compile.call(this)}
}
