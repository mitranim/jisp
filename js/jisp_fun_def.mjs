import * as a from '/Users/m/code/m/js/all.mjs'
import * as jv from './jisp_valued.mjs'
import * as jd from './jisp_def.mjs'

export class FunDef extends jv.MixOwnValued.goc(jd.Def) {
  setVal(val) {return super.setVal(this.req(val, a.isFun))}
  macroNode(node) {return this.macroNodeWith(node, this.ownVal())}
}
