import * as a from '/Users/m/code/m/js/all.mjs'
import * as ji from './jisp_insp.mjs'
import * as jnt from './jisp_node_text.mjs'
import * as jv from './jisp_valued.mjs'

/*
TODO:

  * Consider supporting arbitrary radix.
    * Possible syntax (from Clojure):
      * `2r01`
      * `10r0123456789`
      * `16r0123456789abcdef`
    * May define a subclass with arbitrary radix support, and leave `Num` for
      the default case of implicit radix 10.
  * Consider separate classes and parsing for float literals (naming "float" or
    "fract") and integer literals (naming "int").

TODO: support for JS bigints (new node class).
*/
export class Num extends jv.MixOwnValued.goc(jnt.Text) {
  static regexp() {return /^-?\d+(_\d+)*(?:[.]\d+(_\d+)*)?(?![\w$])/}

  macro() {return this}

  compile() {return this.decompile()}

  setVal(val) {return super.setVal(this.req(val, a.isFin))}

  ownVal() {
    if (a.isNil(super.ownVal())) {
      this.setVal(this.constructor.parseFloat(this.reqDecompileOwn()))
    }
    return super.ownVal()
  }

  static parseFloat(src) {
    a.reqStr(src)
    // Workaround for the lack of underscore support in `Number.parseFloat`.
    if (src.includes(`_`)) src = src.replace(/_/g, ``)
    return Number.parseFloat(src)
  }

  static reprModuleUrl = import.meta.url;

  [ji.symInsp](tar) {return super[ji.symInsp](tar).funs(this.ownVal)}
}
