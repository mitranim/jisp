import * as jns from './jisp_ns.mjs'
import * as jnu from './jisp_node_use.mjs'
import * as jnib from './jisp_node_import_base.mjs'

export class DeclareFrom extends jnib.ImportBase {
  async macroImpl() {
    this.reqEveryChildNotCosmetic()
    this.reqChildCount(2)
    this.reqNsLex().addMixin(await this.initNs())
    return this
  }

  async initNs() {
    await this.resolve()
    await this.ready()
    return new NsLiveFake().setVal(await import(this.reqTarPathAbs()))
  }

  compile() {return jnu.Use.prototype.compile.call(this)}
}

class NsLiveFake extends jns.NsLive {
  isLive() {return false}
}
