import * as a from '/Users/m/code/m/js/all.mjs'
import * as jnt from './jisp_node_text.mjs'
import * as jv from './jisp_valued.mjs'

/*
FIXME support:

  * `IntBin`
  * `BigIntBin`
  * `FracBin`
  * `IntOct`
  * `BigIntOct`
  * `FracOct`
  * `IntDec`
  * `BigIntDec`
  * `FracDec`
  * `IntHex`
  * `BigIntHex`
  * `FracHex`
*/
export class Num extends jv.MixOwnValued.goc(jnt.Text) {
  static reg() {return /^-?\d+(_\d+)*(?:[.]\d+(_\d+)*)?(?![\w$])/}

  ownVal() {return super.ownVal() ?? NaN}
  setVal(val) {return super.setVal(this.req(val, a.isFin))}

  fromMatch(mat) {
    super.fromMatch(mat)
    this.setVal(this.constructor.parseFloat(a.reqStr(mat[0])))
    return this
  }

  macro() {return this}
  compile() {return this.decompile()}

  // Workaround for the lack of underscore support in `Number.parseFloat`.
  static parseFloat(src) {
    a.reqStr(src)
    if (src.includes(`_`)) src = src.replace(/_/g, ``)
    return Number.parseFloat(src)
  }

  [ji.symInspMod](tar) {return super[ji.symInspMod](tar).funs(this.ownVal)}
}
